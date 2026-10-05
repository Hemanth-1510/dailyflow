import { Priority, TaskStatus, RecurringType } from '@prisma/client'

export type { Priority, TaskStatus, RecurringType }

export interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  timezone: string
  theme: string
  timeFormat: '12h' | '24h'
  firstDayOfWeek: number
  defaultTaskDuration: number
  onboardingDone: boolean
  createdAt: string
}

export interface CategoryData {
  id: string
  name: string
  color: string
  icon: string
  description?: string | null
  taskCount?: number
  totalTimeMinutes?: number
}

export interface TaskData {
  id: string
  userId: string
  categoryId?: string | null
  category?: CategoryData | null
  title: string
  description?: string | null
  date?: string | null
  startTime?: string | null
  endTime?: string | null
  dueDate?: string | null
  estimatedDuration?: number | null
  actualDuration?: number // in minutes derived from time sessions
  priority: Priority
  status: TaskStatus
  completedAt?: string | null
  notes?: string | null
  recurringType?: RecurringType | null
  recurringRule?: string | null
  reminderMinutes?: number | null
  createdAt: string
  updatedAt: string
}

export interface TimeSessionData {
  id: string
  taskId?: string | null
  task?: { id: string; title: string; category?: CategoryData | null } | null
  userId: string
  categoryId?: string | null
  category?: CategoryData | null
  label?: string | null
  startedAt: string
  pausedAt?: string | null
  lastResumedAt?: string | null
  endedAt?: string | null
  duration: number // milliseconds
  isActive: boolean
  isStopwatch: boolean
}

export interface DailySummary {
  date: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalTimeMinutes: number
  estimatedTimeMinutes: number
  productivityScore: number
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  color: string
  icon: string
  taskCount: number
  completedCount: number
  totalTimeMinutes: number
}

export interface AnalyticsOverview {
  productivityScore: number
  completedTasksCount: number
  totalTasksCount: number
  totalTimeSpentMinutes: number
  estimatedVsActualRatio: number
  streakDays: number
  weeklyTrend: { date: string; completed: number; created: number; hours: number }[]
  categoryDistribution: CategoryPerformance[]
  hourlyDistribution: { hour: number; minutes: number }[]
}
