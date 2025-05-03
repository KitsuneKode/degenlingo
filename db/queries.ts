import { cache } from 'react'
import db from './drizzle'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { courses, units, userProgress } from './schema'

export const getUserProgress = cache(async () => {
  const { userId } = await auth()
  if (!userId) return null

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  })
  return data
})

export const getUnits = cache(async () => {
  const userProgress = await getUserProgress()

  if (!userProgress?.activeCourseId) return []

  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: true,
            },
          },
        },
      },
    },
  })

  const normalizedData = data.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const isCompleted = lesson.challenges.reduce(
        (allCompleted, challenge) => {
          if (!allCompleted) return false
          return (
            challenge.challengeProgress &&
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((progress) => progress.completed)
          )
        },
        true
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
    // orderBy: (courses, { asc }) => [asc(courses.id)],
  })

  return data
})

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  return data
})
