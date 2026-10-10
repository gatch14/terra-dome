import type { GameState } from '../state/types.js'
import { timerManager } from './timerManager.js'
import { resourceRates, storageLimits } from '../state/derived.js'
import { completeBuilding } from '../systems/buildings.js'
import { completeResearch } from '../systems/research.js'
import { checkEventEnd } from '../systems/clanEvent.js'
import { CLAN_EVENT_CONFIG } from '../systems/clanEventDefinitions.js'

export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000

/** Flat AI points per second while offline (profile base rate, no curve). */
export const AI_POINTS_PER_SEC = {
  rusher: CLAN_EVENT_CONFIG.aiProfiles.rusher.baseRate,
  grinder: CLAN_EVENT_CONFIG.aiProfiles.grinder.baseRate,
  lateBloomer: CLAN_EVENT_CONFIG.aiProfiles.lateBloomer.baseRate
}

/**
 * Apply everything that would have progressed while the tab was closed.
 * Elapsed time is clamped to MAX_OFFLINE_MS so a week away is worth at most
 * 24 hours of progress; negative elapsed (clock skew) yields zero.
 */
export function applyOfflineProgress(state: GameState, now: number): GameState {
  const elapsed = Math.max(0, Math.min(now - state.lastSave, MAX_OFFLINE_MS))
  if (elapsed <= 0) return state

  const elapsedSec = elapsed / 1000

  const rates = resourceRates.value
  const limits = storageLimits.value
  state.resources.materials = Math.min(limits.materials, state.resources.materials + rates.materials * elapsedSec)
  state.resources.energy = Math.min(limits.energy, state.resources.energy + rates.energy * elapsedSec)
  state.resources.researchData = Math.min(limits.researchData, state.resources.researchData + rates.researchData * elapsedSec)

  for (const buildingId of state.buildingQueue) {
    const building = state.buildings[buildingId]
    if (building && building.endTime) {
      building.endTime = Math.max(now, building.endTime - elapsed)
      if (building.endTime <= now) {
        completeBuilding(buildingId)
      } else {
        timerManager.registerTimer(`build-${buildingId}`, building.endTime, () => completeBuilding(buildingId))
      }
    }
  }

  for (const researchId of state.researchQueue) {
    const research = state.research[researchId]
    if (research && research.endTime) {
      research.endTime = Math.max(now, research.endTime - elapsed)
      if (research.endTime <= now) {
        completeResearch(researchId)
      } else {
        timerManager.registerTimer(`research-${researchId}`, research.endTime, () => completeResearch(researchId))
      }
    }
  }

  const aiRate = AI_POINTS_PER_SEC[state.clanEvent.aiProfile] || 0.3
  state.clanEvent.aiPoints += aiRate * elapsedSec

  state.lastSave = now
  if (now >= state.clanEvent.eventEndTime) {
    checkEventEnd(now)
  }

  return state
}
