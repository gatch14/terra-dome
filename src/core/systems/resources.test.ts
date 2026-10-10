import { describe, it, expect, beforeEach } from 'vitest'
import { gameState, createInitialState, hydrateState, touch } from '../state/gameState.js'
import { tick, spend, earn, canAfford, getRate, getStorage, getStored } from './resources.js'
import { storageLimits } from '../state/derived.js'
// definition modules register themselves on import (same as main.ts bootstrap)
import './resourceDefinitions.js'
import './buildingDefinitions.js'

describe('resources system', () => {
  beforeEach(() => {
    gameState.value = createInitialState()
    hydrateState()
  })

  it('tick increases each resource by its rate', () => {
    const state = gameState.value
    const before = { ...state.resources }

    tick(1)

    expect(state.resources.materials).toBeCloseTo(before.materials + getRate('materials'), 5)
    expect(state.resources.energy).toBeCloseTo(before.energy + getRate('energy'), 5)
    expect(state.resources.researchData).toBeCloseTo(before.researchData + getRate('researchData'), 5)
    expect(state.resources.materials).toBeGreaterThan(before.materials)
  })

  it('tick clamps resources at the storage limits', () => {
    const state = gameState.value
    state.resources = { ...storageLimits.value }

    tick(600)

    expect(state.resources).toEqual(storageLimits.value)
  })

  it('spend deducts when affordable', () => {
    const state = gameState.value
    const before = { ...state.resources }

    expect(spend({ materials: 100, energy: 50, researchData: 0 })).toBe(true)
    expect(state.resources.materials).toBe(before.materials - 100)
    expect(state.resources.energy).toBe(before.energy - 50)
  })

  it('spend fails and changes nothing when unaffordable', () => {
    const state = gameState.value
    const before = { ...state.resources }

    expect(spend({ materials: 999_999, energy: 0, researchData: 0 })).toBe(false)
    expect(state.resources).toEqual(before)
  })

  it('earn adds resources and clamps at storage', () => {
    const state = gameState.value
    const before = { ...state.resources }

    earn({ materials: 50, energy: 25, researchData: 10 })
    expect(state.resources.materials).toBe(before.materials + 50)
    expect(state.resources.energy).toBe(before.energy + 25)

    // Re-read the live state (touch() replaced the top-level object), fill
    // close to the cap, then earn again to prove the clamp.
    gameState.value.resources = {
      materials: storageLimits.value.materials - 10,
      energy: 0,
      researchData: 0
    }
    earn({ materials: 100, energy: 0, researchData: 0 })
    expect(gameState.value.resources.materials).toBe(storageLimits.value.materials)
  })

  it('canAfford reflects available resources', () => {
    expect(canAfford({ materials: 100, energy: 50, researchData: 0 })).toBe(true)
    expect(canAfford({ materials: 999_999, energy: 0, researchData: 0 })).toBe(false)
  })

  it('rates include base rates from resources.json plus building production', () => {
    const state = gameState.value
    // Base rate only (resources.json baseRate = 1/s).
    expect(getRate('materials')).toBeCloseTo(1, 5)

    // A level-2 Resource Production adds 2 × {10 materials, 5 energy}/s on top
    // of the base rates (1 / 0.5).
    state.buildings['resource_1'] = {
      id: 'resource_1',
      buildingType: 'resource_production',
      level: 2,
      maxLevel: 10,
      queuePosition: null,
      endTime: null
    }
    touch() // invalidate the derived computeds after a direct nested mutation
    expect(getRate('materials')).toBeCloseTo(21, 5)
    expect(getRate('energy')).toBeCloseTo(10.5, 5)
    expect(getRate('researchData')).toBeCloseTo(2.1, 5)
  })

  it('storage comes from resources.json base storage plus building bonuses', () => {
    const state = gameState.value
    expect(getStorage('materials')).toBe(1000)
    expect(getStorage('researchData')).toBe(500)

    state.buildings['resource_2'] = {
      id: 'resource_2',
      buildingType: 'resource_storage',
      level: 1,
      maxLevel: 10,
      queuePosition: null,
      endTime: null
    }
    touch() // invalidate the derived computeds after a direct nested mutation
    expect(getStorage('materials')).toBe(1500)
    expect(getStorage('energy')).toBe(1500)
    expect(getStorage('researchData')).toBe(750)
  })

  it('getStored reports the current amount', () => {
    const state = gameState.value
    expect(getStored('materials')).toBe(state.resources.materials)
  })
})
