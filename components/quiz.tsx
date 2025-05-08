'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { Header } from '@/app/lesson/header'

import Confetti from 'react-confetti'
import { useRouter } from 'next/navigation'
import { Footer } from '@/app/lesson/footer'
import { useState, useTransition } from 'react'
import { Challenge } from '@/components/challenge'
import { useAudio, useWindowSize } from 'react-use'
import { ResultCard } from '@/components/result-card'
import { reduceHearts } from '@/actions/user-progress'
import { useHeartModal } from '@/store/use-heart-modal'
import { challengeOptions, challenges } from '@/db/schema'
import { QuestionBubble } from '@/components/question-bubble'
import { MAX_HEARTS, POINTS_PER_CHALLENGE } from '@/lib/constants'
import { upsertChallengeProgress } from '@/actions/challenge-progess'

type Props = {
  initialLessonId: number
  initialHearts: number
  initialPercentage: number
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean
    challengeOptions: (typeof challengeOptions.$inferSelect)[]
  })[]
  userSubscription: undefined | any //TODO: fix
}

export const Quiz = ({
  initialLessonId,
  initialHearts,
  initialPercentage,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const { open: openHeartModal } = useHeartModal()
  const [pending, startTransition] = useTransition()
  const [hearts, setHearts] = useState(initialHearts)
  const [percentage, setPercentage] = useState(initialPercentage)
  const [lessonId] = useState(initialLessonId)
  const [challenges] = useState(initialLessonChallenges)
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed,
    )
    return uncompletedIndex === -1 ? 0 : uncompletedIndex
  })

  const [selectedOption, setSelectedOption] = useState<number>()
  const [status, setStatus] = useState<'correct' | 'wrong' | 'none'>('none')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: '/correct.wav' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: '/incorrect.wav',
  })
  const [finishAudio] = useAudio({ src: '/finish.mp3', autoPlay: true })

  const challenge = challenges[activeIndex]

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
      startTransition(() => {
        upsertChallengeProgress(challenge.id, selectedOption)
          .then((res) => {
            if (res?.error === 'hearts') {
              openHeartModal()
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
              openHeartModal()
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
    return (
      <>
        {finishAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
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
          <h1 className="text-xl font-bold text-neutral-700 lg:text-3xl">
            Great job! <br /> You&apos;ve completed the lesson
          </h1>
          <div className="flex w-full items-center gap-x-4">
            <ResultCard
              variant="points"
              value={challenges.length * POINTS_PER_CHALLENGE}
            />
            <ResultCard variant="hearts" value={hearts} />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          onCheck={() => router.push(`/learn`)}
          status="completed"
        />
      </>
    )
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
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
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
