import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatTime(date: Date, format: '12h' | '24h' = '12h'): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
    case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  }
}

export function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'COMPLETED': return { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
    case 'IN_PROGRESS': return { label: 'In Progress', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' }
    case 'OVERDUE': return { label: 'Overdue', className: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
    case 'CANCELLED': return { label: 'Cancelled', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
    default: return { label: 'Pending', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
  }
}

export function calculateProductivityScore(completed: number, total: number, timeSpentMs: number, estimatedMinutes: number): number {
  if (total === 0) return 100
  const completionRatio = Math.min(completed / total, 1) * 60
  const totalMinutesSpent = timeSpentMs / (1000 * 60)
  let timeEfficiencyRatio = 40
  if (estimatedMinutes > 0 && totalMinutesSpent > 0) {
    const diff = Math.abs(totalMinutesSpent - estimatedMinutes) / estimatedMinutes
    timeEfficiencyRatio = Math.max(0, 40 * (1 - diff))
  }
  return Math.round(completionRatio + timeEfficiencyRatio)
}
