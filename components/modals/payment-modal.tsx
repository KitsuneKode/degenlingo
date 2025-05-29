'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { usePaymentModal } from '@/store/use-payment-modal'
import { upsertSolanaSubcription } from '@/actions/solana-subscription'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createStripeUrl,
  initiateSolanaPayment,
} from '@/actions/user-subscription'
import {
  LAMPORTS_PER_SOL,
  SystemInstruction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'awaiting'
  | 'processing'
  | 'completed'
  | 'error'

export const PaymentModal = () => {
  const [isClient, setIsClient] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'solana'>(
    'stripe',
  )
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const { isOpen, close } = usePaymentModal()
  const [pending, startTransition] = useTransition()
  const { publicKey: walletPublicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const transactionSignature = useRef('')

  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStripePayment = async () => {
    if (!pending) return

    startTransition(async () => {
      try {
        setStatus('initiating')
        setStatusMessage('Preparing Stripe checkout...')

        const response = await createStripeUrl()

        if (response?.data) {
          window.location.href = response.data
        } else {
          throw new Error('Failed to create Stripe checkout URL')
        }
      } catch {
        // console.error('Stripe payment error:', error)
        toast.error('Failed to initiate Stripe payment')
        setStatus('error')
        setStatusMessage('Failed to initiate payment. Please try again.')
      }
    })
  }

  const handleSolanaPayment = async () => {
    if (pending || !walletPublicKey) {
      if (!walletPublicKey) {
        toast.error('Please connect your wallet first')
      }
      return
    }

    startTransition(async () => {
      try {
        setStatus('initiating')
        setStatusMessage('Initiating Solana payment...')
        const { transactionBase64, reference, expectedSolAmount } =
          await initiateSolanaPayment(walletPublicKey.toString())

        if (transactionBase64 && reference && expectedSolAmount) {
          setStatus('awaiting')
          setStatusMessage('Waiting for transaction confirmation...')
        } else {
          throw new Error('Failed to initiate Solana payment')
        }

        const transaction = Transaction.from(
          Buffer.from(transactionBase64, 'base64'),
        )

        const firstInstruction = transaction.instructions[0]

        if (
          !firstInstruction ||
          !firstInstruction.programId.equals(SystemProgram.programId) ||
          !firstInstruction.data ||
          !firstInstruction.keys[0].pubkey.equals(walletPublicKey)
        ) {
          const decodedTransfer =
            SystemInstruction.decodeTransfer(firstInstruction)
          if (
            decodedTransfer.lamports !==
            BigInt(Number(expectedSolAmount) * LAMPORTS_PER_SOL)
          ) {
            toast.error('Transaction amount mismatch')
            setStatus('error')
            setStatusMessage('Transaction amount mismatch')
            return
          }
          toast.error('Transaction details tampered with or invalid. Aborting.')
          setStatus('error')
          setStatusMessage(
            'Transaction details tampered with or invalid. Aborting.',
          )
          return
        }

        transactionSignature.current = await sendTransaction(
          transaction,
          connection,
          { skipPreflight: false },
        )

        setStatus('processing')
        setStatusMessage('Processing payment...')

        await upsertSolanaSubcription(
          walletPublicKey.toString(),
          reference,
          expectedSolAmount,
          transactionSignature.current,
          'processed',
        )

        const latestBlockHash = await connection.getLatestBlockhash()

        await connection.confirmTransaction(
          {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: transactionSignature.current,
          },
          'confirmed',
        )

        setStatus('completed')
        setStatusMessage('Payment successful! ')

        await upsertSolanaSubcription(
          walletPublicKey.toString(),
          reference,
          expectedSolAmount,
          transactionSignature.current,
          'confirmed',
        )

        router.refresh()

        toast.success(
          `Payment successful! Transaction: ${transactionSignature.current}`,
        )
      } catch (err) {
        if (err instanceof Error && err.message?.includes('User rejected')) {
          toast.error('Transaction was rejected by the user.')
          setStatus('error')
          setStatusMessage('Transaction was rejected by the user.')
          return
        }

        console.log(err)
        toast.error('Transaction failed. Please try again.')
        setStatus('error')
        setStatusMessage('Failed to initiate payment. Please try again.')
      }
    })

    // try {
    //   setStatus('initiating')
    //   setStatusMessage('Initiating Solana payment...')

    //   const response = await initiateSolanaPayment(publicKey.toString())

    //   const { transactionBase64, reference, expectedSolAmount } = response

    //   if (response) {
    //     setStatus('awaiting')
    //     setStatusMessage('Please confirm the transaction in your wallet')
    //   } else {
    //     throw new Error('Failed to initiate Solana payment')
    //   }
    // } catch (error) {
    //   console.error('Solana payment error:', error)
    //   toast.error('Failed to initiate Solana payment')
    //   setStatus('error')
    //   setStatusMessage('Failed to initiate payment. Please try again.')
    // }
  }

  const resetStatus = () => {
    setStatus('idle')
    setStatusMessage('')
  }

  const handleClose = () => {
    resetStatus()
    close()
  }

  if (!isClient) {
    return null
  }

  const onUpgrade = () => {
    if (pending || status !== 'idle') return

    startTransition(async () => {
      if (paymentMethod === 'stripe') {
        await handleStripePayment()
      } else {
        await handleSolanaPayment()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/icon.jpeg"
              alt="Premium"
              width={100}
              height={100}
              className="rounded-xl"
            />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get unlimited hearts and unlock free NFT rewards
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' ? (
          <Tabs
            defaultValue="stripe"
            onValueChange={(value: string) =>
              setPaymentMethod(value as 'stripe' | 'solana')
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="solana">Solana</TabsTrigger>
            </TabsList>
            <TabsContent value="stripe" className="mt-4">
              <div className="mb-4 rounded-lg border p-4">
                <div className="flex flex-1 items-center justify-between">
                  <div className="gap-4">
                    <h3 className="font-semibold">Pay with Credit Card</h3>
                    <p className="text-muted-foreground text-sm">
                      Secure payment via Stripe
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">$20.00 / month</span>
                    </div>
                  </div>

                  <Image
                    className="rounded-lg"
                    src="/stripe.png"
                    alt="Stripe"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="solana" className="mt-4">
              <div className="mb-4 rounded-lg border p-4">
                <div className="flex flex-1 items-center justify-between">
                  <div className="gap-4">
                    <h3 className="font-semibold">Pay with Solana</h3>
                    <p className="text-muted-foreground text-sm">
                      One-time payment with SOL
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">~ 0.12 SOL</span>
                    </div>
                  </div>
                  <Image
                    className="rounded-lg"
                    src="/sol-image.png"
                    alt="Solana"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
              {!connected && (
                <div className="mb-4 flex justify-center">
                  <WalletMultiButton />
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="my-6 flex flex-col items-center justify-center space-y-4 text-center">
            {status === 'initiating' ||
            status === 'awaiting' ||
            status === 'processing' ? (
              <Loader2 className="text-primary h-12 w-12 animate-spin" />
            ) : status === 'completed' ? (
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
            ) : (
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
            )}
            <p className="text-lg font-medium">{statusMessage}</p>
            {status === 'completed' && (
              <div className="flex flex-col gap-y-2">
                <p className="text-md font-semibold">Transaction Signature:</p>
                <div className="text-center text-sm font-bold">
                  <div className="text-muted-foreground max-w-md break-words">
                    {transactionSignature.current}
                  </div>
                </div>
                <Link
                  href={`https://explorer.solana.com/tx/${transactionSignature.current}?cluster=devnet`}
                >
                  <Button variant="default">View Transaction</Button>
                </Link>
              </div>
            )}
            {status === 'error' && (
              <Button variant="default" onClick={resetStatus}>
                Try Again
              </Button>
            )}
          </div>
        )}

        <DialogFooter className="mb-4">
          {status === 'idle' && (
            <div className="flex w-full flex-col gap-y-4">
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={onUpgrade}
                disabled={
                  paymentMethod === 'solana' &&
                  (!connected || status !== 'idle')
                }
              >
                {paymentMethod === 'stripe'
                  ? 'Continue to Checkout'
                  : 'Pay with Solana'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
