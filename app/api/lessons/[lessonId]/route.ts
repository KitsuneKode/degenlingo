import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { lessons } from '@/db/schema'
import { checkRole } from '@/lib/roles'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: number }> },
) => {
  const { lessonId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  })

  return NextResponse.json(data)
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: number }> },
) => {
  const { lessonId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const data = await db
    .update(lessons)
    .set({
      ...body,
    })
    .where(eq(lessons.id, lessonId))
    .returning()

  return NextResponse.json(data[0])
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: number }> },
) => {
  const { lessonId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db
    .delete(lessons)
    .where(eq(lessons.id, lessonId))
    .returning()

  return NextResponse.json(data[0])
}
