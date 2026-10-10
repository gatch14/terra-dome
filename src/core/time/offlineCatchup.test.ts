import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { gameState, createInitialState, hydrateState } from '../state/gameState.js'
import { storageLimits, resourceRates } from '../state/derived.js'
import { applyOfflineProgress, MAX_OFFLINE_MS, AI_POINTS_PER_SEC } from './offlineCatchup.js'
import { timerManager } from './timerManager.js'
// definitions register themselves on import
import '../systems/buildingDefinitions.js'
import '../systems/resourceDefinitions.js'
import '../systems/researchDefinitions.js'
import '../systems/clanEventDefinitions.js'

describe('applyOfflineProgress', () => {
  beforeEach(() => {
    gameState.value = createInitialState()
    hydrateState()
    timerManager.timers.clear()
  })

  afterEach(() => {
    timerManager.timers.clear()
  })

  it('clock skew (lastSave in the future) yields zero progress', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now + 60_000
    const before = { ...state.resources }

    applyOfflineProgress(state, now)

    expect(state.resources).toEqual(before)
    expect(state.lastSave).toBe(now + 60_000)
  })

  it('clamps elapsed time to 24h and applies the same cap to AI points', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now - 48 * 60 * 60 * 1000 // two days away

    applyOfflineProgress(state, now)

    // Resource gains are capped by storage (rate × 86400s would overflow it).
    const limits = storageLimits.value
    expect(state.resources.materials).toBe(limits.materials)
    expect(state.resources.energy).toBe(limits.energy)
    expect(state.resources.researchData).toBe(limits.researchData)

    // AI points follow AI_POINTS_PER_SEC × elapsed (24h, not 48h).
    const expectedAi = AI_POINTS_PER_SEC[state.clanEvent.aiProfile] * (MAX_OFFLINE_MS / 1000)
    expect(state.clanEvent.aiPoints).toBeCloseTo(expectedAi, 5)
    expect(MAX_OFFLINE_MS).toBe(24 * 60 * 60 * 1000)
  })

  it('does not exceed storage when resources are already full', () => {
    const now = Date.now()
    const state = gameState.value
    state.resources = { ...storageLimits.value }
    state.lastSave = now - 60 * 60 * 1000

    applyOfflineProgress(state, now)

    expect(state.resources).toEqual(storageLimits.value)
  })

  it('reduces remaining building timers by the offline duration', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now - 30 * 60 * 1000 // 30 minutes away
    state.buildings['resource_1'] = {
      id: 'resource_1',
      buildingType: 'resource_production',
      level: 0,
      maxLevel: 10,
      queuePosition: 0,
      endTime: now + 7200_000
    }
    state.buildingQueue = ['resource_1']

    applyOfflineProgress(state, now)

    expect(state.buildings['resource_1'].endTime).toBe(now + 7200_000 - 30 * 60 * 1000)
    expect(state.buildings['resource_1'].level).toBe(0)
    expect(state.buildingQueue).toEqual(['resource_1'])
  })

  it('completes timers that elapsed while offline', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now - 2 * 60 * 60 * 1000 // 2 hours away
    state.buildings['resource_1'] = {
      id: 'resource_1',
      buildingType: 'resource_production',
      level: 0,
      maxLevel: 10,
      queuePosition: 0,
      endTime: now + 30 * 60 * 1000
    }
    state.buildingQueue = ['resource_1']

    applyOfflineProgress(state, now)

    expect(state.buildings['resource_1'].level).toBe(1)
    expect(state.buildingQueue).toEqual([])
    expect(state.buildings['resource_1'].queuePosition).toBeNull()
  })

  it('detects an event that ended while offline and starts the next cycle', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now - 60_000
    state.clanEvent.eventEndTime = now - 1000
    state.clanEvent.playerPoints = 120
    state.clanEvent.aiPoints = 80

    applyOfflineProgress(state, now)

    expect(state.clanEvent.lastResults).not.toBeNull()
    expect(state.clanEvent.lastResults?.winner).toBe('player')
    expect(state.clanEvent.lastResults?.playerPoints).toBe(120)
    expect(state.clanEvent.eventEndTime).toBeGreaterThan(now)
    expect(state.clanEvent.cycle).toBe(2)
  })

  it('zero elapsed (lastSave === now) yields no progress', () => {
    const now = Date.now()
    const state = gameState.value
    state.lastSave = now
    const before = { ...state.resources }
    const aiBefore = state.clanEvent.aiPoints

    applyOfflineProgress(state, now)

    expect(state.resources).toEqual(before)
    expect(state.clanEvent.aiPoints).toBe(aiBefore)
    expect(state.lastSave).toBe(now)
  })

  it('normal absence accrues resources at rate x elapsed, under the caps', () => {
    const now = Date.now()
    const state = gameState.value
    const elapsedMs = 5 * 60 * 1000 // 5 min — a normal absence, well under the 24h cap
    state.lastSave = now - elapsedMs
    const rates = resourceRates.value
    const before = { ...state.resources }

    applyOfflineProgress(state, now)

    const elapsedSec = elapsedMs / 1000
    expect(state.resources.materials).toBeCloseTo(before.materials + rates.materials * elapsedSec, 5)
    expect(state.resources.energy).toBeCloseTo(before.energy + rates.energy * elapsedSec, 5)
    expect(state.resources.researchData).toBeCloseTo(before.researchData + rates.researchData * elapsedSec, 5)
    expect(state.lastSave).toBe(now)
  })
})
