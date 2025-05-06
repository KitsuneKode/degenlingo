'use client'

import { upsertChallengeProgress } from '@/actions/challenge-progess'
import { reduceHearts } from '@/actions/user-progress'
import { Footer } from '@/app/lesson/footer'
import { Header } from '@/app/lesson/header'
import { Challenge } from '@/components/challenge'
import { QuestionBubble } from '@/components/question-bubble'
import { challengeOptions, challenges } from '@/db/schema'
import { MAX_HEARTS, POINTS_PER_CHALLENGE } from '@/lib/constants'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useAudio } from 'react-use'
import { toast } from 'sonner'

type Props = {
  initialLessonId: number
  initialHearts: number
  initialPercentage: number

  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription: any //TODO: fix
}

export const Quiz = ({
  initialLessonId,
  initialHearts,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const [correctAudio, _c, correctControls] = useAudio({ src: '/correct.wav' })
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: '/incorrect.wav',
  })
  const [pending, startTransition] = useTransition()
  const [hearts, setHearts] = useState(initialHearts)
  const [percentage, setPercentage] = useState(initialPercentage)

  const [challenges] = useState(initialLessonChallenges)
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    )
    return uncompletedIndex === -1 ? 0 : uncompletedIndex
  })

  const [selectedOption, setSelectedOption] = useState<number>()
  const [status, setStatus] = useState<'correct' | 'wrong' | 'none'>('none')

  const challenge = challenges[activeIndex]

  if (!challenge) {
    return (
      <>
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center h-full items-center justify-center">
          <Image
            src="/finish.svg"
            width={100}
            height={100}
            alt="Finish"
            className="hidden lg:block"
          />
          <Image
            src="/finish.svg"
            width={50}
            height={50}
            alt="Finish"
            className="block lg:hidden"
          />
          <h1 className="lg:text-3xl text-xl font-bold tracking-wide text-neutral-700">
            Great job! You&apos;ve completed the lesson
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variants="points"
              value={challenges.length * POINTS_PER_CHALLENGE}
            />
          </div>
        </div>
      </>
    )
  }
  const options = challenge.challengeOptions ?? []

  const onSelect = (id: number) => {
    if (status !== 'none') return

    setSelectedOption(id)
  }

  const onNext = () => {
    setActiveIndex((current) => current + 1)
  }

  const onContinue = () => {
    if (!selectedOption) return

    if (status === 'wrong') {
      setStatus('none')
      setSelectedOption(undefined)
      return
    }

    if (status === 'correct') {
      onNext()
      setStatus('none')
      setSelectedOption(undefined)
      return
    }

    const correctOption = options.find((option) => option.correct)
    if (!correctOption) return

    if (selectedOption === correctOption.id) {
      // setStatus('correct')
      startTransition(() => {
        upsertChallengeProgress(challenge.id, selectedOption)
          .then((res) => {
            if (res?.error === 'hearts') {
              console.error('missing hearts')
              return
            }
            if (res?.error === 'option') {
              console.error('wrong option selected')
              return
            }

            correctControls.play()

            setStatus('correct')
            setPercentage((prev) => prev + 100 / challenges.length)

            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, MAX_HEARTS))
            }
          })
          .catch(() => toast.error('Something went wrong, Please try again'))
      })
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((res) => {
            if (res?.error === 'hearts') {
              console.error('missing hearts')
              return
            }

            incorrectControls.play()

            setStatus('wrong')

            if (!res?.error) {
              setHearts((prev) => Math.max(prev - 1, 0))
            }
          })
          .catch(() => toast.error('Something went wrong, Please try again'))
      })
    }
  }

  if (!challenge) {
    return <div>Finish the challenge</div>
  }

  const title =
    challenge.type === 'ASSIST'
      ? 'Select the correct meaning'
      : challenge.question

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>
            <div>
              {challenge.type === 'ASSIST' && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  )
}
