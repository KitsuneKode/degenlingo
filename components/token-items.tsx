'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { units } from '@/db/schema'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TOKENS_PER_NFT } from '@/lib/constants'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { claimNftCheck } from '@/actions/redeem-tokens'
import { useTokenModal } from '@/store/use-token-modal'
import { usePaymentModal } from '@/store/use-payment-modal'
import { base58 } from '@metaplex-foundation/umi-serializers'
import { useCallback, useMemo, useRef, useTransition } from 'react'
import { initiateSolanaPayment } from '@/actions/user-subscription'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { upsertSolanaSubcription } from '@/actions/solana-subscription'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import {
  generateSigner,
  percentAmount,
  publicKey,
} from '@metaplex-foundation/umi'
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  SystemProgram,
  SystemInstruction,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'

type Props = {
  tokens: number
  hasActiveSubscription: boolean
  unclaimedNfts: (typeof units.$inferSelect)[]
  activeCourseName: string
  subscriptionType: 'stripe' | 'solana' | null
}

export const TokenItems = ({
  tokens,
  hasActiveSubscription,
  unclaimedNfts,
  activeCourseName,
  subscriptionType,
}: Props) => {
  const [pending, startTransition] = useTransition()

  const { publicKey: walletPublicKey, connected, sendTransaction } = useWallet()
  // const { connection } = useConnection()
  // const transactionSignature = useRef('')

  // const router = useRouter()
  const rpcUrl = process.env.SOLANA_RPC_URL
  const { open: openPaymentModal } = usePaymentModal()
  const { open: openTokenModal } = useTokenModal()

  const umi = useMemo(() => {
    if (!connected || !walletPublicKey || !rpcUrl) return null

    return createUmi(rpcUrl, 'confirmed')
      .use(mplTokenMetadata())
      .use(
        walletAdapterIdentity({
          publicKey: walletPublicKey,
        }),
      )
  }, [connected, walletPublicKey, rpcUrl])

  // const onUpgrade = () => {
  //   if (pending || !walletPublicKey) return

  //   startTransition(async () => {
  //     try {

  //       setStatus('initiating')
  //       setStatusMessage('Initiating Solana payment...')
  //       const { transactionBase64, reference, expectedSolAmount } =
  //         await initiateSolanaPayment(walletPublicKey.toString())

  //         if (transactionBase64 && reference && expectedSolAmount) {
  //           setStatus('awaiting')
  //           setStatusMessage('Please confirm the transaction in your wallet')
  //         } else {
  //           throw new Error('Failed to initiate Solana payment')
  //         }

  //       const transaction = Transaction.from(
  //         Buffer.from(transactionBase64, 'base64'),
  //       )

  //       const firstInstruction = transaction.instructions[0]

  //       if (
  //         !firstInstruction ||
  //         !firstInstruction.programId.equals(SystemProgram.programId) ||
  //         !firstInstruction.data ||
  //         !firstInstruction.keys[0].pubkey.equals(walletPublicKey)
  //       ) {
  //         const decodedTransfer =
  //           SystemInstruction.decodeTransfer(firstInstruction)
  //         if (
  //           decodedTransfer.lamports !==
  //           BigInt(Number(expectedSolAmount) * LAMPORTS_PER_SOL)
  //         ) {
  //           toast.error('Transaction amount mismatch')
  //           return
  //         }
  //         toast.error('Transaction details tampered with or invalid. Aborting.')
  //         return
  //       }

  //       transactionSignature.current = await sendTransaction(
  //         transaction,
  //         connection,
  //         { skipPreflight: false },
  //       )

  //       await upsertSolanaSubcription(
  //         walletPublicKey.toString(),
  //         reference,
  //         expectedSolAmount,
  //         transactionSignature.current,
  //         'processed',
  //       )

  //       const latestBlockHash = await connection.getLatestBlockhash()

  //       await connection.confirmTransaction(
  //         {
  //           blockhash: latestBlockHash.blockhash,
  //           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //           signature: transactionSignature.current,
  //         },
  //         'confirmed',
  //       )

  //       await upsertSolanaSubcription(
  //         walletPublicKey.toString(),
  //         reference,
  //         expectedSolAmount,
  //         transactionSignature.current,
  //         'confirmed',
  //       )

  //       router.refresh()

  //       toast.success(
  //         `Payment successful! Transaction: ${transactionSignature.current}`,
  //       )
  //     } catch (err) {
  //       if (err instanceof Error && err.message?.includes('User rejected')) {
  //         toast.error('Transaction was rejected by the user.')
  //         setStatus('error')
  //         setStatusMessage('Transaction was rejected by the user.')
  //         return
  //       }

  //       console.log(err)
  //       toast.error('Transaction failed. Please try again.')
  //       setStatus('error')
  //       setStatusMessage('Failed to initiate payment. Please try again.')
  //     }
  //   })
  // }

  const onClaimNft = (nftId: number) => {
    if (pending) return

    if (!connected || !walletPublicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!hasActiveSubscription && tokens < TOKENS_PER_NFT) {
      toast.error(
        `Not enough tokens to claim NFT. Need ${TOKENS_PER_NFT} tokens or upgrade to premium.`,
      )
      return
    }

    startTransition(async () => {
      try {
        // ✅ First check server-side validation and update database
        await claimNftCheck(nftId, walletPublicKey.toBase58())

        // ✅ Then mint the actual NFT
        // await mintNft(nftId)

        toast.success('NFT claimed successfully!')
      } catch (error) {
        console.error('Failed to claim NFT:', error)
        toast.error('Failed to claim NFT. Please try again.')
      }
    })
  }

  // ✅ Complete NFT minting implementation
  // const mintNft = useCallback(
  //   async (nftId: number) => {
  //     if (!umi || !walletPublicKey || !connected) {
  //       throw new Error('Wallet not connected or UMI not initialized')
  //     }

  //     try {
  //       // Find the NFT data from unclaimedNfts
  //       const nftData = unclaimedNfts.find((nft) => nft.id === nftId)
  //       if (!nftData) {
  //         throw new Error('NFT data not found')
  //       }

  //       console.log('Minting NFT:', {
  //         unitTitle: nftData.title,
  //         recipient: walletPublicKey.toBase58(),
  //         metadataUri: nftData.nftMetadata,
  //       })

  //       // ✅ Generate new mint keypair
  //       const nftMint = generateSigner(umi)

  //       // ✅ Create the NFT
  //       const transaction = await createNft(umi, {
  //         mint: nftMint,
  //         authority: umi.identity,
  //         name: `${nftData.title} - Completed`,
  //         symbol: 'LANG',
  //         uri: nftData.nftMetadata, // ✅ Use metadata from database
  //         sellerFeeBasisPoints: percentAmount(5, 2), // 5% royalty
  //         tokenOwner: publicKey(walletPublicKey.toBase58()), // ✅ User gets the NFT
  //         creators: [
  //           {
  //             address: umi.identity.publicKey,
  //             share: 100,
  //             verified: true,
  //           },
  //         ],
  //       }).sendAndConfirm(umi, {
  //         confirm: { commitment: 'finalized' },
  //       })

  //       console.log('NFT Minted Successfully!')
  //       console.log('Mint Address:', nftMint.publicKey)
  //       console.log(
  //         'Transaction:',
  //         base58.deserialize(transaction.signature)[0],
  //       )

  //       return {
  //         mintAddress: nftMint.publicKey,
  //         transaction: base58.deserialize(transaction.signature)[0],
  //       }
  //     } catch (error) {
  //       console.error('NFT minting failed:', error)
  //       throw error
  //     }
  //   },
  //   [umi, walletPublicKey, connected, unclaimedNfts],
  // )

  // ✅ Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="w-full p-8 text-center">
        <p className="mb-4 text-lg font-bold text-neutral-600">
          Connect your Solana wallet to claim NFT rewards
        </p>
      </div>
    )
  }

  return (
    <ul className="w-full">
      {/* Upgrade Section */}
      <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
        <Image
          src="/icon.jpeg"
          alt="Unlimited"
          width={60}
          height={60}
          className="rounded-xl"
        />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Upgrade to unlock free NFT rewards
          </p>
          <p className="text-sm text-neutral-500">
            Choose Stripe or Solana payment
          </p>
        </div>
        <Button
          variant={
            subscriptionType === 'solana' && hasActiveSubscription
              ? 'secondary'
              : 'default'
          }
          disabled={
            pending || (subscriptionType === 'solana' && hasActiveSubscription)
          }
          onClick={openPaymentModal}
        >
          {hasActiveSubscription
            ? subscriptionType === 'stripe'
              ? 'settings'
              : 'premium active'
            : 'upgrade'}
        </Button>
      </div>
      <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
        <Image
          src="/token.png"
          alt="Unlimited"
          width={60}
          height={60}
          className="rounded-xl"
        />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Redeem your tokens
          </p>
          <p className="text-sm text-neutral-500">Get them in your wallet</p>
        </div>
        <Button
          variant={
            subscriptionType === 'solana' && hasActiveSubscription
              ? 'secondary'
              : 'default'
          }
          disabled={
            pending || (subscriptionType === 'solana' && hasActiveSubscription)
          }
          onClick={openPaymentModal}
        >
          {hasActiveSubscription
            ? subscriptionType === 'stripe'
              ? 'settings'
              : 'premium active'
            : 'upgrade'}
        </Button>
      </div>

      {/* NFT Claims Section */}
      {unclaimedNfts.length === 0 && false ? (
        <div className="p-8 text-center text-neutral-500">
          <p>Complete units to unlock NFT rewards!</p>
        </div>
      ) : (
        unclaimedNfts.map((nft) => (
          <div
            key={nft.id}
            className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4"
          >
            <Image
              src={nft.nftImageSrc}
              alt={nft.title}
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div className="flex-1">
              <p className="text-base font-bold text-neutral-700 lg:text-xl">
                Claim NFT: {activeCourseName} {nft.title}
              </p>
              <p className="text-sm text-neutral-500">
                {hasActiveSubscription
                  ? 'Free with Premium'
                  : `Costs ${TOKENS_PER_NFT} tokens`}
              </p>
            </div>
            <Button
              disabled={
                pending || (!hasActiveSubscription && tokens < TOKENS_PER_NFT)
              }
              onClick={() => onClaimNft(nft.id)}
              className="min-w-[100px]"
            >
              {pending
                ? 'Minting...'
                : hasActiveSubscription
                  ? 'Claim Free'
                  : `${TOKENS_PER_NFT} tokens`}
            </Button>
          </div>
        ))
      )}

      {/* Wallet Info */}
      <div className="rounded-b-lg border-t-2 bg-neutral-50 p-4">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Connected Wallet:</span>
          <span className="font-mono">
            {walletPublicKey?.toBase58().slice(0, 8)}...
            {walletPublicKey?.toBase58().slice(-8)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-neutral-600">
          <span>Your Tokens:</span>
          <span className="font-bold">{tokens}</span>
        </div>

        <Button
          variant="default"
          disabled={pending}
          onClick={openPaymentModal}
          className="w-full"
        >
          Upgrade to Premium
        </Button>
        <Button
          variant="default"
          disabled={pending}
          onClick={() => openTokenModal(tokens)}
          className="w-full"
        >
          Redeem Tokens
        </Button>
      </div>
    </ul>
  )
}
