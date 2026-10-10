import { useEffect, useState } from 'preact/hooks'
import { gameState } from '../../core/state/gameState.js'
import { BUILDING_DEFINITIONS, getBuildingDef, calculateCost, calculateBuildTime } from '../../core/systems/buildingDefinitions.js'
import { formatTime, formatTimeShort, secondsUntil } from '../utils/format.js'
import type { Building, SlotDef } from '../../core/state/types.js'

interface BuildingSlotProps {
  slot: SlotDef
  building: Building
  isLocked: boolean
  onQueue: (slotId: string, buildingType?: string) => void
  onCancel: (slotId: string) => void
}

export function BuildingSlot({ slot, building, isLocked, onQueue, onCancel }: BuildingSlotProps) {
  const [showPicker, setShowPicker] = useState(false)

  // Escape closes the picker wherever focus is inside the slot.
  useEffect(() => {
    if (!showPicker) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPicker(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPicker])

  const def = building.buildingType ? getBuildingDef(building.buildingType) : undefined

  // Under construction: placement (level 0) or upgrade.
  if (building.queuePosition !== null) {
    const totalSec = def ? calculateBuildTime(building.level, def) : 0
    const remainingSec = building.endTime ? secondsUntil(building.endTime) : 0
    const progress = building.endTime && totalSec > 0
      ? Math.max(0, Math.min(1, 1 - remainingSec / totalSec))
      : 0

    return (
      <div class="building-slot occupied" role="gridcell">
        <div class="building-info">
          <div class="building-header">
            <span class="building-name">{def?.name || slot.label}</span>
            <span class="building-level">{building.level > 0 ? `Lv.${building.level}` : 'Building…'}</span>
          </div>
          <div class="building-progress">
            <div class="progress-bar">
              <div class="progress-fill" style={{ width: `${progress * 100}%` }}></div>
            </div>
            <span class="progress-time">{formatTime(secondsUntil(building.endTime ?? Date.now()))}</span>
          </div>
          <button class="btn-cancel" onClick={() => onCancel(slot.id)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (isLocked) {
    const gateType = slot.requires ? BUILDING_DEFINITIONS[slot.requires.building]?.name : undefined
    return (
      <div class="building-slot locked" role="gridcell">
        <div class="locked-overlay">
          <span class="lock-icon">🔒</span>
          <span>
            Requires {gateType || slot.requires?.building} Lv.{slot.requires?.level}
          </span>
        </div>
      </div>
    )
  }

  // Built: show level and the upgrade action.
  if (building.level > 0 && def) {
    const maxed = building.level >= def.maxLevel
    const upgradeCost = calculateCost(building.level, def)
    const resources = gameState.value.resources
    const canAfford = resources.materials >= upgradeCost.materials &&
                      resources.energy >= upgradeCost.energy &&
                      resources.researchData >= upgradeCost.researchData

    return (
      <div class="building-slot occupied" role="gridcell">
        <div class="building-info">
          <div class="building-header">
            <span class="building-name">{def.name}</span>
            <span class="building-level">Lv.{building.level}</span>
          </div>
          {maxed ? (
            <span class="max-level-badge">Max level</span>
          ) : (
            <button
              class="btn-upgrade"
              onClick={() => onQueue(slot.id)}
              disabled={!canAfford}
              aria-label={`Upgrade ${def.name} to level ${building.level + 1}`}
            >
              Upgrade
              <span class="upgrade-cost">
                <span>⛏️ {upgradeCost.materials}</span>
                <span>⚡ {upgradeCost.energy}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Empty slot: pick a building for it.
  const availableBuildings = Object.values(BUILDING_DEFINITIONS)
    .filter(b => b.slotType === slot.type && b.id !== 'command_center')

  return (
    <div class="building-slot empty" role="gridcell">
      <button class="add-building-btn" onClick={() => setShowPicker(true)} disabled={showPicker}>
        <span class="plus-icon">+</span>
        <span>Add Building</span>
      </button>

      {showPicker && (
        <div
          class="building-picker-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="picker-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowPicker(false) }}
        >
          <div class="modal-content">
            <h3 id="picker-title">Select Building</h3>
            <div class="building-options">
              {availableBuildings.map(b => {
                const cost = calculateCost(building.level, b)
                const time = calculateBuildTime(building.level, b)
                const resources = gameState.value.resources
                const canAfford = resources.materials >= cost.materials &&
                                  resources.energy >= cost.energy &&
                                  resources.researchData >= cost.researchData

                return (
                  <button
                    key={b.id}
                    class={`building-option ${!canAfford ? 'unaffordable' : ''}`}
                    onClick={() => {
                      onQueue(slot.id, b.id)
                      setShowPicker(false)
                    }}
                    disabled={!canAfford}
                  >
                    <div class="option-info">
                      <span class="option-name">{b.name}</span>
                      <span class="option-desc">{b.category}</span>
                    </div>
                    <div class="option-cost">
                      <span>⛏️ {cost.materials}</span>
                      <span>⚡ {cost.energy}</span>
                      <span>📊 {cost.researchData}</span>
                      <span>⏱️ {formatTimeShort(time)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <button class="btn-close" onClick={() => setShowPicker(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
