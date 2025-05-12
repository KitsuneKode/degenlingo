import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { courses } from '@/db/schema'
import { checkRole } from '@/lib/roles'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: number }> },
) => {
  const { courseId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  return NextResponse.json(data)
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: number }> },
) => {
  const { courseId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const data = await db
    .update(courses)
    .set({
      ...body,
    })
    .where(eq(courses.id, courseId))
    .returning()

  return NextResponse.json(data[0])
}
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: number }> },
) => {
  const { courseId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db
    .delete(courses)
    .where(eq(courses.id, courseId))
    .returning()

  return NextResponse.json(data[0])
}
