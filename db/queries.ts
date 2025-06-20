import { cache } from 'react'
import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { DAY_IN_MS } from '@/lib/constants'
import { auth } from '@clerk/nextjs/server'
import {
  courses,
  units,
  userProgress,
  challengeProgress,
  lessons,
  userSubscription,
  userRedeemedNfts,
  stripeSubscriptionDetails,
  solanaSubscriptionDetails,
} from '@/db/schema'

export const getUserProgress = cache(async () => {
  const { userId } = await auth()
  if (!userId) return null

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
      redeemedNfts: true,
    },
  })
  return data
})

export const getUnits = cache(async () => {
  const { userId } = await auth()
  const userProgress = await getUserProgress()

  if (!userId || !userProgress?.activeCourseId) return []

  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  })

  const normalizedData = data.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      // If there are no challenges, the lesson is considered incomplete
      if (!lesson.challenges.length) {
        return {
          ...lesson,
          completed: false,
        }
      }

      // Check if all challenges are completed
      const isCompleted = lesson.challenges.every(
        (challenge) =>
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed),
      )

      return {
        ...lesson,
        completed: isCompleted,
      }
    }),
  }))

  return normalizedData
})

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany({
    orderBy: (courses, { asc }) => [asc(courses.id)],
  })

  return data
})

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  })

  return data
})

export const getCourseProgress = cache(async () => {
  const { userId } = await auth()
  const userProgress = await getUserProgress()

  if (!userId || !userProgress?.activeCourseId) return null

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  })

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0
          // ||
          // challenge.challengeProgress.every((progress) => !progress.completed)
        )
      })
    })

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  }
})

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth()
  if (!userId) return null
  const courseProgress = await getCourseProgress()

  const lessonId = id || courseProgress?.activeLessonId

  if (!lessonId) return null

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  })

  if (!data || !data.challenges) return null

  const normalizedData = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed)

    return {
      ...challenge,
      completed,
    }
  })

  return {
    ...data,
    challenges: normalizedData,
  }
})

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress()

  if (!courseProgress?.activeLessonId) return 0

  const lesson = await getLesson(courseProgress.activeLessonId)

  if (!lesson) return 0

  const totalChallenges = lesson.challenges.length
  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed,
  ).length

  return Math.round((completedChallenges / totalChallenges) * 100)
})

export const getUserSubscription = cache(async () => {
  const { userId } = await auth()

  if (!userId) return null

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
    with: {},
  })

  if (!data) return null

  const isActive =
    data.subscriptionStatus === 'active' &&
    data.subscriptionEnd.getTime()! + DAY_IN_MS > Date.now()

  if (data.paymentMethod === 'stripe') {
    const existingSubscriptionDetails =
      await db.query.stripeSubscriptionDetails.findFirst({
        where: eq(stripeSubscriptionDetails.userSubscriptionId, data.id),
      })

    if (!existingSubscriptionDetails)
      return {
        ...data,
        isActive: !!isActive,
        stripeSubscriptionDetails: null,
        solanaSubscriptionDetails: null,
      }

    return {
      ...data,
      isActive: !!isActive,
      stripeSubscriptionDetails: existingSubscriptionDetails,
      solanaSubscriptionDetails: null,
    }
  }

  const existingSubscriptionDetails =
    await db.query.solanaSubscriptionDetails.findFirst({
      where: eq(solanaSubscriptionDetails.userSubscriptionId, data.id),
    })

  return {
    ...data,
    isActive: !!isActive,
    stripeSubscriptionDetails: null,
    solanaSubscriptionDetails: existingSubscriptionDetails,
  }
})

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth()

  if (!userId) return []

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  })

  if (!data) return []

  return data
})

export const getUnitsCompleted = cache(async () => {
  const { userId } = await auth()

  if (!userId) return []

  const userProgress = await getUserProgress()

  if (!userProgress) return []

  const units = await getUnits()

  if (!units) return []

  const completedUnits = units.filter((unit) =>
    unit.lessons.every((lesson) => lesson.completed),
  )
  return completedUnits
})

export const getUnclaimedNftsUnits = cache(async () => {
  const { userId } = await auth()

  if (!userId) return []

  const completedUnits = await getUnitsCompleted()

  if (!completedUnits) return []

  const redeemedNftsUnits = await db.query.userRedeemedNfts.findMany({
    where: eq(userRedeemedNfts.userId, userId),
  })

  const unclaimedUnits = completedUnits.filter(
    (unit) =>
      !redeemedNftsUnits.some((redeemedNft) => redeemedNft.unitId === unit.id),
  )

  return unclaimedUnits
})

export const getClaimedNftsUnits = cache(async () => {
  const { userId } = await auth()

  if (!userId) return []

  const redeemedNftsUnits = await db.query.userRedeemedNfts.findMany({
    where: eq(userRedeemedNfts.userId, userId),
  })

  return redeemedNftsUnits
})

export const getRedeemableTokens = cache(async () => {
  const { userId } = await auth()

  if (!userId) return null

  const userProgress = await getUserProgress()

  if (!userProgress) return null

  return userProgress.tokens
})

export const getNftDetails = cache(async (unitId: number) => {
  const { userId } = await auth()

  if (!userId) return null

  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
  })

  if (!unit) return null

  return unit
})
