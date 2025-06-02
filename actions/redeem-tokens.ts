'use server'

import { auth } from '@clerk/nextjs/server'

import bs58 from 'bs58'
import logger from '@/lib/logger'
import { reduceTokens } from './user-progress'
import {
  getNftDetails,
  getRedeemableTokens,
  getUserSubscription,
} from '@/db/queries'
import {
  MIN_REDEEMABLE_TOKEN_AMOUNT,
  SUBSCRIPTION_NFT_MINT_FEE_TOKEN,
} from '@/lib/constants'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import {
  createMintToCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'

import { checkWallet } from '@/lib/roles'
import { getUmi } from '@/lib/solana-nft'
import { publicKey } from '@metaplex-foundation/umi'
import {
  findLeafAssetIdPda,
  mintToCollectionV1,
  parseLeafFromMintV1Transaction,
} from '@metaplex-foundation/mpl-bubblegum'

export const redeemTokens = async (
  userWalletAddress: string,
  tokensToRedeem: number,
) => {
  const { userId, sessionClaims } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const walletAddress = sessionClaims.metadata.wallet?.address
  if (!walletAddress) throw new Error('Wallet address not found')

  const feePayer = Keypair.fromSecretKey(
    bs58.decode(process.env.MINT_PRIVATE_KEY!),
  )
  if (!feePayer) throw new Error('Fee payer not found')

  if (userWalletAddress !== walletAddress)
    return { error: 'Wallet address does not match' }

  const redeemableTokensAmount = await getRedeemableTokens()
  if (!redeemableTokensAmount) throw new Error('Redeemable tokens not found')

  if (
    redeemableTokensAmount < MIN_REDEEMABLE_TOKEN_AMOUNT ||
    tokensToRedeem > redeemableTokensAmount
  )
    return { error: 'Not enough redeemable tokens' }

  const connection = new Connection(process.env.SOLANA_RPC_URL!, {
    wsEndpoint: process.env.SOLANA_WS_URL!,
    commitment: 'confirmed',
  })

  const mintAddress = new PublicKey(process.env.MINT_ADDRESS!)
  if (!mintAddress) throw new Error('Mint address not found')

  const userWallet = new PublicKey(userWalletAddress)

  logger.info(`User Wallet Address:`, {
    walletAddress,
    mintAddress,
  })

  const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    feePayer,
    mintAddress,
    userWallet,
    false,
    'confirmed',
    {},
    TOKEN_2022_PROGRAM_ID,
  )

  logger.info(`Associated Token Account Address:`, {
    ata: associatedTokenAccount.address.toBase58(),
  })

  const amountToMint = BigInt(tokensToRedeem * LAMPORTS_PER_SOL)

  const mintTx = createMintToCheckedInstruction(
    mintAddress,
    associatedTokenAccount.address,
    feePayer.publicKey,
    amountToMint,
    9,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  )
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed')

  const tx = new Transaction().add(mintTx)

  tx.feePayer = feePayer.publicKey
  tx.recentBlockhash = blockhash
  tx.sign(feePayer)

  const rawTx = tx.serialize()

  logger.info(`Raw Transaction:`, {
    rawTx,
  })

  const signature = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  await connection.confirmTransaction(
    {
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: signature,
    },
    'confirmed',
  )

  logger.info(`Transaction Signature:`, {
    signature,
  })

  await reduceTokens(tokensToRedeem)

  return { signature }
}

export const claimSubscriptionNft = async (userWalletAddress: string) => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const walletAddress = await checkWallet(userWalletAddress)
  if (!walletAddress) throw new Error('Wallet address mismatch')

  const userSubscription = await getUserSubscription()

  if (!userSubscription || userSubscription?.subscriptionStatus !== 'active') {
    throw new Error('User is not subscribed')
  }

  if (userSubscription?.subscriptionNftClaimed) {
    throw new Error('Subscription NFT already claimed')
  }

  const redeemableTokensAmount = await getRedeemableTokens()
  if (!redeemableTokensAmount) throw new Error('Redeemable tokens not found')

  if (redeemableTokensAmount < SUBSCRIPTION_NFT_MINT_FEE_TOKEN)
    return {
      error:
        'Not enough redeemable tokens, You need at least 200 tokens to mint a subscription nft',
    }
  try {
    const umi = getUmi(process.env.MINT_PRIVATE_KEY!)

    const merkleTree = publicKey(process.env.MERKLE_TREE_ADDRESS!)

    const collectionMint = publicKey(process.env.COLLECTION_MINT_ADDRESS!)

    const metadataUri = process.env.NEXT_PUBLIC_SUBSCRIPTION_METADATA_URI!

    const recipientPublickey = publicKey(userWalletAddress)
    const mintTxBuilder = mintToCollectionV1(umi, {
      leafOwner: recipientPublickey,
      merkleTree: merkleTree,
      collectionMint: collectionMint,

      metadata: {
        name: 'DegenLingo Collection',
        symbol: 'DLCC',
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        collection: {
          key: collectionMint,
          verified: false,
        },
        creators: [
          {
            address: umi.identity.publicKey,
            verified: true,
            share: 100,
          },
        ],
      },
    })

    const { signature, result } = await mintTxBuilder.sendAndConfirm(umi, {
      send: { commitment: 'confirmed' },
    })

    const mintSignature = bs58.encode(signature)

    logger.info('Mint Signature:', {
      result,
      mintSignature,
      link: `https://explorer.solana.com/tx/${mintSignature}`,
    })
    // const transaction = new Transaction()
    // transaction.add(mintTx)

    // // --- NEW: Add a SystemProgram.transfer instruction for the platform fee ---
    // if (PLATFORM_FEE_AMOUNT_SOL > 0) {
    //   const transferIx = SystemProgram.transfer({
    //     fromPubkey: new PublicKey(recipientPublickey), // User pays the fee
    //     toPubkey: new PublicKey(process.env.PROJECT_SUBSCRIPTION_WALLET!), // Your platform's wallet receives the fee
    //     lamports: BigInt(PLATFORM_FEE_AMOUNT_SOL * LAMPORTS_PER_SOL),
    //   })
    //   transaction.add(transferIx)
    //   console.log(
    //     `Adding platform fee of ${PLATFORM_FEE_AMOUNT_SOL} SOL to ${process.env.PROJECT_SUBSCRIPTION_WALLET!}`,
    //   )
    // }

    // // Set the user's wallet as the primary fee payer for the entire transaction
    // transaction.feePayer = new PublicKey(recipientPublickey)

    // // Get the latest blockhash
    // transaction.recentBlockhash = (
    //   await connection.getLatestBlockhash()
    // ).blockhash

    // // 4. Partially sign the transaction with the minter's private key
    // // This signature covers the minting instruction (which the minter has authority over).

    // // 5. Serialize the transaction for the frontend
    // const serializedTransaction = transaction
    //   .serialize({ requireAllSignatures: false, verifySignatures: false })
    //   .toString('base64')

    // logger.info('Serialized Transaction:', serializedTransaction)

    console.log('Finding Asset ID...')
    const leaf = await parseLeafFromMintV1Transaction(umi, signature)

    const assetId = findLeafAssetIdPda(umi, {
      merkleTree: merkleTree,
      leafIndex: leaf.nonce,
    })

    logger.info('Compressed NFT Asset ID:', {
      assetId: assetId.toString(),
    })

    return {
      success: true,
      transactionSignature: mintSignature,
      assetId: assetId.toString().split(',')[0],
      assetLink: `https://explorer.solana.com/address/${assetId.toString().split(',')[0]}?cluster=devnet`,
      link: `https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`,
    }
  } catch (error) {
    logger.error('Error minting certificate on server:', error)

    if (
      error instanceof Error &&
      error.message.includes('Not enough redeemable tokens')
    ) {
      return {
        success: false,
        error: 'Not enough redeemable tokens',
      }
    }

    if (
      error instanceof Error &&
      error.message.includes('Wallet address does not match')
    ) {
      return {
        success: false,
        error: 'Wallet address mismatch, please try again',
      }
    }
    return {
      success: false,
      error: 'Failed to mint subscription NFT',
    }
  }
}

export const claimNft = async (unitId: number, userWalletAddress: string) => {
  const { userId, sessionClaims } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const walletAddress = sessionClaims.metadata.wallet?.address
  if (!walletAddress) throw new Error('Wallet address not found')

  if (userWalletAddress !== walletAddress)
    return { error: 'Wallet address does not match' }

  const redeemableTokensAmount = await getRedeemableTokens()
  if (!redeemableTokensAmount) throw new Error('Redeemable tokens not found')

  if (redeemableTokensAmount < MIN_REDEEMABLE_TOKEN_AMOUNT)
    return { error: 'Not enough redeemable tokens' }

  const nftDetails = await getNftDetails(unitId)

  if (!nftDetails) throw new Error('NFT details not found')

  return nftDetails
}
