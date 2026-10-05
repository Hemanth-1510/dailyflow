'use client'

import { useTimer } from '@/components/providers/TimerProvider'
import { formatElapsed } from '@/lib/timer'
import { Play, Pause, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function GlobalTimerWidget() {
  const { activeSession, elapsed, pauseTimer, resumeTimer } = useTimer()
  const router = useRouter()

  if (!activeSession || !activeSession.isActive) return null

  const isPaused = !!activeSession.pausedAt

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-sm cursor-pointer',
          'bg-card/90 hover:bg-card transition-all',
          isPaused ? 'border-amber-500/30' : 'border-indigo-500/30'
        )}
        onClick={() => router.push('/timer')}
        role="button"
        aria-label="Open timer"
      >
        {/* Animated dot */}
        <div className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          isPaused ? 'bg-amber-500' : 'bg-indigo-500 animate-pulse'
        )} />

        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {(activeSession as any).task?.title || 'Timer running'}
          </span>
          <span className="text-sm font-mono font-semibold tabular-nums">
            {formatElapsed(elapsed)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            onClick={(e) => { e.stopPropagation(); isPaused ? resumeTimer() : pauseTimer() }}
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-indigo-500" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
          </button>
        </div>
      </div>
    </div>
  )
}
