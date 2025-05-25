import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Promo } from '@/components/promo'

import { Quests } from '@/components/quests'

import { Wallet } from '@/components/wallet'
import { TokenItems } from '@/components/token-items'
import { FeedWrapper } from '@/components/feed-wrapper'
import { UserProgress } from '@/components/user-progress'
import { StickyWrapper } from '@/components/sticky-wrapper'
import {
  getUnclaimedNftsUnits,
  getUserProgress,
  getUserSubscription,
} from '@/db/queries'

export default async function TokensPage() {
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const unclaimedNftsData = getUnclaimedNftsUnits()

  const [userProgress, userSubscription, unclaimedNfts] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    unclaimedNftsData,
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
          <Image src="/token.png" alt="Tokens" width={120} height={120} />
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Tokens
          </h1>
          <p className="text-muted-foreground mb-6 text-center text-lg">
            Redeem your tokens for <b>NFTs</b> and get examination discounts
            {!isActiveSubscription && (
              <span className="text-muted-foreground mb-6 text-center text-base">
                <br />
                Upgrade to <b>Premium</b> to unlock free <b>NFT rewards</b>,
                examination discounts and more
              </span>
            )}
          </p>

          <TokenItems
            tokens={userProgress.tokens}
            hasActiveSubscription={isActiveSubscription}
            unclaimedNfts={unclaimedNfts}
            activeCourseName={userProgress.activeCourse.title}
          />
        </div>
      </FeedWrapper>
    </div>
  )
}
