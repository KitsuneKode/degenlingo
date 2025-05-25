import Stripe from 'stripe'
import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import logger from '@/lib/logger'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripeSubscriptionDetails, userSubscription } from '@/db/schema'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: unknown) {
    return NextResponse.json(
      {
        'Weekhook error': (err as Error).message,
      },
      { status: 400 },
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    )

    if (!session?.metadata?.userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    logger.info('User subscription created', subscription)

    const userSubscriptionData = await db
      .insert(userSubscription)
      .values({
        userId: session?.metadata?.userId,
        paymentMethod: 'stripe',
        subscriptionStatus: 'active',
        subscriptionStart: new Date(
          subscription.items.data[0].current_period_start,
        ),
        subscriptionEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      })
      .returning({ id: userSubscription.id })

    await db.insert(stripeSubscriptionDetails).values({
      userSubscriptionId: userSubscriptionData[0].id,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000,
      ),
    })
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    )

    logger.info('User subscription updated', subscription)

    const stripeSubscriptionDetailsData = await db
      .update(stripeSubscriptionDetails)
      .set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      })
      .where(
        eq(stripeSubscriptionDetails.stripeSubscriptionId, subscription.id),
      )
      .returning({ subscriptionId: stripeSubscriptionDetails.id })

    await db
      .update(userSubscription)
      .set({
        subscriptionEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      })
      .where(
        eq(
          userSubscription.id,
          stripeSubscriptionDetailsData[0].subscriptionId,
        ),
      )
  }

  return NextResponse.json(null, { status: 200 })
}
