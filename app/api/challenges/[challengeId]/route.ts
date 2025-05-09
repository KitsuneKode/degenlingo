import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { checkRole } from '@/lib/roles'
import { challenges } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: { challengeId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, params.challengeId),
  })

  return NextResponse.json(data)
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: { challengeId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const data = await db
    .update(challenges)
    .set({
      ...body,
    })
    .where(eq(challenges.id, params.challengeId))
    .returning()

  return NextResponse.json(data[0])
}
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { challengeId: number } },
) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db
    .delete(challenges)
    .where(eq(challenges.id, params.challengeId))
    .returning()

  return NextResponse.json(data[0])
}
