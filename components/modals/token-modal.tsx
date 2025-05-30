'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { redeemTokens } from '@/actions/redeem-tokens'
import { useTokenModal } from '@/store/use-token-modal'
import { useWallet } from '@solana/wallet-adapter-react'
import { MIN_REDEEMABLE_TOKEN_AMOUNT } from '@/lib/constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type RedeemStatus = 'idle' | 'processing' | 'completed' | 'error'

export const TokenModal = () => {
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close, tokenAmount } = useTokenModal()
  const [customAmount, setCustomAmount] = useState<number>(
    MIN_REDEEMABLE_TOKEN_AMOUNT,
  )
  const [error, setError] = useState<string>('')
  const [status, setStatus] = useState<RedeemStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const transactionSignature = useRef('')
  const { publicKey: walletPublicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (tokenAmount > 0) {
      setCustomAmount(Math.max(tokenAmount, MIN_REDEEMABLE_TOKEN_AMOUNT))
    }
    if (!isOpen) {
      setError('')
      setCustomAmount(Math.max(tokenAmount, MIN_REDEEMABLE_TOKEN_AMOUNT))

      if (status === 'completed') resetStatus()
    }
  }, [tokenAmount, isOpen, status])

  if (!isClient) {
    return null
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setCustomAmount(value)

    if (isNaN(value) || value < MIN_REDEEMABLE_TOKEN_AMOUNT) {
      setError(`Amount must be at least ${MIN_REDEEMABLE_TOKEN_AMOUNT} tokens`)
    } else if (value > tokenAmount) {
      setError(
        `You need to complete more lessons to redeem ${customAmount} tokens. Current balance: ${tokenAmount} tokens.`,
      )
    } else {
      setError('')
    }
  }

  const resetStatus = () => {
    setStatus('idle')
    setStatusMessage('')
    setIsRedeeming(false)
  }

  const handleRedeem = async () => {
    if (customAmount < MIN_REDEEMABLE_TOKEN_AMOUNT) {
      setError(`Amount must be at least ${MIN_REDEEMABLE_TOKEN_AMOUNT} tokens`)
      return
    }

    if (!walletPublicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (customAmount > tokenAmount) {
      return
    }

    setIsRedeeming(true)
    setStatus('processing')
    setStatusMessage(
      `Redeeming ${customAmount} tokens to wallet ${walletPublicKey?.toBase58()}...`,
    )

    try {
      const { signature } = await redeemTokens(
        walletPublicKey.toBase58(),
        customAmount,
      )

      if (!signature) {
        setStatus('error')
        setStatusMessage('Failed to redeem tokens. Please try again.')
        toast.error('Failed to redeem tokens')
        return
      }
      transactionSignature.current = signature

      setStatus('completed')
      setStatusMessage(`Successfully redeemed ${customAmount} tokens!`)
      toast.success('Tokens redeemed successfully!')
    } catch (error) {
      console.error(error)
      setStatus('error')
      setStatusMessage('Failed to redeem tokens. Please try again.')
      toast.error('Failed to redeem tokens')
    }
  }

  const handleCancel = () => {
    close()
    router.push(`/lesson/`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image src="/token.png" alt="Token" width={100} height={100} />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Redeem Tokens
          </DialogTitle>
          <DialogDescription
            className={cn('text-center text-base', isRedeeming && 'hidden')}
          >
            You currently have <span className="font-bold">{tokenAmount}</span>{' '}
            tokens.
            <br />
            Minimum redeemable amount is{' '}
            <span className="font-bold">
              {MIN_REDEEMABLE_TOKEN_AMOUNT}
            </span>{' '}
            tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {tokenAmount < MIN_REDEEMABLE_TOKEN_AMOUNT ? (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Not enough tokens
                  </p>
                  <p className="mt-1 text-sm text-yellow-700">
                    You need to complete more lessons to reach the minimum
                    redeemable amount of{' '}
                    <span className="font-bold">
                      {MIN_REDEEMABLE_TOKEN_AMOUNT}
                    </span>{' '}
                    tokens.
                    <br />
                    Current balance:{' '}
                    <span className="font-bold">{tokenAmount}</span> tokens.
                  </p>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-yellow-200">
                    <div
                      className="h-2.5 rounded-full bg-yellow-500"
                      style={{
                        width: `${Math.min(100, (tokenAmount / MIN_REDEEMABLE_TOKEN_AMOUNT) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : status === 'idle' ? (
            <div className="space-y-2">
              <label htmlFor="customAmount" className="text-sm font-medium">
                Amount to redeem:
              </label>
              <div className="flex items-center gap-x-2">
                <Input
                  id="customAmount"
                  type="number"
                  disabled={isRedeeming}
                  min={MIN_REDEEMABLE_TOKEN_AMOUNT}
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full"
                />
                <Button
                  onClick={() => {
                    setCustomAmount(tokenAmount)
                    setError('')
                  }}
                >
                  max
                </Button>
                <Button
                  onClick={() => {
                    setCustomAmount(MIN_REDEEMABLE_TOKEN_AMOUNT)
                    setError('')
                  }}
                >
                  min
                </Button>
              </div>

              {error && (
                <p className="text-sm break-words whitespace-pre-line text-red-500">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="my-6 flex flex-col items-center justify-center space-y-4 text-center">
              {status === 'processing' ? (
                <>
                  <div className="mb-2 flex items-center justify-center">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin text-amber-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/token.png"
                          alt="Token"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-sm font-medium tracking-wider text-gray-500 uppercase">
                          Transaction Details
                        </div>
                        <div className="flex justify-between border-b border-gray-100 py-2">
                          <span className="text-sm text-gray-600">Amount</span>
                          <span className="font-semibold">
                            {customAmount} tokens
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">
                            Recipient
                          </span>
                          <span className="max-w-[180px] truncate font-mono text-xs">
                            {walletPublicKey?.toBase58() ||
                              'Connecting wallet...'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            Processing
                          </span>
                          <span className="text-primary text-xs">
                            Please wait...
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: '70%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : status === 'completed' ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
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
                  <p className="text-lg font-medium">{statusMessage}</p>
                  <div className="flex flex-col gap-y-2">
                    <p className="text-md font-semibold">
                      Transaction Signature:
                    </p>
                    <div className="text-center text-sm font-bold">
                      <div className="text-muted-foreground max-w-md break-words">
                        {transactionSignature.current}
                      </div>
                    </div>
                    <Link
                      href={`https://explorer.solana.com/tx/${transactionSignature.current}?cluster=devnet`}
                      target="_blank"
                    >
                      <Button variant="default" className="w-full">
                        View Transaction
                      </Button>
                    </Link>
                  </div>
                </>
              ) : status === 'error' ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
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
                  <p className="text-lg font-medium">{statusMessage}</p>
                  <Button variant="default" onClick={resetStatus}>
                    Try Again
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            {tokenAmount >= MIN_REDEEMABLE_TOKEN_AMOUNT &&
              status === 'idle' && (
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={handleRedeem}
                  disabled={
                    isRedeeming ||
                    customAmount < MIN_REDEEMABLE_TOKEN_AMOUNT ||
                    customAmount > tokenAmount
                  }
                >
                  {isRedeeming ? (
                    <>
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Redeeming...
                    </>
                  ) : (
                    'Redeem Tokens'
                  )}
                </Button>
              )}
            {status === 'completed' && (
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleCancel}
              >
                Back to Lesson
              </Button>
            )}
            {(status === 'idle' || status === 'error') && (
              <Button
                variant="default"
                className="w-full"
                size="lg"
                disabled={isRedeeming}
                onClick={handleCancel}
              >
                Back to Lesson
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
