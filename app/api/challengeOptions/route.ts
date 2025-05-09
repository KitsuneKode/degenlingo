import db from '@/db/drizzle'
import { checkRole } from '@/lib/roles'
import { challengeOptions } from '@/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = req.nextUrl.searchParams.get('range')
  const GROUP_PER_PAGE = range?.toString().split(',')[1].split(']')[0]

  const data = await db.query.challengeOptions.findMany({
    limit: Number(GROUP_PER_PAGE) + 1,
    // offset: Number(GROUP_PER_PAGE),
  })

  return NextResponse.json(data)
}

export const POST = async (req: NextRequest) => {
  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  if (!body.text || !body.correct || !body.challengeId) {
    return NextResponse.json(
      { error: 'Missing text, correct, or challengeId' },
      { status: 400 },
    )
  }

  const data = await db
    .insert(challengeOptions)
    .values({
      ...body,
    })
    .returning()

  return NextResponse.json(data[0])
}
