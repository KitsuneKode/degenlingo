import { StickyWrapper } from '@/components/sticky-wrapper'
import { FeedWrapper } from '@/components/feed-wrapper'
import { Header } from './header'
import { UserProgress } from '@/components/user-progress'
import { getUnits, getUserProgress } from '@/db/queries'
import { redirect } from 'next/navigation'

export default async function LearnPage() {
  const userProgressData = getUserProgress()
  const unitsData = getUnits()

  const [userProgress, units] = await Promise.all([userProgressData, unitsData])

  if (!userProgress || !userProgress.activeCourse) {
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
          <div key={unit.id}>{JSON.stringify(unit)}</div>
        ))}
      </FeedWrapper>
    </div>
  )
}
