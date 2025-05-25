import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Promo } from '@/components/promo'

import { Quests } from '@/components/quests'

import { Wallet } from '@/components/wallet'

import { Separator } from '@/components/ui/separator'
import { FeedWrapper } from '@/components/feed-wrapper'
import { UserProgress } from '@/components/user-progress'
import { StickyWrapper } from '@/components/sticky-wrapper'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  getTopTenUsers,
  getUserProgress,
  getUserSubscription,
} from '@/db/queries'

export default async function LeaderboardPage() {
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()
  const leaderboardData = getTopTenUsers()

  const [userProgress, userSubscription, leaderboard] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    leaderboardData,
  ])

  if (!userProgress || !userProgress.activeCourse) {
    redirect('/learn')
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
        <div className="flex w-full flex-col items-center">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            width={100}
            height={100}
          />
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mb-6 text-center text-lg">
            See how you compare to other learners in the community
          </p>
          <Separator className="mb-4 h-0.5 rounded-full" />

          {leaderboard.map((userProgress, index) => (
            <div
              key={userProgress.userId}
              className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
            >
              <p className="mr-4 font-bold text-lime-700">{index + 1}</p>
              <Avatar className="mr-6 ml-3 h-12 w-12 border bg-green-500">
                <AvatarImage
                  className="object-cover"
                  src={userProgress.userImageSrc}
                />
              </Avatar>
              <p className="flex-1 font-bold text-neutral-800">
                {userProgress.userName}
              </p>
              <p className="text-muted-foreground font-semibold">
                {userProgress.points} XP
              </p>
            </div>
          ))}
        </div>
      </FeedWrapper>
    </div>
  )
}
