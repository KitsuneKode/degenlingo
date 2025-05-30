'use server'

import { auth } from '@clerk/nextjs/server'

import bs58 from 'bs58'
import logger from '@/lib/logger'
import { reduceTokens } from './user-progress'
import { MIN_REDEEMABLE_TOKEN_AMOUNT } from '@/lib/constants'
import { getNftDetails, getRedeemableTokens } from '@/db/queries'
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
  mintToChecked,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  createProgrammableNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  PublicKey as UmiPublicKey,
} from '@metaplex-foundation/umi'

/**
 * Claim an NFT for a user
 * This will add the NFT to the user's redeemed NFTs
export const claimNft = async (unitId: number) => {
const { userId } = await auth()

if (!userId) throw new Error('Unauthorized')

const currentUserProgress = await getUserProgress()

if (!currentUserProgress) throw new Error('User progress not found')

// Check if the unit exists
const unit = await db.query.units.findFirst({
where: eq(units.id, unitId),
})
  
  if (!unit) throw new Error('Unit not found')
  
  // Check if the NFT has already been redeemed
  const existingRedemption = await db.query.userRedeemedNfts.findFirst({
  where: and(
  eq(userRedeemedNfts.userId, userId),
  eq(userRedeemedNfts.unitId, unitId)
),
})

if (existingRedemption) throw new Error('NFT already claimed')

// Add the NFT to the user's redeemed NFTs
await db.insert(userRedeemedNfts).values({
userId,
unitId,
})

revalidatePath('/shop')
revalidatePath('/learn')
revalidatePath('/units')
revalidatePath(`/units/${unitId}`)

return { success: true }
}
*/

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

export const claimNftCheck = async (
  unitId: number,
  userWalletAddress: string,
) => {
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
  // const umi = createUmi(process.env.SOLANA_RPC_URL!, 'confirmed')

  // const feePayer = umi.eddsa.createKeypairFromSecretKey(
  //   bs58.decode(process.env.PRIVATE_KEY!),
  // )
  // if (!feePayer) throw new Error('Fee payer not found')

  // umi.use(keypairIdentity(feePayer))
  // umi.use(mplTokenMetadata())

  // const userWallet = new PublicKey(userWalletAddress)
  // const mint = generateSigner(umi)

  // const { signature } = await createProgrammableNft(umi, {
  //   mint,
  //   name: nftDetails.nft,
  //   uri: nftDetails.nftMetadata,
  //   sellerFeeBasisPoints: percentAmount(0),
  //   creators: [
  //     {
  //       address: feePayer.publicKey,
  //       share: 100,
  //       verified: true,
  //     },
  //   ],
  //   tokenOwner: userWallet as unknown as UmiPublicKey,
  // }).sendAndConfirm(umi)

  // console.log('NFT created successfully!')
  // console.log('Mint address:', mint.publicKey)
  // console.log('Transaction signature:', signature)

  // console.log('Fetching digital asset...')
  // const asset = await fetchDigitalAsset(umi, mint.publicKey)
  // console.log('Digital Asset:', asset)

  // return { signature }
}

// import bs58 from 'bs58'
// ;(async () => {
//   try {
//     console.log('Creating Umi instance...')
//     const umi = createUmi('http://127.0.0.1:8899')

//     const keypair = umi.eddsa.createKeypairFromSecretKey(
//       bs58.decode(
//         '588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2',
//       ),
//     )

//     await umi.rpc.airdrop(keypair.publicKey, createAmount(1, 'SOL', 9))

//     // Use keypairIdentity to set the keypair as the signer
//     const signer = keypairIdentity(keypair)
//     umi.use(signer)
//     umi.use(mplTokenMetadata())

//     console.log('Keypair loaded. Public key:', keypair.publicKey)

//     console.log('Generating new mint address...')
//     const mint = generateSigner(umi)

//     console.log('Creating NFT...')
//     const { signature } = await createNft(umi, {
//       mint,
//       name: 'My NFT',
//       // Replace this with your Arweave metadata URI
//       uri: 'https://ffaaqinzhkt4ukhbohixfliubnvpjgyedi3f2iccrq4efh3s.arweave.net/KUAIIbk6p8oo4XHRcq0U__C2r0mwQaNl0gQow4Qp9yk',
//       sellerFeeBasisPoints: percentAmount(0),
//       creators: [
//         {
//           address: keypair.publicKey,
//           share: 100,
//           verified: true,
//         },
//       ],
//     }).sendAndConfirm(umi)

//     console.log('NFT created successfully!')
//     console.log('Mint address:', mint.publicKey)
//     console.log('Transaction signature:', signature)

//     console.log('Fetching digital asset...')
//     const asset = await fetchDigitalAsset(umi, mint.publicKey)
//     console.log('Digital Asset:', asset)
//   } catch (error) {
//     console.error('Error:', error)
//     console.error('Stack trace:', error.stack)
//   }
// })()
