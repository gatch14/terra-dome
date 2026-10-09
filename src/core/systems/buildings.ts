import { getBuildingDef, calculateCost, calculateBuildTime } from './buildingDefinitions.js'
import { timerManager } from '../time/timerManager.js'
import { gameState, touch, definitions } from '../state/gameState.js'
import { canAfford, spend } from './resources.js'
import { storageLimits } from '../state/derived.js'
import { addPlayerPoints } from './clanEvent.js'
import { CLAN_EVENT_CONFIG } from './clanEventDefinitions.js'

/**
 * Queue a building for a grid slot. Placing into an empty resource slot
 * requires the target `buildingType`; fixed slots (command center, research
 * lab) derive it from the slot definition. Only one construction runs at a time.
 */
export function queueBuilding(slotId: string, buildingType?: string): boolean {
  const state = gameState.value
  const slot = state.buildings[slotId]
  if (!slot || slot.queuePosition !== null) return false

  const slotDef = definitions.slots.find(s => s.id === slotId)
  const defId = slotDef?.buildingType ?? buildingType ?? slot.buildingType
  if (!defId) return false
  if (slot.buildingType && buildingType && slot.buildingType !== buildingType) return false

  const def = getBuildingDef(defId)
  if (!def) return false
  if (slotDef && def.slotType !== slotDef.type) return false
  if (slot.level >= def.maxLevel) return false

  if (slotDef?.requires) {
    const gate = state.buildings[slotDef.requires.building]
    if (!gate || gate.level < slotDef.requires.level) return false
  }

  const busy = Object.values(state.buildings).some(b => b.queuePosition !== null)
  if (busy) return false

  const cost = calculateCost(slot.level, def)
  if (!canAfford(cost) || !spend(cost)) return false

  const buildTime = calculateBuildTime(slot.level, def)
  const endTime = Date.now() + buildTime * 1000

  slot.buildingType = defId
  slot.maxLevel = def.maxLevel
  slot.queuePosition = state.buildingQueue.length
  slot.endTime = endTime
  state.buildingQueue.push(slotId)

  timerManager.registerTimer(`build-${slotId}`, endTime, () => completeBuilding(slotId))
  addPlayerPoints('build', CLAN_EVENT_CONFIG.pointValues.build)
  touch()
  return true
}

/** Cancel the queued construction/upgrade and refund 100% of its cost. */
export function cancelBuilding(slotId: string): boolean {
  const state = gameState.value
  const slot = state.buildings[slotId]
  if (!slot || slot.queuePosition === null) return false

  const def = slot.buildingType ? getBuildingDef(slot.buildingType) : undefined
  if (!def) return false

  const cost = calculateCost(slot.level, def)
  const limits = storageLimits.value
  state.resources.materials = Math.min(limits.materials, state.resources.materials + cost.materials)
  state.resources.energy = Math.min(limits.energy, state.resources.energy + cost.energy)
  state.resources.researchData = Math.min(limits.researchData, state.resources.researchData + cost.researchData)

  timerManager.unregisterTimer(`build-${slotId}`)
  const slotDef = definitions.slots.find(s => s.id === slotId)
  if (slot.level === 0) {
    // Placement cancelled: the slot goes back to empty (fixed slots keep theirs).
    slot.buildingType = slotDef?.buildingType ?? null
  }
  slot.queuePosition = null
  slot.endTime = null
  state.buildingQueue = state.buildingQueue.filter(id => id !== slotId)
  addPlayerPoints('build_cancel', -CLAN_EVENT_CONFIG.pointValues.build)
  touch()
  return true
}

export function completeBuilding(slotId: string): void {
  const state = gameState.value
  const slot = state.buildings[slotId]
  if (!slot || slot.queuePosition === null) return

  slot.level += 1
  slot.queuePosition = null
  slot.endTime = null
  state.buildingQueue = state.buildingQueue.filter(id => id !== slotId)
  touch()
}

export function getBuildingLevel(slotId: string): number {
  return gameState.value.buildings[slotId]?.level || 0
}
