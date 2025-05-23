import { Header } from './header'
import { Unit } from '@/components/unit'
import { redirect } from 'next/navigation'
import { Promo } from '@/components/promo'
import { Quests } from '@/components/quests'
import { getUserSubscription } from '@/db/queries'
import { FeedWrapper } from '@/components/feed-wrapper'
import { UserProgress } from '@/components/user-progress'
import { StickyWrapper } from '@/components/sticky-wrapper'
import {
  getUnits,
  getUserProgress,
  getLessonPercentage,
  getCourseProgress,
} from '@/db/queries'

export default async function LearnPage() {
  const userProgressData = getUserProgress()
  const unitsData = getUnits()
  const courseProgressData = getCourseProgress()
  const lessonPercentageData = getLessonPercentage()
  const userSubscriptionData = getUserSubscription()

  const [
    userProgress,
    units,
    lessonPercentage,
    courseProgress,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    lessonPercentageData,
    courseProgressData,
    userSubscriptionData,
  ])

  if (!userProgress || !userProgress.activeCourse) {
    redirect('/courses')
  }

  if (!courseProgress) {
    redirect('/courses')
  }

  const isActiveSubscription = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isActiveSubscription}
        />
        {!isActiveSubscription && <Promo />}
        <Quests points={userProgress.points} />
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
