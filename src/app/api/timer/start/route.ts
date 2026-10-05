import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { taskId, categoryId, label, isStopwatch } = body

  // Pause or end existing active sessions
  await prisma.timeSession.updateMany({
    where: { userId: session.user.id, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  })

  const newSession = await prisma.timeSession.create({
    data: {
      userId: session.user.id,
      taskId: taskId || null,
      categoryId: categoryId || null,
      label: label || null,
      isStopwatch: !!isStopwatch,
      startedAt: new Date(),
      lastResumedAt: new Date(),
      isActive: true,
      duration: 0,
    },
    include: {
      task: { select: { id: true, title: true, category: true } },
      category: true,
    },
  })

  if (taskId) {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    })
  }

  return NextResponse.json({ session: newSession })
}
