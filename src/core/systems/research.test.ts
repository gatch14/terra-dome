import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { gameState, createInitialState, hydrateState, touch } from '../state/gameState.js'
import { startResearch, cancelResearch, completeResearch, getAvailableResearch, getNodeState } from './research.js'
import { RESEARCH_DEFINITIONS } from './researchDefinitions.js'
import { calculateBuildTime, getBuildingDef } from './buildingDefinitions.js'
import { addPlayerPoints } from './clanEvent.js'
import {
  resourceRates,
  buildSpeedMultiplier,
  researchSpeedMultiplier,
  clanPointsMultiplier
} from '../state/derived.js'
import { timerManager } from '../time/timerManager.js'
// definition modules register themselves on import (same as main.ts bootstrap)
import './resourceDefinitions.js'

/** Within storage caps ({1000, 1000, 500}) so 100% refunds are never clamped. */
const START_RESOURCES = { materials: 900, energy: 900, researchData: 400 }

describe('research system', () => {
  beforeEach(() => {
    gameState.value = createInitialState()
    hydrateState()
    timerManager.timers.clear()
    gameState.value.resources = { ...START_RESOURCES }
  })

  afterEach(() => {
    timerManager.timers.clear()
  })

  it('hydrates the tech tree from research.json with correct initial states', () => {
    const state = gameState.value
    expect(Object.keys(state.research).length).toBe(Object.keys(RESEARCH_DEFINITIONS).length)
    expect(state.research['efficient_smelting'].state).toBe('available')
    expect(state.research['advanced_circuitry'].state).toBe('locked')
    expect(state.research['rapid_construction'].state).toBe('available')
  })

  it('startResearch deducts cost, queues the node and awards points', () => {
    const state = gameState.value

    expect(startResearch('efficient_smelting')).toBe(true)

    const def = RESEARCH_DEFINITIONS['efficient_smelting']
    expect(state.resources.materials).toBe(START_RESOURCES.materials - def.cost.materials)
    expect(state.resources.energy).toBe(START_RESOURCES.energy - def.cost.energy)
    expect(state.resources.researchData).toBe(START_RESOURCES.researchData - def.cost.researchData)
    expect(state.research['efficient_smelting'].state).toBe('researching')
    expect(state.researchQueue).toEqual(['efficient_smelting'])
    expect(state.research['efficient_smelting'].endTime).toBeGreaterThan(Date.now())
    expect(state.clanEvent.playerPoints).toBe(100)
  })

  it('refuses to start a node whose prerequisites are not completed', () => {
    expect(startResearch('advanced_circuitry')).toBe(false)
    expect(gameState.value.research['advanced_circuitry'].state).toBe('locked')
    expect(gameState.value.researchQueue).toEqual([])
  })

  it('refuses to start research when unaffordable', () => {
    const state = gameState.value
    state.resources = { materials: 0, energy: 0, researchData: 0 }

    expect(startResearch('efficient_smelting')).toBe(false)
    expect(state.research['efficient_smelting'].state).toBe('available')
    expect(state.researchQueue).toEqual([])
  })

  it('completeResearch marks the node completed and unlocks dependents', () => {
    expect(startResearch('efficient_smelting')).toBe(true)

    completeResearch('efficient_smelting')

    // touch() replaces the top-level state object — read it back after mutations.
    const after = gameState.value
    expect(after.research['efficient_smelting'].state).toBe('completed')
    expect(after.research['efficient_smelting'].endTime).toBeNull()
    expect(after.researchQueue).toEqual([])
    expect(after.research['advanced_circuitry'].state).toBe('available')
    expect(after.research['data_compression'].state).toBe('available')
    expect(getAvailableResearch()).not.toContain('advanced_circuitry') // no longer locked
  })

  it('cancelResearch refunds 100% of the cost', () => {
    const before = { ...gameState.value.resources }
    expect(startResearch('efficient_smelting')).toBe(true)
    const pointsAfterStart = gameState.value.clanEvent.playerPoints

    expect(cancelResearch('efficient_smelting')).toBe(true)

    const after = gameState.value
    expect(after.resources).toEqual(before) // exact full refund
    expect(after.research['efficient_smelting'].state).toBe('available')
    expect(after.researchQueue).toEqual([])
    expect(after.clanEvent.playerPoints).toBe(pointsAfterStart - 100)
  })

  it('completed research modifies resource rates', () => {
    const base = resourceRates.value.materials
    gameState.value.research['efficient_smelting'].state = 'completed'
    touch() // invalidate the derived computeds after a direct nested mutation

    // Efficient Smelting: +10% materials rate.
    expect(resourceRates.value.materials).toBeCloseTo(base * 1.1, 5)
  })

  it('completed research exposes buildSpeed, researchSpeed and clanPointsMultiplier multipliers', () => {
    // Neutral without completed research.
    expect(buildSpeedMultiplier.value).toBe(1)
    expect(researchSpeedMultiplier.value).toBe(1)
    expect(clanPointsMultiplier.value).toBe(1)

    const state = gameState.value
    state.research['rapid_construction'].state = 'completed' // buildSpeed +20%
    state.research['quantum_computing'].state = 'completed' // researchSpeed +25%
    state.research['clan_coordination'].state = 'completed' // clan points +15%
    state.research['diplomatic_relations'].state = 'completed' // clan points +10%
    touch()

    expect(buildSpeedMultiplier.value).toBeCloseTo(1.2, 5)
    expect(researchSpeedMultiplier.value).toBeCloseTo(1.25, 5)
    expect(clanPointsMultiplier.value).toBeCloseTo(1.15 * 1.1, 5) // multiplicative stacking
  })

  it('buildSpeed research shortens calculateBuildTime', () => {
    const def = getBuildingDef('resource_production')!
    const neutral = Math.floor(def.baseBuildTime * Math.pow(def.timeMultiplier, 1))
    expect(calculateBuildTime(1, def)).toBe(neutral)

    gameState.value.research['rapid_construction'].state = 'completed'
    touch()

    const boosted = calculateBuildTime(1, def)
    expect(boosted).toBe(
      Math.floor((def.baseBuildTime * Math.pow(def.timeMultiplier, 1)) / 1.2)
    )
    expect(boosted).toBeLessThan(neutral)
  })

  it('researchSpeed research shortens the research timer', () => {
    const def = RESEARCH_DEFINITIONS['efficient_smelting']

    const start0 = Date.now()
    expect(startResearch('efficient_smelting')).toBe(true)
    const neutralEnd = gameState.value.research['efficient_smelting'].endTime!
    expect(neutralEnd - start0).toBeGreaterThanOrEqual(def.time * 1000)
    expect(neutralEnd - start0).toBeLessThan(def.time * 1000 + 500) // slack: setup latency
    expect(cancelResearch('efficient_smelting')).toBe(true)

    gameState.value.research['quantum_computing'].state = 'completed'
    touch()

    const start1 = Date.now()
    expect(startResearch('efficient_smelting')).toBe(true)
    const boostedEnd = gameState.value.research['efficient_smelting'].endTime!
    const boosted = Math.floor((def.time * 1000) / 1.25)
    expect(boostedEnd - start1).toBeGreaterThanOrEqual(boosted)
    expect(boostedEnd - start1).toBeLessThan(boosted + 500) // slack: setup latency
  })

  it('clanPointsMultiplier research boosts player point awards', () => {
    addPlayerPoints('build', 50)
    expect(gameState.value.clanEvent.playerPoints).toBe(50) // neutral

    gameState.value.research['clan_coordination'].state = 'completed'
    touch()

    addPlayerPoints('build', 50)
    expect(gameState.value.clanEvent.playerPoints).toBe(50 + Math.floor(50 * 1.15)) // 107

    addPlayerPoints('research_cancel', -100)
    expect(gameState.value.clanEvent.playerPoints).toBe(7) // deductions are never boosted
  })

  it('getNodeState defaults to locked for unknown nodes', () => {
    expect(getNodeState('does_not_exist')).toBe('locked')
  })
})
