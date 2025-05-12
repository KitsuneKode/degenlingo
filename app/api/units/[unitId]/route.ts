import db from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { units } from '@/db/schema'
import { checkRole } from '@/lib/roles'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ unitId: number }> },
) => {
  const { unitId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.query.units.findFirst({
    where: eq(units.id, unitId),
  })

  return NextResponse.json(data)
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ unitId: number }> },
) => {
  const { unitId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const data = await db
    .update(units)
    .set({
      ...body,
    })
    .where(eq(units.id, unitId))
    .returning()

  return NextResponse.json(data[0])
}
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ unitId: number }> },
) => {
  const { unitId } = await params

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await db.delete(units).where(eq(units.id, unitId)).returning()

  return NextResponse.json(data[0])
}
