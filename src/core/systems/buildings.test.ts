import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { gameState, createInitialState, hydrateState } from '../state/gameState.js'
import { queueBuilding, cancelBuilding, completeBuilding, getBuildingLevel } from './buildings.js'
import { calculateCost, calculateBuildTime, getBuildingDef } from './buildingDefinitions.js'
import { resourceRates } from '../state/derived.js'
import { timerManager } from '../time/timerManager.js'
// definition modules register themselves on import (same as main.ts bootstrap)
import './resourceDefinitions.js'

describe('buildings system', () => {
  beforeEach(() => {
    gameState.value = createInitialState()
    hydrateState()
    timerManager.timers.clear()
  })

  afterEach(() => {
    timerManager.timers.clear()
  })

  it('queueBuilding deducts cost, sets endTime, queues and awards points', () => {
    const state = gameState.value
    const before = { ...state.resources }
    const def = getBuildingDef('resource_production')!

    expect(queueBuilding('resource_1', 'resource_production')).toBe(true)

    const cost = calculateCost(0, def)
    expect(state.resources.materials).toBe(before.materials - cost.materials)
    expect(state.resources.energy).toBe(before.energy - cost.energy)
    expect(state.resources.researchData).toBe(before.researchData - cost.researchData)
    expect(state.buildings['resource_1'].buildingType).toBe('resource_production')
    expect(state.buildings['resource_1'].endTime).toBeGreaterThan(Date.now())
    expect(state.buildingQueue).toEqual(['resource_1'])
    expect(state.clanEvent.playerPoints).toBe(50)
  })

  it('completeBuilding increments the level and raises production rates', () => {
    const rateBefore = resourceRates.value.materials
    queueBuilding('resource_1', 'resource_production')

    completeBuilding('resource_1')

    const state = gameState.value
    expect(state.buildings['resource_1'].level).toBe(1)
    expect(state.buildings['resource_1'].queuePosition).toBeNull()
    expect(state.buildings['resource_1'].endTime).toBeNull()
    expect(state.buildingQueue).toEqual([])
    expect(resourceRates.value.materials).toBeCloseTo(rateBefore + 10, 5)
  })

  it('cancelBuilding refunds 100% of the cost and clears the placement', () => {
    const state = gameState.value
    const before = { ...state.resources }
    queueBuilding('resource_1', 'resource_production')

    expect(cancelBuilding('resource_1')).toBe(true)

    // cancelBuilding reassigns the queue — read the live state back.
    const after = gameState.value
    expect(after.resources).toEqual(before)
    expect(after.buildings['resource_1'].buildingType).toBeNull()
    expect(after.buildings['resource_1'].queuePosition).toBeNull()
    expect(after.buildingQueue).toEqual([])
    expect(after.clanEvent.playerPoints).toBe(0) // award clawed back
  })

  it('allows only one active construction at a time', () => {
    expect(queueBuilding('resource_1', 'resource_production')).toBe(true)
    expect(queueBuilding('resource_2', 'energy_reactor')).toBe(false)
  })

  it('refuses to queue when resources are insufficient', () => {
    const state = gameState.value
    state.resources = { materials: 0, energy: 0, researchData: 0 }

    expect(queueBuilding('resource_1', 'resource_production')).toBe(false)
    expect(state.buildingQueue).toEqual([])
    expect(state.buildings['resource_1'].buildingType).toBeNull()
  })

  it('enforces slot types: research buildings do not fit resource slots', () => {
    expect(queueBuilding('resource_1', 'research_lab')).toBe(false)
    expect(gameState.value.buildingQueue).toEqual([])
  })

  it('keeps the research lab locked until Command Center Lv.2', () => {
    const state = gameState.value
    expect(queueBuilding('research_lab')).toBe(false) // CC is Lv.1

    expect(queueBuilding('command_center')).toBe(true)
    completeBuilding('command_center')
    expect(state.buildings['command_center'].level).toBe(2)

    state.resources.researchData = 100 // lab costs 50 research data
    expect(queueBuilding('research_lab')).toBe(true)
  })

  it('refuses to queue a building already at max level', () => {
    const state = gameState.value
    state.buildings['resource_1'] = {
      id: 'resource_1',
      buildingType: 'resource_production',
      level: 10,
      maxLevel: 10,
      queuePosition: null,
      endTime: null
    }
    expect(queueBuilding('resource_1')).toBe(false)
  })

  it('getBuildingLevel reports the slot level', () => {
    expect(getBuildingLevel('command_center')).toBe(1)
    expect(getBuildingLevel('resource_1')).toBe(0)
  })

  it('calculateCost scales levels as floor(base × costMultiplier^level)', () => {
    const def = getBuildingDef('resource_production')!

    const level0 = calculateCost(0, def)
    expect(level0.materials).toBe(def.baseCost.materials)
    expect(level0.energy).toBe(def.baseCost.energy)
    expect(level0.researchData).toBe(def.baseCost.researchData)

    const level1 = calculateCost(1, def)
    expect(level1.materials).toBe(Math.floor(def.baseCost.materials * def.costMultiplier))
    expect(level1.energy).toBe(Math.floor(def.baseCost.energy * def.costMultiplier))
    expect(level1.researchData).toBe(Math.floor(def.baseCost.researchData * def.costMultiplier))
    expect(level1.materials).toBeGreaterThan(level0.materials)

    const level2 = calculateCost(2, def)
    expect(level2.materials).toBe(
      Math.floor(def.baseCost.materials * Math.pow(def.costMultiplier, 2))
    )
    expect(level2.materials).toBeGreaterThan(level1.materials)
  })

  it('calculateBuildTime scales levels as floor(base × timeMultiplier^level)', () => {
    const def = getBuildingDef('resource_production')!

    expect(calculateBuildTime(0, def)).toBe(def.baseBuildTime)

    const level1 = calculateBuildTime(1, def)
    expect(level1).toBe(Math.floor(def.baseBuildTime * def.timeMultiplier))
    expect(level1).toBeGreaterThan(calculateBuildTime(0, def))

    const level2 = calculateBuildTime(2, def)
    expect(level2).toBe(Math.floor(def.baseBuildTime * Math.pow(def.timeMultiplier, 2)))
    expect(level2).toBeGreaterThan(level1)
  })
})
