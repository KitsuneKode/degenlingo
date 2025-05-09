import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { checkRole } from '@/lib/roles'
import { challengeOptions } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, params.challengeOptionId),
  })

  return NextResponse.json(data)
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const data = await db
    .update(challengeOptions)
    .set({
      ...body,
    })
    .where(eq(challengeOptions.id, params.challengeOptionId))
    .returning()

  return NextResponse.json(data[0])
}
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, params.challengeOptionId))
    .returning()

  return NextResponse.json(data[0])
}
