'use server'

import { auth, currentUser } from '@clerk/nextjs/server'

import logger from '@/lib/logger'
import { stripe } from '@/lib/stripe'
import { absoluteUrl } from '@/lib/utils'
import { getUserSubscription } from '@/db/queries'
import { SUBSCRIPTION_PRICE } from '@/lib/constants'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

const returnUrl = absoluteUrl('/shop')

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'

export const createStripeUrl = async () => {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) throw new Error('Unauthorized')

  const userSubscription = await getUserSubscription()

  logger.info('userSubscription', userSubscription)

  if (
    userSubscription &&
    userSubscription.paymentMethod === 'stripe' &&
    userSubscription.stripeSubscriptionDetails
  ) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeSubscriptionDetails.stripeCustomerId,
      return_url: returnUrl,
    })

    return { data: stripeSession.url }
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.emailAddresses[0].emailAddress,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Degenlingo Premium',
            description: 'Unlimited Hearts',
          },
          unit_amount: 2000, //20USD
          recurring: {
            interval: 'month',
          },
        },
      },
    ],
    metadata: {
      userId,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  })

  return { data: stripeSession.url }
}

export const initiateSolanaPayment = async (publicKey: string) => {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) throw new Error('Unauthorized')

  const receiver = new PublicKey(process.env.PROJECT_SUBSCRIPTION_WALLET!)
  const solPrice = await getSolanaPrice()
  if (!solPrice) {
    throw new Error('Could not fetch Solana price.')
  }

  const solAmount = SUBSCRIPTION_PRICE / solPrice
  const solAmountLamports = Math.floor(solAmount * LAMPORTS_PER_SOL)

  logger.info('Solana price', {
    solAmount,
    solPrice,
    typeofSolAmount: typeof solAmount,
    solAmountLamports,
  })

  const sender = new PublicKey(publicKey)
  const reference = new Keypair().publicKey
  const memo = `Purchase of Degenlingo Premium - Ref: ${reference.toBase58()}`

  const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: receiver,
      lamports: Number(solAmountLamports),
    }),
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: reference,
      lamports: 0,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(memo, 'utf8'),
      keys: [{ pubkey: sender, isSigner: true, isWritable: true }],
    }),
  )

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash
  transaction.feePayer = sender

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })
  const transactionBase64 = serializedTransaction.toString('base64')

  logger.info('Transaction', {
    transactionBase64,
    reference: reference.toBase58(),
    expectedSolAmount: solAmount.toFixed(9),
  })

  return {
    transactionBase64,
    reference: reference.toBase58(),
    expectedSolAmount: solAmount.toFixed(9),
  }
}

const getSolanaPrice = async (): Promise<number | null> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    )
    const data = await response.json()
    return data?.solana?.usd || null
  } catch (error) {
    logger.error('Error fetching SOL price:', error)
    return null
  }
}
