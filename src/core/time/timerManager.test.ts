import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { timerManager } from './timerManager.js'

describe('timerManager', () => {
  let visibility: DocumentVisibilityState = 'visible'

  beforeEach(() => {
    timerManager.pause()
    timerManager.timers.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    visibility = 'visible'
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibility
    })
  })

  afterEach(() => {
    timerManager.pause()
    timerManager.timers.clear()
    vi.useRealTimers()
  })

  it('fires a timer only after its endTime, then removes it', () => {
    const fired: string[] = []
    const start = Date.now()
    timerManager.registerTimer('a', start + 5000, () => fired.push('a'))

    timerManager.tick(start + 4999)
    expect(fired).toEqual([])
    expect(timerManager.getRemaining('a')).toBe(5000)

    timerManager.tick(start + 5000)
    expect(fired).toEqual(['a'])
    expect(timerManager.timers.has('a')).toBe(false)
    expect(timerManager.getRemaining('a')).toBe(0)
  })

  it('keeps multiple timers independent', () => {
    const fired: string[] = []
    const start = Date.now()
    timerManager.registerTimer('first', start + 1000, () => fired.push('first'))
    timerManager.registerTimer('second', start + 2000, () => fired.push('second'))

    timerManager.tick(start + 1000)
    expect(fired).toEqual(['first'])
    expect(timerManager.timers.has('second')).toBe(true)

    timerManager.tick(start + 2000)
    expect(fired).toEqual(['first', 'second'])
  })

  it('unregisterTimer cancels a timer without firing it', () => {
    let fired = false
    const start = Date.now()
    timerManager.registerTimer('x', start + 1000, () => { fired = true })
    timerManager.unregisterTimer('x')
    timerManager.tick(start + 5000)
    expect(fired).toBe(false)
  })

  it('start() ticks every second while visible; pause() stops it', () => {
    const start = Date.now()
    let fired = 0
    timerManager.registerTimer('t', start + 1500, () => { fired += 1 })

    timerManager.start()
    expect(timerManager.intervalId).not.toBeNull()
    vi.advanceTimersByTime(3000)
    expect(fired).toBe(1)

    timerManager.pause()
    expect(timerManager.intervalId).toBeNull()
    vi.advanceTimersByTime(5000)
    expect(fired).toBe(1)
  })

  it('pauses when hidden and catches up on visible', () => {
    const start = Date.now()
    let fired = 0
    timerManager.registerTimer('v', start + 2000, () => { fired += 1 })
    timerManager.start()

    visibility = 'hidden'
    document.dispatchEvent(new Event('visibilitychange'))
    expect(timerManager.intervalId).toBeNull()

    // time passes while hidden: the interval is dead, nothing fires
    vi.setSystemTime(start + 4000)
    expect(fired).toBe(0)

    visibility = 'visible'
    document.dispatchEvent(new Event('visibilitychange'))
    // catch-up tick fires the overdue timer and the interval restarts
    expect(fired).toBe(1)
    expect(timerManager.intervalId).not.toBeNull()
  })
})
