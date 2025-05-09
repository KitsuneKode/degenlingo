import Image from 'next/image'
import Items from '@/components/items'
import { redirect } from 'next/navigation'
import { FeedWrapper } from '@/components/feed-wrapper'
import { UserProgress } from '@/components/user-progress'
import { StickyWrapper } from '@/components/sticky-wrapper'
import { getUserProgress, getUserSubscription } from '@/db/queries'

export default async function ShopPage() {
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [userProgress, userSubscription] = await Promise.all([
    userProgressData,
    userSubscriptionData,
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
          hasActiveSubscription={isActiveSubscription}
        />
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/shop.svg" alt="Shop" width={100} height={100} />
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Shop
          </h1>
          <p className="text-muted-foreground mb-6 text-center text-lg">
            Spend your points on cool stuff
          </p>

          <Items
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={isActiveSubscription}
          />
        </div>
      </FeedWrapper>
    </div>
  )
}
