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
    where: { id: sessionId, userId: session.user.id },
  })

  if (!timeSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const now = new Date()
  let finalDuration = timeSession.duration

  if (!timeSession.pausedAt && timeSession.isActive) {
    const lastResume = timeSession.lastResumedAt || timeSession.startedAt
    finalDuration += now.getTime() - new Date(lastResume).getTime()
  }

  const updated = await prisma.timeSession.update({
    where: { id: sessionId },
    data: {
      endedAt: now,
      duration: finalDuration,
      isActive: false,
    },
  })

  return NextResponse.json({ session: updated })
}
