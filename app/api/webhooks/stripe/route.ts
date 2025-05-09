import Stripe from 'stripe'
import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import logger from '@/lib/logger'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { userSubscription } from '@/db/schema'

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

    await db.insert(userSubscription).values({
      userId: session?.metadata?.userId,
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

    await db
      .update(userSubscription)
      .set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id))
  }

  return NextResponse.json(null, { status: 200 })
}
