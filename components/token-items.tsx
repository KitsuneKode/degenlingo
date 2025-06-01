'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { units } from '@/db/schema'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { TOKENS_PER_NFT } from '@/lib/constants'
import { useNFTModal } from '@/store/use-nft-modal'
import { useTokenModal } from '@/store/use-token-modal'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePaymentModal } from '@/store/use-payment-modal'
import { claimSubscriptionNft } from '../actions/redeem-tokens'

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
  const [pending, startTransition] = useTransition()

  const { publicKey: walletPublicKey, connected } = useWallet()

  const { open: openPaymentModal } = usePaymentModal()
  const { open: openTokenModal } = useTokenModal()
  const { open: openNftModal } = useNFTModal()

  const onClaimNft = (nftId?: number) => {
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
        if (!nftId) {
          const transaction = await claimSubscriptionNft(
            walletPublicKey.toBase58(),
          )

          if (transaction.error || !transaction.success) {
            throw new Error(transaction.error || 'Failed to claim NFT')
          }

          toast.success('NFT claimed successfully!')
        } else {
          toast.success('UNIT NFT coming soon!')
        }
      } catch (error) {
        console.error('Failed to claim NFT:', error)
        toast.error('Failed to claim NFT. Please try again.')
      }
    })
  }

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
            disabled={
              pending ||
              (!hasActiveSubscription && tokens < TOKENS_PER_NFT) ||
              claimedPremiumNft
            }
            onClick={() => onClaimNft()}
            className="min-w-[100px]"
          >
            {pending ? 'Minting...' : claimedPremiumNft ? 'Claimed' : 'Claim'}
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
        <Button
          variant="default"
          disabled={pending}
          onClick={() =>
            openNftModal('/icon.jpeg', 'Premium', 'Degenlingo Premium')
          }
          className="w-full"
        >
          NFT Claim
        </Button>
      </div>
    </ul>
  )
}
