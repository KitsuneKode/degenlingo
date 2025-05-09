import Image from 'next/image'
import { cn } from '@/lib/utils'
import { InfinityIcon } from 'lucide-react'

type Props = {
  variant: 'points' | 'hearts'
  value: number
  hasActiveSubscription?: boolean
}

export const ResultCard = ({
  variant,
  value,
  hasActiveSubscription,
}: Props) => {
  const imageSrc = variant === 'points' ? '/points.svg' : '/heart.svg'

  return (
    <div
      className={cn(
        'w-full rounded-2xl border-2',
        variant === 'points' && 'border-orange-400 bg-orange-400',
        variant === 'hearts' && 'border-rose-500 bg-rose-500',
      )}
    >
      <div
        className={cn(
          'rounded-t-xl p-1.5 text-center text-xs font-bold text-white uppercase',
          variant === 'points' && 'bg-orange-400',
          variant === 'hearts' && 'bg-rose-500',
        )}
      >
        {variant === 'hearts' ? 'Hearts left' : 'Total XP'}
      </div>
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-white p-6 text-lg font-bold',
          variant === 'points' && 'text-orange-400',
          variant === 'hearts' && 'text-rose-500',
        )}
      >
        <Image
          src={imageSrc}
          alt="Icon"
          width={30}
          height={30}
          className="mr-1.5"
        />
        {hasActiveSubscription ? (
          <InfinityIcon className="h-6 w-6 shrink-0 stroke-[3]" />
        ) : (
          value
        )}
      </div>
    </div>
  )
}
