'use server'

import db from '@/db/drizzle'
import logger from '@/lib/logger'
import { and, eq } from 'drizzle-orm'
import { checkWallet } from '@/lib/roles'
import { revalidatePath } from 'next/cache'
import { Commitment } from '@solana/web3.js'
import { reduceTokens } from '@/actions/user-progress'
import { auth, currentUser } from '@clerk/nextjs/server'
import { solanaSubscriptionDetails, userSubscription } from '@/db/schema'
import {
  SUBSCRIPTION_DURATION,
  SUBSCRIPTION_NFT_MINT_FEE_TOKEN,
} from '@/lib/constants'

export const upsertSolanaSubcription = async (
  pubKey: string,
  reference: string,
  solAmount: string,
  signature: string,
  status: Commitment,
) => {
  const { userId } = await auth()

  const user = await currentUser()

  if (!userId || !user) throw new Error('Unauthorized')

  const checkWalletResult = checkWallet(pubKey)

  if (!checkWalletResult) {
    throw new Error('Wallet mismatch')
  }

  if (status === 'confirmed') {
    logger.info('User subscription updated by solana', {
      userId,
      pubKey,
      reference,
      solAmount,
      signature,
    })

    await db.transaction(async (tx) => {
      const userSubscriptionData = await tx
        .update(userSubscription)
        .set({
          subscriptionStatus: 'active',
        })
        .where(eq(userSubscription.userId, userId))
        .returning({ id: userSubscription.id })

      await tx
        .update(solanaSubscriptionDetails)
        .set({
          solanaTransactionStatus: status,
        })
        .where(
          and(
            eq(solanaSubscriptionDetails.reference, reference),
            eq(
              solanaSubscriptionDetails.userSubscriptionId,
              userSubscriptionData[0].id,
            ),
          ),
        )
    })
    revalidatePath('/tokens')

    return
  }

  logger.info('User subscription created by solana', {
    userId,
    pubKey,
    reference,
    solAmount,
    signature,
  })

  await db.transaction(async (tx) => {
    const userSubscriptionData = await tx
      .insert(userSubscription)
      .values({
        userId,
        paymentMethod: 'solana',
        subscriptionStart: new Date(Date.now()),
        subscriptionEnd: new Date(Date.now() + SUBSCRIPTION_DURATION),
        subscriptionStatus: 'pending',
      })
      .returning({ id: userSubscription.id })

    await tx.insert(solanaSubscriptionDetails).values({
      reference,
      userSubscriptionId: userSubscriptionData[0].id,
      solanaWalletAddress: pubKey,
      solanaTransactionSignature: signature,
      solanaTokenAmount: solAmount,
      solanaTransactionStatus: status,
    })
  })
  revalidatePath('/tokens')
}

export const upsertNftClaimed = async (
  pubKey: string,
  assetId: string,
  signature: string,
) => {
  const { userId } = await auth()

  const user = await currentUser()

  if (!userId || !user) throw new Error('Unauthorized')

  logger.info('User subscription nft claimed', {
    userId,
    pubKey,
    assetId,
    signature,
  })
  if (!assetId || !signature) throw new Error('Invalid asset id or signature')

  await db
    .update(userSubscription)
    .set({
      subscriptionNftClaimed: true,
      subscriptionNftClaimedSignature: signature,
      subscriptionNftAssetId: assetId,
    })
    .where(eq(userSubscription.userId, userId))
    .catch((error) => {
      logger.error('Failed to update user subscription:', {
        userId,
        pubKey,
        assetId,
        signature,
        error,
      })

      throw new Error('Failed to update user subscription')
    })

  await reduceTokens(SUBSCRIPTION_NFT_MINT_FEE_TOKEN)
}
