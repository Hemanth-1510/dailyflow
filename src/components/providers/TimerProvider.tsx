'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { TimerSession } from '@/lib/timer'
import { calculateElapsed } from '@/lib/timer'

interface TimerContextValue {
  activeSession: TimerSession | null
  elapsed: number
  isLoading: boolean
  startTimer: (taskId: string) => Promise<void>
  pauseTimer: () => Promise<void>
  resumeTimer: () => Promise<void>
  stopTimer: () => Promise<void>
  refreshSession: () => Promise<void>
}

const TimerContext = createContext<TimerContextValue | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/timer/active')
      if (!res.ok) {
        setActiveSession(null)
        return
      }

      const data = await res.json()
      if (!data.activeSession) {
        setActiveSession(null)
        return
      }

      const session: TimerSession = {
        ...data.activeSession,
        startedAt: new Date(data.activeSession.startedAt),
        pausedAt: data.activeSession.pausedAt ? new Date(data.activeSession.pausedAt) : null,
        lastResumedAt: data.activeSession.lastResumedAt ? new Date(data.activeSession.lastResumedAt) : null,
        endedAt: data.activeSession.endedAt ? new Date(data.activeSession.endedAt) : null,
      }
      setActiveSession(session)
    } catch {
      setActiveSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  useEffect(() => {
    const handler = () => refreshSession()
    window.addEventListener('timer-updated', handler)
    return () => window.removeEventListener('timer-updated', handler)
  }, [refreshSession])

  useEffect(() => {
    if (!activeSession || !activeSession.isActive) {
      setElapsed(0)
      return
    }

    const tick = () => setElapsed(calculateElapsed(activeSession))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  const startTimer = useCallback(async (taskId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to start timer')
      }
      await refreshSession()
      window.dispatchEvent(new Event('timer-updated'))
    } finally {
      setIsLoading(false)
    }
  }, [refreshSession])

  const pauseTimer = useCallback(async () => {
    if (!activeSession) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/timer/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      })
      if (res.ok) {
        await refreshSession()
        window.dispatchEvent(new Event('timer-updated'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeSession, refreshSession])

  const resumeTimer = useCallback(async () => {
    if (!activeSession) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/timer/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      })
      if (res.ok) {
        await refreshSession()
        window.dispatchEvent(new Event('timer-updated'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeSession, refreshSession])

  const stopTimer = useCallback(async () => {
    if (!activeSession) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/timer/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      })
      if (res.ok) {
        await refreshSession()
        window.dispatchEvent(new Event('timer-updated'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeSession, refreshSession])

  return (
    <TimerContext.Provider
      value={{
        activeSession,
        elapsed,
        isLoading,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        refreshSession,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
