import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'

interface EventTimerProps {
  endTime: number
}

export function EventTimer({ endTime }: EventTimerProps) {
  const remaining = useSignal(Math.max(0, endTime - Date.now()))

  useEffect(() => {
    const interval = setInterval(() => {
      remaining.value = Math.max(0, endTime - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  const totalSec = Math.floor(remaining.value / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return (
    <div class="event-timer" role="timer" aria-live="polite">
      <div class="timer-label">Event ends in</div>
      <div class="timer-display">
        <span class="timer-segment">
          <span class="timer-value">{days}</span>
          <span class="timer-unit">days</span>
        </span>
        <span class="timer-separator">:</span>
        <span class="timer-segment">
          <span class="timer-value">{hours.toString().padStart(2, '0')}</span>
          <span class="timer-unit">hours</span>
        </span>
        <span class="timer-separator">:</span>
        <span class="timer-segment">
          <span class="timer-value">{minutes.toString().padStart(2, '0')}</span>
          <span class="timer-unit">min</span>
        </span>
        <span class="timer-separator">:</span>
        <span class="timer-segment">
          <span class="timer-value">{seconds.toString().padStart(2, '0')}</span>
          <span class="timer-unit">sec</span>
        </span>
      </div>
    </div>
  )
}
