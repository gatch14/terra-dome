import { gameState } from '../../core/state/gameState.js'
import { SLOT_LAYOUT } from '../../core/systems/buildingDefinitions.js'
import { BuildingSlot } from './BuildingSlot.js'
import type { Building } from '../../core/state/types.js'

interface BuildingGridProps {
  buildings: Record<string, Building>
  onQueueBuilding: (slotId: string, buildingType?: string) => void
  onCancelBuilding: (slotId: string) => void
}

export function BuildingGrid({ buildings, onQueueBuilding, onCancelBuilding }: BuildingGridProps) {
  const state = gameState.value

  return (
    <div class="building-grid" role="grid" aria-label="Building slots">
      {SLOT_LAYOUT.map(slot => {
        const building = buildings[slot.id] ?? {
          id: slot.id,
          buildingType: slot.buildingType ?? null,
          level: 0,
          maxLevel: 10,
          queuePosition: null,
          endTime: null
        }
        const isLocked = slot.requires
          ? (state.buildings[slot.requires.building]?.level ?? 0) < slot.requires.level
          : false

        return (
          <BuildingSlot
            key={slot.id}
            slot={slot}
            building={building}
            isLocked={isLocked}
            onQueue={onQueueBuilding}
            onCancel={onCancelBuilding}
          />
        )
      })}
    </div>
  )
}
