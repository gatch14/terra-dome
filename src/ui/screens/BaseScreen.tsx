import { gameState, resourceRates, buildingQueue } from '../../core/state/derived.js'
import { queueBuilding, cancelBuilding } from '../../core/systems/buildings.js'
import { getBuildingDef } from '../../core/systems/buildingDefinitions.js'
import { BuildingGrid } from '../components/BuildingGrid.js'
import { ResourceCounters } from '../components/ResourceCounters.js'
import { BuildQueue } from '../components/BuildQueue.js'
import { showToast } from '../components/Toast.js'

export function BaseScreen() {
  const state = gameState.value
  const rates = resourceRates.value
  const queue = buildingQueue.value

  const handleQueueBuilding = (slotId: string, buildingType?: string) => {
    const slot = state.buildings[slotId]
    const defId = buildingType ?? slot?.buildingType
    const name = defId ? getBuildingDef(defId)?.name : undefined
    if (queueBuilding(slotId, buildingType)) {
      showToast(`Building ${name || 'structure'} queued`, 'success')
    } else {
      showToast('Cannot queue building — check cost, slot or another active queue', 'warning')
    }
  }

  const handleCancelBuilding = (slotId: string) => {
    if (cancelBuilding(slotId)) {
      showToast('Building cancelled, resources refunded', 'info')
    }
  }

  return (
    <div class="screen base-screen" id="base-panel" role="tabpanel">
      <div class="screen-header">
        <h2>Base</h2>
        <ResourceCounters rates={rates} />
      </div>

      <div class="screen-content">
        <BuildingGrid
          buildings={state.buildings}
          onQueueBuilding={handleQueueBuilding}
          onCancelBuilding={handleCancelBuilding}
        />

        <BuildQueue
          queue={queue}
          buildings={state.buildings}
          onCancel={handleCancelBuilding}
        />
      </div>
    </div>
  )
}
