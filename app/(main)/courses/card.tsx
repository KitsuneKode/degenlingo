import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'

type Props = {
  id: number
  title: string
  imageSrc: string
  onClick: (id: number) => void
  disabled?: boolean
  active?: boolean
}

export const Card = ({
  id,
  title,
  imageSrc,
  onClick,
  disabled,
  active,
}: Props) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        'h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className={cn('min-[240px] w-full flex items-center justify-end')}>
        {active && (
          <div className="rounded-md bg-pink-600 flex items-center justify-center p-1.5">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>
      <Image
        src={imageSrc}
        alt={title}
        height={70}
        width={93.33}
        className="rounded-lg drop-shadow-md border object-cover"
      />
      <p className="text-center text-neutral-700 mt-3 font-bold">{title}</p>
    </div>
  )
}
