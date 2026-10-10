import { RESEARCH_DEFINITIONS } from '../../core/systems/researchDefinitions.js'
import { formatTime, secondsUntil } from '../utils/format.js'

interface QueueEntry {
  id: string
  endTime: number
  position: number
}

interface ResearchQueueProps {
  queue: QueueEntry[]
  onCancel: (nodeId: string) => void
}

export function ResearchQueue({ queue, onCancel }: ResearchQueueProps) {
  if (queue.length === 0) {
    return (
      <div class="research-queue empty">
        <p>No research in progress</p>
      </div>
    )
  }

  return (
    <div class="research-queue" role="list" aria-label="Research queue">
      <h3>Research Queue</h3>
      <ul class="queue-list">
        {queue.map((item, index) => {
          const def = RESEARCH_DEFINITIONS[item.id]
          const remaining = secondsUntil(item.endTime)
          const total = def?.time ?? 0
          const progress = total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 0

          return (
            <li key={item.id} class="queue-item">
              <div class="queue-item-info">
                <span class="queue-position">#{index + 1}</span>
                <span class="queue-name">{def?.name || item.id}</span>
                <span class="queue-time">{formatTime(remaining)}</span>
              </div>
              <div class="queue-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style={{ width: `${progress * 100}%` }}></div>
                </div>
                <button class="btn-cancel-small" onClick={() => onCancel(item.id)} aria-label="Cancel">✕</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
