import { RESEARCH_DEFINITIONS, getResearchDef } from './researchDefinitions.js'
import { timerManager } from '../time/timerManager.js'
import { gameState, touch } from '../state/gameState.js'
import { storageLimits, researchSpeedMultiplier } from '../state/derived.js'
import { canAfford, spend } from './resources.js'
import { addPlayerPoints } from './clanEvent.js'
import { CLAN_EVENT_CONFIG } from './clanEventDefinitions.js'

export function getAvailableResearch(): string[] {
  const state = gameState.value
  return Object.entries(RESEARCH_DEFINITIONS)
    .filter(([id, def]) => {
      const node = state.research[id]
      if (!node || node.state !== 'locked') return false
      return def.prereqs.every(prereq => state.research[prereq]?.state === 'completed')
    })
    .map(([id]) => id)
}

export function startResearch(nodeId: string): boolean {
  const state = gameState.value
  const def = getResearchDef(nodeId)
  if (!def) return false

  const node = state.research[nodeId]
  if (!node || node.state !== 'available') return false

  if (!canAfford(def.cost)) return false

  spend(def.cost)

  // Completed researchSpeed research shortens the timer (derived multiplier).
  const durationMs = Math.floor((def.time * 1000) / researchSpeedMultiplier.value)
  const endTime = Date.now() + durationMs
  node.state = 'researching'
  node.queuePosition = state.researchQueue.length
  node.endTime = endTime
  state.researchQueue.push(nodeId)

  timerManager.registerTimer(`research-${nodeId}`, endTime, () => completeResearch(nodeId))
  addPlayerPoints('research', CLAN_EVENT_CONFIG.pointValues.research)
  touch()
  return true
}

/** Cancel running research and refund 100% of its cost. */
export function cancelResearch(nodeId: string): boolean {
  const state = gameState.value
  const node = state.research[nodeId]
  if (!node || node.state !== 'researching') return false

  const def = getResearchDef(nodeId)
  if (!def) return false

  const limits = storageLimits.value
  state.resources.materials = Math.min(limits.materials, state.resources.materials + def.cost.materials)
  state.resources.energy = Math.min(limits.energy, state.resources.energy + def.cost.energy)
  state.resources.researchData = Math.min(limits.researchData, state.resources.researchData + def.cost.researchData)

  timerManager.unregisterTimer(`research-${nodeId}`)
  node.state = 'available'
  node.queuePosition = null
  node.endTime = null
  state.researchQueue = state.researchQueue.filter(id => id !== nodeId)
  addPlayerPoints('research_cancel', -CLAN_EVENT_CONFIG.pointValues.research)
  touch()

  return true
}

export function completeResearch(nodeId: string): void {
  const state = gameState.value
  const node = state.research[nodeId]
  if (!node || node.state !== 'researching') return

  node.state = 'completed'
  node.queuePosition = null
  node.endTime = null
  state.researchQueue = state.researchQueue.filter(id => id !== nodeId)

  // Effects apply through derived signals (resourceRates plus the
  // buildSpeedMultiplier / researchSpeedMultiplier / clanPointsMultiplier
  // computeds), so completion only has to flip the node's state.
  for (const availableId of getAvailableResearch()) {
    const availableNode = state.research[availableId]
    if (availableNode && availableNode.state === 'locked') {
      availableNode.state = 'available'
    }
  }
  touch()
}

export function getNodeState(nodeId: string): 'locked' | 'available' | 'researching' | 'completed' {
  return gameState.value.research[nodeId]?.state || 'locked'
}

export function getAvailableNodes(): string[] {
  return getAvailableResearch()
}
