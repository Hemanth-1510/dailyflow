import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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
    include: {
      category: true,
      timeSessions: { orderBy: { startedAt: 'desc' } },
    },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const totalMs = task.timeSessions.reduce((acc, s) => acc + s.duration, 0)
  const actualDuration = Math.round(totalMs / (1000 * 60))

  return NextResponse.json({ task: { ...task, actualDuration } })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const updated = await prisma.task.update({
      where: { id, userId: session.user.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.date !== undefined && { date: body.date ? new Date(body.date) : null }),
        ...(body.startTime !== undefined && { startTime: body.startTime ? new Date(body.startTime) : null }),
        ...(body.endTime !== undefined && { endTime: body.endTime ? new Date(body.endTime) : null }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(body.estimatedDuration !== undefined && { estimatedDuration: body.estimatedDuration }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
      include: { category: true },
    })

    return NextResponse.json({ task: updated })
  } catch (error) {
    console.error('[Task Update Error]', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.task.delete({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Task Delete Error]', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
