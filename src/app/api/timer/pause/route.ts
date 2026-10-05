import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { sessionId } = body

  const timeSession = await prisma.timeSession.findFirst({
    where: { id: sessionId, userId: session.user.id, isActive: true },
  })

  if (!timeSession) {
    return NextResponse.json({ error: 'Active timer session not found' }, { status: 404 })
  }

  const now = new Date()
  const lastResume = timeSession.lastResumedAt || timeSession.startedAt
  const elapsedMs = now.getTime() - new Date(lastResume).getTime()
  const newDuration = timeSession.duration + elapsedMs

  const updated = await prisma.timeSession.update({
    where: { id: sessionId },
    data: {
      pausedAt: now,
      duration: newDuration,
    },
  })

  return NextResponse.json({ session: updated })
}
