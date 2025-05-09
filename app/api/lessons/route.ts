import db from '@/db/drizzle'
import { lessons } from '@/db/schema'
import { checkRole } from '@/lib/roles'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async () => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.lessons.findMany()

  return NextResponse.json(data)
}

export const POST = async (req: NextRequest) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.title || !body.unitId || !body.order) {
    return NextResponse.json(
      { error: 'Missing title, unitId, or order' },
      { status: 400 },
    )
  }

  const data = await db
    .insert(lessons)
    .values({
      ...body,
    })
    .returning()

  return NextResponse.json(data[0])
}
