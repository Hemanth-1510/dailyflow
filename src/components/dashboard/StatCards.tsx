'use client'

import { CheckCircle2, Clock, Calendar, Zap } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface StatCardsProps {
  completedToday: number
  totalToday: number
  timeSpentMinutes: number
  estimatedMinutes: number
}

export default function StatCards({
  completedToday,
  totalToday,
  timeSpentMinutes,
  estimatedMinutes,
}: StatCardsProps) {
  const stats = [
    {
      title: "Today's Tasks",
      value: `${completedToday} / ${totalToday}`,
      subtitle: `${totalToday - completedToday} remaining`,
      icon: CheckCircle2,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Time Spent',
      value: formatDuration(timeSpentMinutes),
      subtitle: `Target: ${formatDuration(estimatedMinutes)}`,
      icon: Clock,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      title: 'Efficiency Ratio',
      value: estimatedMinutes > 0 ? `${Math.round((timeSpentMinutes / estimatedMinutes) * 100)}%` : '100%',
      subtitle: 'Spent vs Estimated',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Planned Schedule',
      value: `${formatDuration(estimatedMinutes)}`,
      subtitle: 'Total planned duration',
      icon: Calendar,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl bg-slate-900/80 backdrop-blur-md p-5 border border-slate-800 shadow-md hover:border-slate-700 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {s.title}
            </span>
            <div className={`p-2 rounded-xl ${s.bgColor} border ${s.borderColor} ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
          <p className="text-xs text-slate-400 mt-1">{s.subtitle}</p>
        </div>
      ))}
    </div>
  )
}
