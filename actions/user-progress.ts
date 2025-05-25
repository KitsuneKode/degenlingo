'use server'
import db from '@/db/drizzle'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { HEARTS_REFILL_COST, MAX_HEARTS } from '@/lib/constants'
import { userProgress, challengeProgress, challenges } from '@/db/schema'
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from '@/db/queries'

export const upsertUserProgress = async (courseId: number) => {
  const { userId, sessionClaims } = await auth()

  const user = await currentUser()

  if (!userId || !user) throw new Error('Unauthorized')

  const course = await getCourseById(courseId)

  const walletAddress = sessionClaims?.metadata.wallet?.address

  if (!course) throw new Error('Course not found')

  if (!course.units.length || !course.units[0].lessons.length)
    throw new Error('Course is empty')

  const existingUserProgress = await getUserProgress()

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || 'User',
      userImageSrc: user.imageUrl || '/mascot.svg',
      walletAddress,
    })

    revalidatePath('/courses')
    revalidatePath('/learn')
    redirect('/learn')
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || 'User',
    userImageSrc: user.imageUrl || '/mascot.svg',
    walletAddress,
  })

  revalidatePath('/courses')
  revalidatePath('/learn')
  redirect('/learn')
}

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const currentUserProgress = await getUserProgress()
  const userSubscription = await getUserSubscription()

  if (!currentUserProgress) throw new Error('User progress not found')

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  })

  if (!challenge) throw new Error('Challenge not found')

  const lessonId = challenge.lessonId

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  })

  const isPractice = !!existingChallengeProgress

  if (isPractice) {
    return { error: 'practice' }
  }

  if (userSubscription?.isActive) {
    return { error: 'subscription' }
  }

  if (currentUserProgress.hearts === 0) {
    return { error: 'hearts' }
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId))

  revalidatePath('/learn')
  revalidatePath('/lesson')
  revalidatePath('/shop')
  revalidatePath('/quests')
  revalidatePath('/leaderboard')
  revalidatePath(`/lesson/${lessonId}`)
}

export const refillHearts = async () => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) throw new Error('User progress not found')

  if (currentUserProgress.hearts === MAX_HEARTS)
    throw new Error('Hearts are full')

  if (currentUserProgress.points < HEARTS_REFILL_COST)
    throw new Error('Not enough points')

  await db
    .update(userProgress)
    .set({
      hearts: MAX_HEARTS,
      points: currentUserProgress.points - HEARTS_REFILL_COST,
    })
    .where(eq(userProgress.userId, userId))

  revalidatePath('/shop')
  revalidatePath('/learn')
  revalidatePath('/quests')
  revalidatePath('/leaderboard')
}

export const reduceTokens = async () => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')

  const currentUserProgress = await getUserProgress()

  if (!currentUserProgress) throw new Error('User progress not found')

  if (currentUserProgress.tokens === 0) throw new Error('Tokens are empty')

  await db
    .update(userProgress)
    .set({
      tokens: 0,
    })
    .where(eq(userProgress.userId, userId))

  revalidatePath('/shop')
  revalidatePath('/learn')
  revalidatePath('/quests')
  revalidatePath('/lessons')
  revalidatePath('/leaderboard')
  revalidatePath('/tokens')
}
