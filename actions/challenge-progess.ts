'use server'

import db from '@/db/drizzle'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { getUserProgress, getUserSubscription } from '@/db/queries'
import { challengeProgress, challenges, userProgress } from '@/db/schema'
import {
  MAX_HEARTS,
  POINTS_PER_CHALLENGE,
  TOKENS_PER_CHALLENGE,
} from '@/lib/constants'

export const upsertChallengeProgress = async (
  challengeId: number,
  optionId: number,
) => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const currentUserProgress = await getUserProgress()
  const userSubscription = await getUserSubscription()

  if (!currentUserProgress?.activeCourseId)
    throw new Error('User progress not found')

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
    with: {
      challengeOptions: true,
    },
  })

  if (!challenge) throw new Error('Challenge not found')

  const lessonId = challenge.lessonId

  const correctOption = challenge.challengeOptions.find(
    (option) => option.correct,
  )

  if (!correctOption || optionId !== correctOption.id)
    throw new Error('Incorrect options selected')

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  })
  const isPractice = !!existingChallengeProgress

  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    return { error: 'hearts' }
  }

  if (isPractice) {
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id))

    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
        points: currentUserProgress.points + POINTS_PER_CHALLENGE,
      })
      .where(eq(userProgress.userId, userId))

    revalidatePath('/learn')
    revalidatePath('/lesson')
    revalidatePath('/quests')
    revalidatePath('/leaderboard')
    revalidatePath(`/lesson/${lessonId}`)
    return
  }

  await db.insert(challengeProgress).values({
    userId,
    challengeId,
    completed: true,
  })

  await db
    .update(userProgress)
    .set({
      hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
      points: currentUserProgress.points + POINTS_PER_CHALLENGE,
      tokens: currentUserProgress.tokens + TOKENS_PER_CHALLENGE,
    })
    .where(eq(userProgress.userId, userId))

  revalidatePath('/learn')
  revalidatePath('/lesson')
  revalidatePath('/quests')
  revalidatePath('/leaderboard')
  revalidatePath(`/lesson/${lessonId}`)
}
