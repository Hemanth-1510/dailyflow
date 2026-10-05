import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedDuration: z.number().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  notes: z.string().optional(),
  reminderMinutes: z.number().optional(),
  recurringType: z.enum(['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY', 'CUSTOM']).nullable().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')
  const dateStr = searchParams.get('date')

  const where: any = { userId: session.user.id }

  if (categoryId) where.categoryId = categoryId
  if (status) where.status = status
  if (priority) where.priority = priority
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (dateStr) {
    const start = new Date(dateStr)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateStr)
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      category: true,
      timeSessions: { select: { duration: true } },
    },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  })

  const formattedTasks = tasks.map((t) => {
    const actualDuration = Math.round(
      t.timeSessions.reduce((acc, s) => acc + s.duration, 0) / (1000 * 60)
    )
    const { timeSessions, ...rest } = t
    return { ...rest, actualDuration }
  })

  return NextResponse.json({ tasks: formattedTasks })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = taskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const {
      title,
      description,
      categoryId,
      date,
      startTime,
      endTime,
      dueDate,
      estimatedDuration,
      priority,
      notes,
      reminderMinutes,
      recurringType,
    } = parsed.data

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        description,
        categoryId: categoryId || null,
        date: date ? new Date(date) : new Date(),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration: estimatedDuration || 30,
        priority,
        notes,
        reminderMinutes: reminderMinutes || null,
        recurringType: recurringType || null,
      },
      include: { category: true },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('[Task Create Error]', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
