'use client'

import { Trophy, TrendingUp, Target, Zap } from 'lucide-react'

interface ProductivityScoreProps {
  score: number
  completedTasks: number
  totalTasks: number
  streakDays: number
}

export default function ProductivityScore({
  score,
  completedTasks,
  totalTasks,
  streakDays,
}: ProductivityScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-emerald-400 to-teal-500'
    if (s >= 60) return 'from-indigo-400 to-violet-500'
    if (s >= 40) return 'from-amber-400 to-orange-500'
    return 'from-rose-400 to-red-500'
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/40 p-6 border border-slate-800 shadow-xl">
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-300">Productivity Index</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>{streakDays} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                fill="transparent"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{score}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">PTS</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {score >= 80 ? 'Exceptional!' : score >= 60 ? 'Great Momentum' : 'On Track'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on completion rate & time efficiency
            </p>
          </div>
        </div>

        <div className="flex items-center justify-around md:justify-center gap-8 py-2 md:py-0 border-y md:border-y-0 md:border-x border-slate-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Completed</span>
            </div>
            <p className="text-xl font-bold text-white">
              {completedTasks} <span className="text-slate-500 text-sm font-normal">/ {totalTasks}</span>
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completion</span>
            </div>
            <p className="text-xl font-bold text-white">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80">
          <p className="text-xs font-medium text-slate-300 mb-1">Focus Tip for Today</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {score >= 70
              ? "You're crushing your estimated task durations. Keep up the high deep-work energy!"
              : 'Try starting a 25-minute focus timer on your highest priority task to build momentum.'}
          </p>
        </div>
      </div>
    </div>
  )
}
