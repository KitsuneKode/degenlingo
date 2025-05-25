'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { units } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { TOKENS_PER_NFT } from '@/lib/constants'
import { claimNftCheck } from '@/actions/redeem-tokens'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useMemo, useTransition } from 'react'
import { base58 } from '@metaplex-foundation/umi-serializers'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
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

type Props = {
  tokens: number
  hasActiveSubscription: boolean
  unclaimedNfts: (typeof units.$inferSelect)[]
  activeCourseName: string
}

export const TokenItems = ({
  tokens,
  hasActiveSubscription,
  unclaimedNfts,
  activeCourseName,
}: Props) => {
  const [pending, startTransition] = useTransition()

  const { publicKey: walletPublicKey, connected } = useWallet()

  // ✅ Fixed: Added missing walletAdapterIdentity import and proper RPC URL
  const umi = useMemo(() => {
    if (!connected || !walletPublicKey) return null

    return createUmi(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed',
    )
      .use(mplTokenMetadata())
      .use(
        walletAdapterIdentity({
          publicKey: walletPublicKey,
        }),
      )
  }, [connected, walletPublicKey])

  const onUpgrade = () => {
    if (pending) return

    startTransition(() => {
      // TODO: Implement Stripe or Solana payment flow
      // createStripeUrl() or initiateSolanaPayment()
      toast.info('Payment integration coming soon!')
    })
  }

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
        await mintNft(nftId)

        toast.success('NFT claimed successfully!')
      } catch (error) {
        console.error('Failed to claim NFT:', error)
        toast.error('Failed to claim NFT. Please try again.')
      }
    })
  }

  // ✅ Complete NFT minting implementation
  const mintNft = useCallback(
    async (nftId: number) => {
      if (!umi || !walletPublicKey || !connected) {
        throw new Error('Wallet not connected or UMI not initialized')
      }

      try {
        // Find the NFT data from unclaimedNfts
        const nftData = unclaimedNfts.find((nft) => nft.id === nftId)
        if (!nftData) {
          throw new Error('NFT data not found')
        }

        console.log('Minting NFT:', {
          unitTitle: nftData.title,
          recipient: walletPublicKey.toBase58(),
          metadataUri: nftData.nftMetadata,
        })

        // ✅ Generate new mint keypair
        const nftMint = generateSigner(umi)

        // ✅ Create the NFT
        const transaction = await createNft(umi, {
          mint: nftMint,
          authority: umi.identity,
          name: `${nftData.title} - Completed`,
          symbol: 'LANG',
          uri: nftData.nftMetadata, // ✅ Use metadata from database
          sellerFeeBasisPoints: percentAmount(5, 2), // 5% royalty
          tokenOwner: publicKey(walletPublicKey.toBase58()), // ✅ User gets the NFT
          creators: [
            {
              address: umi.identity.publicKey,
              share: 100,
              verified: true,
            },
          ],
        }).sendAndConfirm(umi, {
          confirm: { commitment: 'finalized' },
        })

        console.log('NFT Minted Successfully!')
        console.log('Mint Address:', nftMint.publicKey)
        console.log(
          'Transaction:',
          base58.deserialize(transaction.signature)[0],
        )

        return {
          mintAddress: nftMint.publicKey,
          transaction: base58.deserialize(transaction.signature)[0],
        }
      } catch (error) {
        console.error('NFT minting failed:', error)
        throw error
      }
    },
    [umi, walletPublicKey, connected, unclaimedNfts],
  )

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
        <Button disabled={pending || hasActiveSubscription} onClick={onUpgrade}>
          {hasActiveSubscription ? 'Premium Active' : 'Upgrade'}
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
      </div>
    </ul>
  )
}

// 'use client'

// import { toast } from 'sonner'
// import Image from 'next/image'
// import { units } from '@/db/schema'
// import { useCallback, useMemo, useTransition } from 'react'
// import { Button } from '@/components/ui/button'
// import { TOKENS_PER_NFT } from '@/lib/constants'
// import { claimNftCheck } from '@/actions/redeem-tokens'
// import { useConnection, useWallet } from '@solana/wallet-adapter-react'
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'

// type Props = {
// tokens: number
// hasActiveSubscription: boolean
// unclaimedNfts: (typeof units.$inferSelect)[]
// }

// export const TokenItems = ({
// tokens,
// hasActiveSubscription,
// unclaimedNfts,
// }: Props) => {
// const [pending, startTransition] = useTransition()

// const { publicKey } = useWallet()
// const { connection } = useConnection()

// const umi = useMemo(()=> createUmi(process.env.SOLANA_RPC_URL!,
//   'confirmed').use(mplTokenMetadata()).use(walletAdapterIdentity()),[])

// // const onRefillHearts = () => {
// //   if (pending || hearts === MAX_HEARTS || points < HEARTS_REFILL_COST) return

// //   startTransition(() => {
// //     refillHearts().catch(() => toast.error('Something went wrong'))
// //   })
// // }

// const onUpgrade = () => {
//   if (pending) return

//   startTransition(() => {
//     // createStripeUrl()
//     //   .then((res) => {
//     //   })
//     //   .catch(() => toast.error('Something went wrong'))
//   })
// }

// const onClaimNft = (nftId: number) => {
//   if (pending) return

//   if (!hasActiveSubscription && tokens < TOKENS_PER_NFT) {
//     toast.error(
//       `Not enough tokens to claim NFT, Upgrade to unlock free NFT rewards`,
//     )
//     return
//   }

//   startTransition(async () => {
//     if (pending || !publicKey) {
//       if (!publicKey) {
//         toast.error('Wallet not connected')
//       }
//       return
//     }
//     await claimNftCheck(nftId, publicKey.toBase58())
//   })
// }

// const minTNft = useCallback(async () => {
//   try {

//   } catch (err) {
//     console.log(err)
//     toast.error('Something went wrong')
//   }
// },[])

// return (
//   <ul className="w-full">
//     {/* <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
//       <Image src="/heart.svg" alt="Heart" width={60} height={60} />
//       <div className="flex-1">
//         <p className="text-base font-bold text-neutral-700 lg:text-xl">
//           Refill hearts
//         </p>
//       </div>
//       <Button
//         disabled={
//           pending || hearts === MAX_HEARTS || points < HEARTS_REFILL_COST
//         }
//         onClick={onRefillHearts}
//       >
//         {hearts === MAX_HEARTS ? (
//           'full'
//         ) : (
//           <div className="flex items-center">
//             <Image src="/points.svg" alt="Points" width={20} height={20} />
//             <p>{HEARTS_REFILL_COST}</p>
//           </div>
//         )}
//       </Button>
//     </div> */}
//     <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
//       <Image
//         src="/icon.jpeg"
//         alt="Unlimited"
//         width={60}
//         height={60}
//         className="rounded-xl"
//       />
//       <div className="flex-1">
//         <p className="text-base font-bold text-neutral-700 lg:text-xl">
//           Upgrade to unlock free NFT rewards
//         </p>
//       </div>
//       <Button disabled={pending || hasActiveSubscription} onClick={onUpgrade}>
//         {hasActiveSubscription ? 'premium' : 'upgrade'}
//       </Button>
//     </div>

//     {unclaimedNfts.map((nft) => (
//       <div
//         key={nft.id}
//         className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4"
//       >
//         <Image src={nft.nftImageSrc} alt={nft.title} width={60} height={60} />
//         <div className="flex-1">
//           <p className="text-base font-bold text-neutral-700 lg:text-xl">
//             Claim your NFT for {nft.title}
//           </p>
//         </div>
//         <Button disabled={pending} onClick={() => onClaimNft(nft.id)}>
//           {hasActiveSubscription ? 'claim' : `${TOKENS_PER_NFT} tokens`}
//         </Button>
//       </div>
//     ))}
//   </ul>
// )
// }
