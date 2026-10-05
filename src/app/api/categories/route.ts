import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().default('#6366f1'),
  icon: z.string().default('folder'),
  description: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { tasks: true } },
      timeSessions: { select: { duration: true } },
    },
    orderBy: { name: 'asc' },
  })

  const result = categories.map((cat) => {
    const totalTimeMinutes = Math.round(
      cat.timeSessions.reduce((sum, s) => sum + s.duration, 0) / (1000 * 60)
    )
    const { _count, timeSessions, ...rest } = cat
    return {
      ...rest,
      taskCount: _count.tasks,
      totalTimeMinutes,
    }
  })

  return NextResponse.json({ categories: result })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { name, color, icon, description } = parsed.data

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        color,
        icon,
        description,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
