'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { refillHearts } from '@/actions/user-progress'
import { usePaymentModal } from '@/store/use-payment-modal'
import { HEARTS_REFILL_COST, MAX_HEARTS } from '@/lib/constants'

type Props = {
  hearts: number
  points: number
  hasActiveSubscription: boolean
  subscriptionType: 'stripe' | 'solana' | null
}

export const ShopItems = ({
  hearts,
  points,
  hasActiveSubscription,
  subscriptionType,
}: Props) => {
  const [pending, startTransition] = useTransition()

  const { open: openPaymentModal } = usePaymentModal()

  console.log({ subscriptionType })

  const onRefillHearts = () => {
    if (pending || hearts === MAX_HEARTS || points < HEARTS_REFILL_COST) return

    startTransition(() => {
      refillHearts().catch(() => toast.error('Something went wrong'))
    })
  }

  return (
    <ul className="w-full">
      <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
        <Image src="/heart.svg" alt="Heart" width={60} height={60} />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Refill hearts
          </p>
        </div>
        <Button
          disabled={
            pending ||
            hearts === MAX_HEARTS ||
            points < HEARTS_REFILL_COST ||
            hasActiveSubscription
          }
          onClick={onRefillHearts}
        >
          {hearts === MAX_HEARTS || hasActiveSubscription ? (
            'full'
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" width={20} height={20} />
              <p>{HEARTS_REFILL_COST}</p>
            </div>
          )}
        </Button>
      </div>
      <div className="flex w-full items-center justify-between gap-x-4 border-t-2 p-4">
        <Image src="/unlimited.svg" alt="Unlimited" width={60} height={60} />
        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Unlimited hearts
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
    </ul>
  )
}
