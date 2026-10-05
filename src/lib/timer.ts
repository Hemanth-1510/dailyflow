/**
 * Timer Architecture:
 * Uses server-stored timestamps + accumulated duration.
 * Elapsed = (now - lastResumedAt) + accumulatedMs
 * On pause: accumulatedMs += (now - lastResumedAt)
 * This approach is resilient to page refreshes, tab switches, and browser sleep.
 */

export interface TimerSession {
  id: string
  startedAt: Date
  pausedAt: Date | null
  lastResumedAt: Date | null
  endedAt: Date | null
  duration: number // accumulated milliseconds from completed segments
  isActive: boolean
}

/**
 * Calculate current elapsed milliseconds for an active timer session.
 */
export function calculateElapsed(session: TimerSession): number {
  if (!session.isActive) return session.duration

  if (session.pausedAt) {
    // Timer is paused — return accumulated duration only
    return session.duration
  }

  // Timer is running — add current segment
  const resumePoint = session.lastResumedAt || session.startedAt
  const currentSegment = Date.now() - resumePoint.getTime()
  return session.duration + currentSegment
}

/**
 * Format milliseconds as HH:MM:SS
 */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Calculate duration in milliseconds for a completed pause segment.
 */
export function calculatePausedSegment(session: TimerSession, pausedAt: Date): number {
  const resumePoint = session.lastResumedAt || session.startedAt
  return session.duration + (pausedAt.getTime() - resumePoint.getTime())
}

/**
 * Convert milliseconds to minutes (for storage/display).
 */
export function msToMinutes(ms: number): number {
  return Math.round(ms / 60000)
}

/**
 * Convert minutes to milliseconds.
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60000
}
