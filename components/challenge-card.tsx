'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'
import { challenges } from '@/db/schema'
import { useAudio, useKey } from 'react-use'

type Props = {
  id: number
  text: string
  imageSrc: string | null
  audioSrc: string | null
  shortcut: string
  selected?: boolean
  status?: 'correct' | 'wrong' | 'none'
  onClick: () => void
  disabled?: boolean
  type: (typeof challenges.$inferSelect)['type']
}

export const ChallengeCard = ({
  id,
  text,
  imageSrc,
  shortcut,
  selected,
  status,
  onClick,
  disabled,
  type,
  audioSrc,
}: Props) => {
  const [audio, _, controls] = useAudio({ src: audioSrc || '' })

  const handleClick = useCallback(() => {
    if (disabled) return

    controls.play()
    onClick()
  }, [disabled, onClick, controls])

  useKey(shortcut, handleClick, {}, [handleClick])

  return (
    <div
      onClick={handleClick}
      className={cn(
        'h-full cursor-pointer rounded-xl border-2 border-b-4 p-4 hover:bg-black/5 active:border-b-2 lg:p-6',
        selected && 'border-cyan-300 bg-cyan-100 hover:bg-cyan-100',
        selected &&
          status === 'correct' &&
          'border-green-300 bg-green-100 hover:bg-green-100',
        selected &&
          status === 'wrong' &&
          'border-rose-300 bg-rose-100 hover:bg-rose-100',
        disabled && 'pointer-events-none hover:bg-white',
        type === 'ASSIST' && 'w-full lg:p-3',
      )}
    >
      {audio}
      {imageSrc && (
        <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[150px]">
          <Image src={imageSrc} alt={text} fill />
        </div>
      )}
      <div
        className={cn(
          'flex items-center justify-between',
          type === 'ASSIST' && 'flex-row-reverse',
        )}
      >
        {type === 'ASSIST' && <div />}

        <p
          className={cn(
            'text-sm text-neutral-600 lg:text-base',
            selected && 'text-cyan-500',
            selected && status === 'correct' && 'text-green-500',
            selected && status === 'wrong' && 'text-rose-500',
          )}
        >
          {text}
        </p>
        <div
          className={cn(
            'flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-sm font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]',
            selected && 'border-cyan-500 text-cyan-500',
            selected &&
              status === 'correct' &&
              'border-green-500 text-green-500',
            selected && status === 'wrong' && 'border-rose-500 text-rose-500',
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  )
}
