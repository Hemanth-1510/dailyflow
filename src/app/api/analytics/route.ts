import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const now = new Date()
  const sevenDaysAgo = subDays(now, 6)

  // Fetch tasks
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { category: true, timeSessions: true },
  })

  // Fetch time sessions
  const sessions = await prisma.timeSession.findMany({
    where: { userId },
    include: { category: true },
  })

  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasksCount = tasks.length
  const totalTimeSpentMs = sessions.reduce((acc, s) => acc + s.duration, 0)
  const totalTimeSpentMinutes = Math.round(totalTimeSpentMs / (1000 * 60))

  const totalEstMinutes = tasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0)
  const estimatedVsActualRatio = totalEstMinutes > 0
    ? Number((totalTimeSpentMinutes / totalEstMinutes).toFixed(2))
    : 1

  // Productivity Score Calculation
  const completionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 100
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + Math.min(totalTimeSpentMinutes / 60, 8) * 5))

  // Weekly Trend
  const weeklyTrend = []
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i)
    const dayStart = startOfDay(d)
    const dayEnd = endOfDay(d)
    const dayTasks = tasks.filter(t => t.createdAt >= dayStart && t.createdAt <= dayEnd)
    const dayCompleted = tasks.filter(t => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd).length
    const dayMs = sessions
      .filter(s => s.startedAt >= dayStart && s.startedAt <= dayEnd)
      .reduce((acc, s) => acc + s.duration, 0)

    weeklyTrend.push({
      date: format(d, 'MMM dd'),
      created: dayTasks.length,
      completed: dayCompleted,
      hours: Number((dayMs / (1000 * 3600)).toFixed(1)),
    })
  }

  // Category Distribution
  const categoryMap = new Map<string, { categoryId: string; categoryName: string; color: string; icon: string; taskCount: number; completedCount: number; totalTimeMinutes: number }>()

  for (const t of tasks) {
    const catName = t.category?.name || 'Uncategorized'
    const catColor = t.category?.color || '#94a3b8'
    const catIcon = t.category?.icon || 'folder'
    const catId = t.categoryId || 'uncategorized'

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        categoryId: catId,
        categoryName: catName,
        color: catColor,
        icon: catIcon,
        taskCount: 0,
        completedCount: 0,
        totalTimeMinutes: 0,
      })
    }

    const item = categoryMap.get(catId)!
    item.taskCount += 1
    if (t.status === 'COMPLETED') item.completedCount += 1
    const taskTime = t.timeSessions.reduce((acc, s) => acc + s.duration, 0)
    item.totalTimeMinutes += Math.round(taskTime / (1000 * 60))
  }

  // Hourly Distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0 }))
  for (const s of sessions) {
    const hour = new Date(s.startedAt).getHours()
    hourlyDistribution[hour].minutes += Math.round(s.duration / (1000 * 60))
  }

  return NextResponse.json({
    analytics: {
      productivityScore,
      completedTasksCount,
      totalTasksCount,
      totalTimeSpentMinutes,
      estimatedVsActualRatio,
      streakDays: 5,
      weeklyTrend,
      categoryDistribution: Array.from(categoryMap.values()),
      hourlyDistribution,
    },
  })
}
