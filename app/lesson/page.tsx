import { Quiz } from '@/components/quiz'
import { getLesson, getUserProgress } from '@/db/queries'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Loader } from 'lucide-react'

const LessonPage = async () => {
  const lessonData = getLesson()
  const userProgressData = getUserProgress()

  const [lesson, userProgress] = await Promise.all([
    lessonData,
    userProgressData,
  ])

  if (!lesson || !userProgress) {
    redirect('/learn')
  }

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100

  return (
    <>
      <Suspense fallback={<Loader className="h-6 w-6 animate-spin" />}>
        <Quiz
          initialLessonId={lesson.id}
          initialLessonChallenges={lesson.challenges}
          initialHearts={userProgress.hearts}
          initialPercentage={initialPercentage}
          userSubscription={null}
        />
      </Suspense>
    </>
  )
}

export default LessonPage
