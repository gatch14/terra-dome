import { BUILDING_DEFINITIONS, calculateBuildTime, getBuildingDef } from '../../core/systems/buildingDefinitions.js'
import { formatTime, secondsUntil } from '../utils/format.js'
import type { Building } from '../../core/state/types.js'

interface QueueEntry {
  id: string
  endTime: number
  position: number
}

interface BuildQueueProps {
  queue: QueueEntry[]
  buildings: Record<string, Building>
  onCancel: (slotId: string) => void
}

export function BuildQueue({ queue, buildings, onCancel }: BuildQueueProps) {
  if (queue.length === 0) {
    return (
      <div class="build-queue empty">
        <p>No buildings in queue</p>
      </div>
    )
  }

  return (
    <div class="build-queue" role="list" aria-label="Build queue">
      <h3>Build Queue</h3>
      <ul class="queue-list">
        {queue.map((item, index) => {
          const building = buildings[item.id]
          const def = building?.buildingType ? getBuildingDef(building.buildingType) : undefined
          const remaining = secondsUntil(item.endTime)
          const total = building && def ? calculateBuildTime(building.level, def) : 0
          const progress = total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 0

          return (
            <li key={item.id} class="queue-item">
              <div class="queue-item-info">
                <span class="queue-position">#{index + 1}</span>
                <span class="queue-name">{def?.name || BUILDING_DEFINITIONS[building?.buildingType ?? '']?.name || item.id}</span>
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
