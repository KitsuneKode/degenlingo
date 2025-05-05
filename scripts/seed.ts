import 'dotenv/config'

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sql, schema })

const main = async () => {
  try {
    console.log('Seeding database...')

    await db.delete(schema.courses)
    await db.delete(schema.userProgress)
    await db.delete(schema.lessons)
    await db.delete(schema.challenges)
    await db.delete(schema.challengeOptions)
    await db.delete(schema.challengeProgress)

    await db.insert(schema.courses).values([
      { id: 1, title: 'English', imageSrc: '/en.svg' },
      { id: 2, title: 'Spanish', imageSrc: '/es.svg' },
      { id: 3, title: 'Japanese', imageSrc: '/jp.svg' },
      { id: 4, title: 'French', imageSrc: '/fr.svg' },
      { id: 5, title: 'Italian', imageSrc: '/it.svg' },
      { id: 6, title: 'Hindi', imageSrc: '/in.svg' },
    ])

    await db.insert(schema.units).values([
      {
        id: 1,
        title: 'Unit 1',
        description: 'Learn basics of Spanish',
        courseId: 2,
        order: 1,
      },
    ])

    await db.insert(schema.lessons).values([
      {
        id: 1,
        title: 'Nouns',
        unitId: 1,
        order: 1,
      },
      {
        id: 2,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 3,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 4,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 5,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 6,
        title: 'Nouns',
        unitId: 1,
        order: 1,
      },
      {
        id: 7,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 8,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 9,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
      {
        id: 10,
        title: 'Adjectives',
        unitId: 1,
        order: 2,
      },
    ])

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        type: 'SELECT',
        question: 'What one of these is the "the man"?',
        order: 1,
      },
      //   {
      //     id: 2,
      //     lessonId: 2,
      //     type: 'SELECT',
      //     question: '',
      //     order: 1,
      //   }
    ])

    await db.insert(schema.challengeOptions).values([
      {
        id: 1,
        challengeId: 1,
        text: 'el hombre',
        correct: true,
        imgSrc: '/man.svg',
        audioSrc: '/es_man.mp3',
      },
      {
        id: 2,
        challengeId: 1,
        text: 'la mujer',
        correct: false,
        imgSrc: '/woman.svg',
        audioSrc: '/es_woman.mp3',
      },
      {
        id: 3,
        challengeId: 1,
        text: 'el robot',
        correct: false,
        imgSrc: '/robot.svg',
        audioSrc: '/es_robot.mp3',
      },
    ])

    console.log('Database seeded successfully')
  } catch (err) {
    console.error(err)
    throw new Error('Failed to seed database')
  }
}

main()
