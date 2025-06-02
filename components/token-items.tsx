'use client'

import Image from 'next/image'
import { units } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { TOKENS_PER_NFT } from '@/lib/constants'
import { useTokenModal } from '@/store/use-token-modal'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePaymentModal } from '@/store/use-payment-modal'
import { NftType, useNFTModal } from '@/store/use-nft-modal'

type Props = {
  tokens: number
  hasActiveSubscription: boolean
  claimedPremiumNft?: boolean
  unclaimedNfts: (typeof units.$inferSelect)[]
  activeCourseName: string
  subscriptionType: 'stripe' | 'solana' | null
}

export const TokenItems = ({
  tokens,
  hasActiveSubscription,
  unclaimedNfts,
  activeCourseName,
  claimedPremiumNft,
  subscriptionType,
}: Props) => {
  const { connected } = useWallet()

  const { open: openPaymentModal } = usePaymentModal()
  const { open: openTokenModal } = useTokenModal()
  const { open: openNftModal } = useNFTModal()

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
          disabled={subscriptionType === 'solana' && hasActiveSubscription}
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
        <Button onClick={() => openTokenModal(tokens)}>redeem tokens</Button>
      </div>

      {/* NFT Claims Section */}
      {hasActiveSubscription && (
        <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
          <Image
            src="/icon.jpeg"
            alt="Premium"
            width={60}
            height={60}
            className="rounded-lg"
          />
          <div className="flex-1">
            <p className="text-base font-bold text-neutral-700 lg:text-xl">
              Claim NFT: Degenlingo Premium
            </p>
            <p className="text-sm text-neutral-500">
              {hasActiveSubscription
                ? 'Free with Premium'
                : `Costs ${TOKENS_PER_NFT} tokens`}
            </p>
          </div>
          <Button
            variant={claimedPremiumNft ? 'primary' : 'default'}
            disabled={claimedPremiumNft}
            onClick={() =>
              openNftModal(
                NftType.subscription,
                undefined,
                process.env.NEXT_PUBLIC_SUBSCRIPTION_METADATA_URI,
              )
            }
            className="min-w-[100px]"
          >
            {claimedPremiumNft ? 'Claimed' : 'Claim'}
          </Button>
        </div>
      )}

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
              onClick={() =>
                openNftModal(NftType.unit, nft.id, nft.nftMetadata)
              }
              className="min-w-[100px]"
            >
              {hasActiveSubscription
                ? 'Claim Free'
                : `${TOKENS_PER_NFT} tokens`}
            </Button>
          </div>
        ))
      )}
    </ul>
  )
}
