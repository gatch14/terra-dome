import { gameState } from '../state/gameState.js'
import { timerManager } from './timerManager.js'
import { completeBuilding } from '../systems/buildings.js'
import { completeResearch } from '../systems/research.js'
import { checkEventEnd } from '../systems/clanEvent.js'

/**
 * Re-registers every absolute-endTime timer from the loaded state.
 * Timers live only in memory, so they must be rebuilt on each boot.
 * Entries whose endTime already passed fire on the next tick.
 */
export function resumeTimers(): void {
  const state = gameState.value
  const now = Date.now()

  for (const buildingId of state.buildingQueue) {
    const building = state.buildings[buildingId]
    if (building?.endTime) {
      timerManager.registerTimer(`build-${buildingId}`, building.endTime, () => completeBuilding(buildingId))
    }
  }

  for (const researchId of state.researchQueue) {
    const research = state.research[researchId]
    if (research?.endTime) {
      timerManager.registerTimer(`research-${researchId}`, research.endTime, () => completeResearch(researchId))
    }
  }

  if (state.clanEvent.eventEndTime) {
    timerManager.registerTimer('clan-event', state.clanEvent.eventEndTime, () => checkEventEnd(now))
  }
}
