'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { refillHearts } from '@/actions/user-progress'
import { createStripeUrl } from '@/actions/user-subscription'
import { HEARTS_REFILL_COST, MAX_HEARTS } from '@/lib/constants'

type Props = {
  hearts: number
  points: number
  hasActiveSubscription: boolean
}

export const ShopItems = ({ hearts, points, hasActiveSubscription }: Props) => {
  const [pending, startTransition] = useTransition()

  const onRefillHearts = () => {
    if (pending || hearts === MAX_HEARTS || points < HEARTS_REFILL_COST) return

    startTransition(() => {
      refillHearts().catch(() => toast.error('Something went wrong'))
    })
  }

  const onUpgrade = () => {
    if (pending) return

    startTransition(() => {
      createStripeUrl()
        .then((res) => {
          if (res.data) {
            window.location.href = res.data
          }
        })
        .catch(() => toast.error('Something went wrong'))
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
            pending || hearts === MAX_HEARTS || points < HEARTS_REFILL_COST
          }
          onClick={onRefillHearts}
        >
          {hearts === MAX_HEARTS ? (
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
        </div>
        <Button disabled={pending} onClick={onUpgrade}>
          {hasActiveSubscription ? 'settings' : 'upgrade'}
        </Button>
      </div>
    </ul>
  )
}
