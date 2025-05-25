import { Header } from './header'
import { Unit } from '@/components/unit'
import { redirect } from 'next/navigation'
import { Promo } from '@/components/promo'
import { Quests } from '@/components/quests'

import { Wallet } from '@/components/wallet'
import { FeedWrapper } from '@/components/feed-wrapper'
import { UserProgress } from '@/components/user-progress'
import { StickyWrapper } from '@/components/sticky-wrapper'
import {
  getUnclaimedNftsUnits,
  getUnitsCompleted,
  getUserSubscription,
} from '@/db/queries'
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
  const unclaimedNftsData = getUnclaimedNftsUnits()
  const completedUnitsData = getUnitsCompleted()

  const [
    userProgress,
    units,
    lessonPercentage,
    courseProgress,
    userSubscription,
    unclaimedNfts,
    completedUnits,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    lessonPercentageData,
    courseProgressData,
    userSubscriptionData,
    unclaimedNftsData,
    completedUnitsData,
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
          tokens={userProgress.tokens}
          hasActiveSubscription={isActiveSubscription}
        />
        <Wallet />
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
              nftClaimed={!unclaimedNfts.some((nft) => nft.id === unit.id)}
              nftImageSrc={unit.nftImageSrc}
              unitCompleted={completedUnits.some(
                (completedUnit) => completedUnit.id === unit.id,
              )}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  )
}
