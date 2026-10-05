import { describe, it, expect } from 'vitest'
import { formatMs, formatDuration, calculateProductivityScore } from '../lib/utils'

describe('Timer Utility Functions', () => {
  it('formats milliseconds to hh:mm:ss correctly', () => {
    expect(formatMs(3661000)).toBe('01:01:01')
    expect(formatMs(60000)).toBe('00:01:00')
    expect(formatMs(0)).toBe('00:00:00')
  })

  it('formats duration minutes correctly', () => {
    expect(formatDuration(30)).toBe('30m')
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(120)).toBe('2h')
  })

  it('calculates productivity score accurately', () => {
    const score = calculateProductivityScore(5, 5, 3600000, 60)
    expect(score).toBeGreaterThanOrEqual(80)
  })
})
