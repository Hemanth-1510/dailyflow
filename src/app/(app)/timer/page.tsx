'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Timer, RotateCcw } from 'lucide-react'
import { formatMs } from '@/lib/utils'
import { toast } from 'sonner'

export default function TimerPage() {
  const [activeSession, setActiveSession] = useState<any>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const fetchActiveTimer = async () => {
    try {
      const res = await fetch('/api/timer/active')
      const data = await res.json()
      setActiveSession(data.activeSession)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchActiveTimer()
  }, [])

  useEffect(() => {
    if (!activeSession) {
      setElapsedMs(0)
      return
    }

    const interval = setInterval(() => {
      let base = activeSession.duration || 0
      if (!activeSession.pausedAt && activeSession.isActive) {
        const lastResume = activeSession.lastResumedAt || activeSession.startedAt
        base += new Date().getTime() - new Date(lastResume).getTime()
      }
      setElapsedMs(base)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  const handlePause = async () => {
    if (!activeSession) return
    const res = await fetch('/api/timer/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSession.id }),
    })
    if (res.ok) {
      toast.info('Timer paused')
      fetchActiveTimer()
    }
  }

  const handleResume = async () => {
    if (!activeSession) return
    const res = await fetch('/api/timer/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSession.id }),
    })
    if (res.ok) {
      toast.success('Timer resumed')
      fetchActiveTimer()
    }
  }

  const handleStop = async () => {
    if (!activeSession) return
    const res = await fetch('/api/timer/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSession.id }),
    })
    if (res.ok) {
      toast.success('Timer saved')
      setActiveSession(null)
      window.dispatchEvent(new Event('timer-updated'))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 text-center">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <Timer className="w-8 h-8 text-indigo-400" /> Focus Timer & Stopwatch
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Track actual time spent on your tasks with millimeter precision.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        <div className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-2">
          {activeSession?.task?.title || activeSession?.label || 'Free Stopwatch Session'}
        </div>

        <div className="text-6xl sm:text-7xl font-mono font-black text-white tracking-widest my-8">
          {formatMs(elapsedMs)}
        </div>

        <div className="flex items-center justify-center gap-4">
          {!activeSession || activeSession.pausedAt ? (
            <button
              onClick={activeSession ? handleResume : () => {}}
              className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
            >
              <Play className="w-8 h-8 fill-current" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
            >
              <Pause className="w-8 h-8 fill-current" />
            </button>
          )}

          {activeSession && (
            <button
              onClick={handleStop}
              className="p-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition-all transform hover:scale-105"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
