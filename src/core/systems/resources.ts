import type { ResourceAmount, ResourceCost } from '../state/types.js'
import { gameState, touch } from '../state/gameState.js'
import { resourceRates, storageLimits } from '../state/derived.js'
import { grantProductionPoints } from './clanEvent.js'

export function tick(deltaSec: number): void {
  const state = gameState.value
  const rates = resourceRates.value
  const limits = storageLimits.value

  const materials = Math.min(limits.materials, state.resources.materials + rates.materials * deltaSec)
  const energy = Math.min(limits.energy, state.resources.energy + rates.energy * deltaSec)
  const researchData = Math.min(limits.researchData, state.resources.researchData + rates.researchData * deltaSec)

  const actual = {
    materials: materials - state.resources.materials,
    energy: energy - state.resources.energy,
    researchData: researchData - state.resources.researchData
  }

  if (actual.materials === 0 && actual.energy === 0 && actual.researchData === 0) return

  state.resources.materials = materials
  state.resources.energy = energy
  state.resources.researchData = researchData
  grantProductionPoints(actual.materials + actual.energy + actual.researchData)
  touch()
}

export function spend(cost: ResourceCost): boolean {
  const state = gameState.value
  if (state.resources.materials < cost.materials ||
      state.resources.energy < cost.energy ||
      state.resources.researchData < cost.researchData) {
    return false
  }

  state.resources.materials -= cost.materials
  state.resources.energy -= cost.energy
  state.resources.researchData -= cost.researchData
  touch()
  return true
}

export function earn(amount: ResourceAmount): void {
  const state = gameState.value
  const limits = storageLimits.value
  state.resources.materials = Math.min(limits.materials, state.resources.materials + amount.materials)
  state.resources.energy = Math.min(limits.energy, state.resources.energy + amount.energy)
  state.resources.researchData = Math.min(limits.researchData, state.resources.researchData + amount.researchData)
  touch()
}

export function canAfford(cost: ResourceCost): boolean {
  const state = gameState.value
  return state.resources.materials >= cost.materials &&
         state.resources.energy >= cost.energy &&
         state.resources.researchData >= cost.researchData
}

export function getRate(resourceId: string): number {
  const rates = resourceRates.value
  return rates[resourceId as keyof typeof rates] || 0
}

export function getStorage(resourceId: string): number {
  const limits = storageLimits.value
  return limits[resourceId as keyof ResourceAmount] || 0
}

export function getStored(resourceId: string): number {
  const state = gameState.value
  return state.resources[resourceId as keyof typeof state.resources] || 0
}
