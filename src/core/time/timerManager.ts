import type { Timer } from './types.js'

export type { Timer } from './types.js'

export const timerManager = {
  timers: new Map<string, Timer>(),
  intervalId: null as ReturnType<typeof setInterval> | null,
  isVisible: true,

  start() {
    if (this.intervalId) return
    this.isVisible = document.visibilityState === 'visible'
    if (!this.isVisible) return
    
    this.intervalId = setInterval(() => {
      this.tick(Date.now())
    }, 1000)
  },

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  },

  tick(now: number) {
    for (const [id, timer] of this.timers) {
      if (now >= timer.endTime) {
        this.timers.delete(id)
        timer.onComplete()
      }
    }
  },

  registerTimer(id: string, endTime: number, onComplete: () => void) {
    this.timers.set(id, { id, endTime, onComplete })
  },

  unregisterTimer(id: string) {
    this.timers.delete(id)
  },

  getRemaining(id: string): number {
    const timer = this.timers.get(id)
    if (!timer) return 0
    return Math.max(0, timer.endTime - Date.now())
  },

  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isVisible
      this.isVisible = document.visibilityState === 'visible'
      
      if (!wasVisible && this.isVisible) {
        this.tick(Date.now())
        this.start()
      } else if (wasVisible && !this.isVisible) {
        this.pause()
      }
    })
  }
}

timerManager.setupVisibilityHandler()