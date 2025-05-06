import {
  getUnits,
  getUserProgress,
  getLessonPercentage,
  getCourseProgress,
} from '@/db/queries'
import { redirect } from 'next/navigation'
import { Unit } from '@/components/unit'
import { Header } from './header'
import { FeedWrapper } from '@/components/feed-wrapper'
import { StickyWrapper } from '@/components/sticky-wrapper'
import { UserProgress } from '@/components/user-progress'

export default async function LearnPage() {
  const userProgressData = getUserProgress()
  const unitsData = getUnits()
  const courseProgressData = getCourseProgress()
  const lessonPercentageData = getLessonPercentage()

  const [userProgress, units, lessonPercentage, courseProgress] =
    await Promise.all([
      userProgressData,
      unitsData,
      lessonPercentageData,
      courseProgressData,
    ])

  if (!userProgress || !userProgress.activeCourse) {
    redirect('/courses')
  }

  if (!courseProgress) {
    redirect('/courses')
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit) => (
          <div key={unit.id}>
            <Unit
              id={unit.id}
              title={unit.title}
              description={unit.description}
              order={unit.order}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  )
}
