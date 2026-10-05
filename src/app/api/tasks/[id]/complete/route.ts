import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
  const completedAt = newStatus === 'COMPLETED' ? new Date() : null

  const updated = await prisma.task.update({
    where: { id },
    data: { status: newStatus, completedAt },
    include: { category: true },
  })

  return NextResponse.json({ task: updated })
}
