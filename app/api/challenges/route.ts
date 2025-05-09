import db from '@/db/drizzle'
import { checkRole } from '@/lib/roles'
import { challenges } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async () => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.challenges.findMany()

  return NextResponse.json(data)
}

export const POST = async (req: NextRequest) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.question || !body.type || !body.order) {
    return NextResponse.json(
      { error: 'Missing question, type, lesson, or order' },
      { status: 400 },
    )
  }

  const data = await db
    .insert(challenges)
    .values({
      ...body,
    })
    .returning()

  return NextResponse.json(data[0])
}
