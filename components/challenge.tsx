import { cn } from '@/lib/utils'
import { challengeOptions, challenges } from '@/db/schema'
import { ChallengeCard } from '@/components/challenge-card'

type Props = {
  options: (typeof challengeOptions.$inferSelect)[]
  onSelect: (id: number) => void
  status: 'correct' | 'wrong' | 'none'
  selectedOption?: number
  disabled?: boolean
  type: (typeof challenges.$inferSelect)['type']
}

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: Props) => {
  return (
    <div
      className={cn(
        'grid gap-2',
        type === 'ASSIST' && 'grid-cols-1',
        type === 'SELECT' &&
          'grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
      )}
    >
      {options.map((option, i) => (
        <ChallengeCard
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.imgSrc}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          audioSrc={option.audioSrc}
          status={status}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          type={type}
        />
      ))}
    </div>
  )
}
