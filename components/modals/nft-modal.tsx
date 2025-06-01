'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNFTModal } from '@/store/use-nft-modal'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Fun loading messages for the minting stage
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
  const [isClient, setIsClient] = useState(false)
  const {
    isOpen,
    close,
    nftImage,
    nftName,
    nftDescription,
    transactionSignature,
    // setTransactionSignature,
    stage,
    setStage,
  } = useNFTModal()

  // We'll use the loading messages array directly instead of a separate state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const { publicKey: walletPublicKey } = useWallet()
  const router = useRouter()
  const progress = useRef(0)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Reset loading message index when modal is closed
      setLoadingMessageIndex(0)
    }
  }, [isOpen])

  // Handle loading animation and messages for minting stage
  useEffect(() => {
    if (stage === 'minting') {
      progress.current = 10 // Start with 10%

      // Progress animation
      const timer1 = setTimeout(() => {
        progress.current = 30
      }, 1000)

      const timer2 = setTimeout(() => {
        progress.current = 60
      }, 2000)

      const timer3 = setTimeout(() => {
        progress.current = 90
      }, 3000)

      // Cycle through fun loading messages
      const messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 3000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearInterval(messageInterval)
      }
    }
  }, [stage])

  if (!isClient) {
    return null
  }

  const handleStartMinting = () => {
    setStage('minting')
    // Call the global mintNFT function that was set in token-items.tsx
    // if (typeof window !== 'undefined' && window.mintNFT) {
    //   // Clear any previous transaction signature
    //   setTransactionSignature('')
    //   window.mintNFT()
    // } else {
    toast.error('Minting function not available')
    setStage('preview')
    // }
  }

  const handleClose = () => {
    close()
    if (stage === 'result') {
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        {/* NFT Preview Stage */}
        {stage === 'preview' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                {nftImage && (
                  <Image
                    src={nftImage}
                    alt={nftName || 'NFT'}
                    width={200}
                    height={200}
                    className="rounded-xl shadow-lg"
                  />
                )}
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                {nftName || 'Claim Your NFT'}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {nftDescription ||
                  'Complete your collection with this exclusive NFT reward.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">NFT Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection:</span>
                    <span className="font-medium">DegenLingo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blockchain:</span>
                    <span className="font-medium">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="max-w-[180px] truncate font-mono text-xs">
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
                  onClick={handleStartMinting}
                >
                  Mint NFT
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

        {/* Minting Stage */}
        {stage === 'minting' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                <div className="relative">
                  <Loader2 className="h-20 w-20 animate-spin text-amber-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {nftImage && (
                      <Image
                        src={nftImage}
                        alt={nftName || 'NFT'}
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
                        {nftName || 'Your NFT'}
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
                        style={{ width: `${progress.current}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Result Stage */}
        {stage === 'result' && (
          <>
            <DialogHeader>
              <div className="mb-5 flex w-full items-center justify-center">
                {nftImage && (
                  <div className="relative">
                    <Image
                      src={nftImage}
                      alt={nftName || 'NFT'}
                      width={180}
                      height={180}
                      className="rounded-xl shadow-lg"
                    />
                    {transactionSignature && (
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
                {transactionSignature
                  ? 'NFT Minted Successfully!'
                  : 'Minting Failed'}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {transactionSignature
                  ? 'Your NFT has been successfully minted and sent to your wallet.'
                  : 'There was an error minting your NFT. Please try again later.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {transactionSignature && (
                <div className="flex flex-col gap-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold">Transaction Details</h3>
                    <div className="text-muted-foreground max-w-md font-mono text-xs break-words">
                      {transactionSignature}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                      target="_blank"
                    >
                      <Button variant="default" className="w-full">
                        View Transaction
                      </Button>
                    </Link>
                    <Link
                      href={`https://magiceden.io/item-details/`}
                      target="_blank"
                    >
                      <Button variant="default" className="w-full">
                        View Collection
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
                  {transactionSignature ? 'Close' : 'Back to Lesson'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
