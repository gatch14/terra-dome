import { computed } from '@preact/signals'
import { gameState, definitions } from './gameState.js'
import type { ResourceAmount, ResourceRate } from './types.js'

export { gameState } from './gameState.js'

export const resourceRates = computed<ResourceRate>(() => {
  const state = gameState.value
  const rates: ResourceRate = { materials: 0, energy: 0, researchData: 0 }

  for (const def of Object.values(definitions.resources)) {
    rates[def.id as keyof ResourceRate] += def.baseRate
  }

  for (const building of Object.values(state.buildings)) {
    if (building.level > 0 && building.buildingType) {
      const def = definitions.buildings[building.buildingType]
      if (def?.production) {
        rates.materials += (def.production.materials || 0) * building.level
        rates.energy += (def.production.energy || 0) * building.level
        rates.researchData += (def.production.researchData || 0) * building.level
      }
    }
  }

  for (const research of Object.values(state.research)) {
    if (research.state === 'completed') {
      const def = definitions.research[research.id]
      if (def?.effect.type === 'resourceRate') {
        rates[def.effect.target as keyof typeof rates] *= (1 + def.effect.value)
      }
    }
  }

  return rates
})

/** Storage caps: base storage from resources.json plus building storage bonuses. */
export const storageLimits = computed<ResourceAmount>(() => {
  const state = gameState.value
  const limits: ResourceAmount = { materials: 0, energy: 0, researchData: 0 }

  for (const def of Object.values(definitions.resources)) {
    limits[def.id as keyof ResourceAmount] += def.baseStorage
  }

  for (const building of Object.values(state.buildings)) {
    if (building.level > 0 && building.buildingType) {
      const def = definitions.buildings[building.buildingType]
      if (def?.storageBonus) {
        limits.materials += (def.storageBonus.materials || 0) * building.level
        limits.energy += (def.storageBonus.energy || 0) * building.level
        limits.researchData += (def.storageBonus.researchData || 0) * building.level
      }
    }
  }

  return limits
})

export const buildingQueue = computed(() => {
  const state = gameState.value
  return state.buildingQueue
    .map((id, index) => {
      const building = state.buildings[id]
      if (!building || !building.endTime) return null
      return { id, endTime: building.endTime, position: index }
    })
    .filter(Boolean) as { id: string; endTime: number; position: number }[]
})

export const researchQueue = computed(() => {
  const state = gameState.value
  return state.researchQueue
    .map((id, index) => {
      const research = state.research[id]
      if (!research || !research.endTime) return null
      return { id, endTime: research.endTime, position: index }
    })
    .filter(Boolean) as { id: string; endTime: number; position: number }[]
})

export const availableResearch = computed(() => {
  const state = gameState.value
  return Object.values(state.research)
    .filter(r => r.state === 'available')
    .map(r => r.id)
})

export const totalClanPoints = computed(() => ({
  player: gameState.value.clanEvent.playerPoints,
  ai: gameState.value.clanEvent.aiPoints
}))
