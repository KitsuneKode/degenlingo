'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { getNftData } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { NftType, useNFTModal } from '@/store/use-nft-modal'
import { claimSubscriptionNft } from '@/actions/redeem-tokens'
import { upsertNftClaimed } from '@/actions/solana-subscription'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const loadingMessages = [
  'Convincing the blockchain this NFT is worth it...',
  'Teaching your NFT to behave in your wallet...',
  'Bribing the validators to process faster...',
  'Compressing your art into a tiny blockchain space...',
  'Preparing your NFT for its blockchain debut...',
  'Minting magic happening... no refunds!',
  'Your NFT is getting ready for its big moment...',
  'Blockchain miners are working overtime for you...',
  'Converting pixels to tokens...',
  'Adding special sauce to your NFT...',
]

export const NFTModal = () => {
  type NftData = {
    name: string
    description: string
    image: string
    symbol: string
  }
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close, nftType, unitId, metadataUri } = useNFTModal()
  const { publicKey: walletPublicKey, connected } = useWallet()

  const [pending, startTransition] = useTransition()
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const nftData = useRef<NftData | null>(null)
  const router = useRouter()

  const transactionSignature = useRef<string | null>(null)
  const assetLink = useRef<string | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const [stage, setStage] = useState<
    'preview' | 'minting' | 'result' | 'error' | 'loading' | 'coming-soon'
  >('loading')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isOpen || stage !== 'loading') return
    if (!metadataUri) {
      setStage('coming-soon')
      return
    }
    ;(async () => {
      if (nftData.current) {
        setStage('preview')
        return
      }
      const data = await getNftData(metadataUri)

      if (!data) {
        toast.error('Failed to fetch metadata')
        setStage('error')
        setErrorMessage('Failed to fetch metadata')
        return
      }
      nftData.current = {
        name: data.name,
        description: data.description,
        image: data.image,
        symbol: data.symbol,
      }
      setStage('preview')
    })()
  }, [isClient, isOpen, nftType, metadataUri, stage])

  useEffect(() => {
    if (!isOpen) {
      setLoadingMessageIndex(0)
    }

    return () => {
      nftData.current = null
      transactionSignature.current = null
      assetLink.current = null
      setStage('loading')
    }
  }, [isOpen])

  useEffect(() => {
    if (stage !== 'minting') return

    setProgress(10) // Start at 10%

    const timer1 = setTimeout(() => setProgress(30), 1000)
    const timer2 = setTimeout(() => setProgress(60), 2000)
    const timer3 = setTimeout(() => setProgress(90), 3000)

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearInterval(messageInterval)
    }
  }, [stage])

  if (!isClient) {
    return null
  }

  const onClaimNft = async () => {
    setStage('minting')
    setErrorMessage('')

    if (pending) return
    if (!connected || !walletPublicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    startTransition(async () => {
      try {
        if (nftType === NftType.subscription) {
          const transaction = await claimSubscriptionNft(
            walletPublicKey.toBase58(),
          )

          if (
            transaction.error ||
            !transaction.success ||
            !transaction.assetId
          ) {
            throw new Error(transaction.error || 'Failed to claim NFT')
          }

          const delay = (ms: number) =>
            new Promise((res) => setTimeout(res, ms))

          transactionSignature.current = transaction.transactionSignature!
          assetLink.current = transaction.assetLink!
          setProgress(100)

          await delay(100)
          setStage('result')

          await upsertNftClaimed(
            walletPublicKey.toBase58(),
            transaction.assetId,
            transactionSignature.current,
          )

          toast.success('NFT claimed successfully!')
        } else {
          if (unitId) {
            // Set stage to coming-soon instead of just showing a toast
            //TODO: Implement unit nft
            setStage('coming-soon')
            toast.success('UNIT NFT coming soon!')
          }
        }
      } catch (error) {
        console.error('Failed to claim NFT:', error)
        toast.error('Failed to claim NFT. Please try again.')
        setErrorMessage(
          error instanceof Error ? error.message : 'An unknown error occurred',
        )
        setStage('error')
      }
    })
  }

  const handleClose = () => {
    close()
    if (stage === 'result') {
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {stage === 'loading' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-md" />
                  <div className="relative rounded-full bg-white p-6">
                    <Loader2 className="h-16 w-16 animate-spin text-amber-500" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                Loading NFT
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Fetching your exclusive DegenLingo NFT...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">Preparing Your NFT</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection:</span>
                    <span className="font-medium">DegenLingo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blockchain:</span>
                    <span className="font-medium">Solana</span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full animate-pulse rounded-full bg-gradient-to-r from-purple-500 via-amber-500 to-pink-500"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {stage === 'preview' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                {nftData.current?.image && (
                  <Image
                    src={nftData.current.image}
                    alt={nftData.current.name || 'NFT'}
                    width={200}
                    height={200}
                    className="rounded-xl shadow-lg"
                  />
                )}
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                {nftData.current?.name || 'Claim Your NFT'}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {nftData.current?.description ||
                  'Complete your collection with this exclusive NFT reward.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">NFT Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection:</span>
                    <span className="font-medium">
                      {nftType === NftType.subscription
                        ? 'DegenLingo Premium Collection'
                        : 'DegenLingo Unit Collection'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Symbol:</span>
                    <span className="font-medium">
                      {nftData.current?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blockchain:</span>
                    <span className="font-medium">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="max-w-[180px] truncate font-mono text-xs lg:max-w-[320px]">
                      {walletPublicKey?.toBase58() || 'Connect wallet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mb-4">
              <div className="flex w-full flex-col gap-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={onClaimNft}
                >
                  Claim NFT
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    close()
                    router.push('/learn')
                  }}
                >
                  Back to Lesson
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {stage === 'minting' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                <div className="relative">
                  <Loader2 className="h-20 w-20 animate-spin text-amber-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {nftData.current?.image && (
                      <Image
                        src={nftData.current.image}
                        alt={nftData.current.name || 'NFT'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                Minting Your NFT
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {loadingMessages[loadingMessageIndex]}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="mx-auto mt-4 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 text-sm font-medium tracking-wider text-gray-500 uppercase">
                      NFT Details
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="font-semibold">
                        {nftData.current?.name || 'Your NFT'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Recipient</span>
                      <span className="max-w-[180px] truncate font-mono text-xs">
                        {walletPublicKey?.toBase58() || 'Connecting wallet...'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Minting
                      </span>
                      <span className="text-primary text-xs">
                        Please wait...
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {stage === 'result' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                {nftData.current?.image && (
                  <div className="relative">
                    <Image
                      src={nftData.current.image}
                      alt={nftData.current.name || 'NFT'}
                      width={180}
                      height={180}
                      className="rounded-xl shadow-lg"
                    />
                    {transactionSignature.current && (
                      <div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                {transactionSignature.current
                  ? 'NFT Minted Successfully!'
                  : 'Minting Failed'}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {transactionSignature.current
                  ? 'Your NFT has been successfully minted and sent to your wallet.'
                  : 'There was an error minting your NFT. Please try again later.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {transactionSignature.current && (
                <div className="flex flex-col gap-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold">Transaction Details</h3>
                    <div className="text-muted-foreground max-w-[380px] font-mono text-xs break-words">
                      {transactionSignature.current}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`https://explorer.solana.com/tx/${transactionSignature.current}?cluster=devnet`}
                      target="_blank"
                    >
                      <Button variant="default" className="w-full">
                        View Transaction
                      </Button>
                    </Link>
                    <Link href={assetLink.current!} target="_blank">
                      <Button variant="default" className="w-full">
                        View Nft
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mb-4">
              <div className="flex w-full flex-col gap-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={handleClose}
                >
                  {transactionSignature.current ? 'Close' : 'Back to Lesson'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {stage === 'error' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                {nftData.current?.image && (
                  <div className="relative">
                    <Image
                      src={nftData.current.image}
                      alt={nftData.current.name || 'NFT'}
                      width={180}
                      height={180}
                      className="rounded-xl opacity-50 shadow-lg"
                    />
                    <div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-red-600">
                Minting Failed
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                We encountered an error while minting your NFT.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 font-semibold text-red-700">
                  Error Details
                </h3>
                <div className="text-sm text-red-600">
                  {errorMessage ||
                    'An unknown error occurred during the minting process.'}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">What you can try</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  <li>Check your wallet connection</li>
                  <li>Ensure you have enough SOL for transaction fees</li>
                  <li>Try again in a few minutes</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="mb-4">
              <div className="flex w-full flex-col gap-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setStage('loading')
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  size="lg"
                  onClick={handleClose}
                >
                  Back to Lesson
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {stage === 'coming-soon' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-md" />
                  <div className="relative rounded-full bg-white p-6">
                    <Loader2 className="h-16 w-16 animate-spin text-amber-500" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-amber-600">
                Coming Soon!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                DegenLingo Unit NFTs are currently in development and will be
                available soon.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-semibold text-amber-700">
                  NFT Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-600">Collection:</span>
                    <span className="font-medium">
                      DegenLingo Unit Collection
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">Status:</span>
                    <span className="font-medium">In Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">Blockchain:</span>
                    <span className="font-medium">Solana</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mb-4">
              <div className="flex w-full flex-col gap-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    close()
                    router.push(`/learn`)
                  }}
                >
                  Back to Lesson
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
