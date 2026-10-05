/**
 * Analytics calculation functions.
 * All calculations derived from real database data.
 */

export interface ProductivityScoreInput {
  totalTasks: number
  completedTasks: number
  onTimeTasks: number // completed before or on due date
  overdueTasks: number
  totalEstimatedMs: number
  totalTrackedMs: number
}

/**
 * Calculates productivity score 0-100.
 * Formula:
 * - 40% Completion rate (completed/total)
 * - 25% On-time rate (onTime/completed)
 * - 20% Focus efficiency (min(tracked/estimated, 1.2) normalized)
 * - 15% Overdue penalty (1 - overdue/total)
 */
export function calculateProductivityScore(input: ProductivityScoreInput): {
  score: number
  breakdown: {
    completionRate: number
    onTimeRate: number
    focusEfficiency: number
    noOverdueRate: number
  }
} {
  const {
    totalTasks,
    completedTasks,
    onTimeTasks,
    overdueTasks,
    totalEstimatedMs,
    totalTrackedMs,
  } = input

  if (totalTasks === 0) {
    return {
      score: 0,
      breakdown: { completionRate: 0, onTimeRate: 0, focusEfficiency: 0, noOverdueRate: 0 },
    }
  }

  const completionRate = Math.min(completedTasks / totalTasks, 1)
  const onTimeRate = completedTasks > 0 ? Math.min(onTimeTasks / completedTasks, 1) : 0
  const focusEfficiency =
    totalEstimatedMs > 0
      ? Math.min(totalTrackedMs / totalEstimatedMs, 1.2) / 1.2
      : totalTrackedMs > 0
      ? 0.5
      : 0
  const noOverdueRate = Math.max(0, 1 - overdueTasks / totalTasks)

  const score = Math.round(
    completionRate * 40 +
    onTimeRate * 25 +
    focusEfficiency * 20 +
    noOverdueRate * 15
  )

  return {
    score: Math.min(score, 100),
    breakdown: {
      completionRate: Math.round(completionRate * 100),
      onTimeRate: Math.round(onTimeRate * 100),
      focusEfficiency: Math.round(focusEfficiency * 100),
      noOverdueRate: Math.round(noOverdueRate * 100),
    },
  }
}

/**
 * Formats milliseconds into a human-readable duration string.
 */
export function formatFocusTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Groups time sessions by hour of day for heatmap.
 */
export function groupByHour(sessions: Array<{ startedAt: Date; duration: number }>): number[] {
  const hourTotals = Array(24).fill(0)
  for (const s of sessions) {
    const hour = s.startedAt.getHours()
    hourTotals[hour] += s.duration
  }
  return hourTotals
}

/**
 * Groups sessions by day of week (0=Sun, 6=Sat).
 */
export function groupByDayOfWeek(sessions: Array<{ startedAt: Date; duration: number }>): number[] {
  const dayTotals = Array(7).fill(0)
  for (const s of sessions) {
    const day = s.startedAt.getDay()
    dayTotals[day] += s.duration
  }
  return dayTotals
}
