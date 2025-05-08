'use client'

import { cn } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'
import { useKey, useMedia } from 'react-use'
import { Button } from '@/components/ui/button'

type Props = {
  onCheck: () => void
  status: 'correct' | 'wrong' | 'none' | 'completed'
  disabled?: boolean
  lessonId?: number
}

export const Footer = ({ onCheck, status, disabled, lessonId }: Props) => {
  useKey('Enter', onCheck, {}, [onCheck])
  const isMobile = useMedia('(max-width: 1024px)')

  return (
    <footer
      className={cn(
        'lg:-h[140px] h-[100px] border-t-2',
        status === 'correct' && 'border-transparent bg-purple-100',
        status === 'wrong' && 'border-transparent bg-rose-100',
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        {status === 'correct' && (
          <div className="flex items-center text-base font-extrabold text-purple-500 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            Nicely done!
          </div>
        )}
        {status === 'wrong' && (
          <div className="flex items-center text-base font-extrabold text-rose-500 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            Try again!
          </div>
        )}
        {status === 'completed' && (
          <Button
            variant="default"
            size={isMobile ? 'sm' : 'lg'}
            onClick={() => (window.location.href = `/lesson/${lessonId}`)}
          >
            Practice Again
          </Button>
        )}
        <Button
          className="ml-auto"
          onClick={onCheck}
          disabled={disabled}
          size={isMobile ? 'sm' : 'lg'}
          variant={status === 'wrong' ? 'destructive' : 'secondary'}
        >
          {status === 'correct' && 'Next'}
          {status === 'wrong' && 'Try Again'}
          {status === 'none' && 'Check'}
          {status === 'completed' && 'Continue'}
        </Button>
      </div>
    </footer>
  )
}
