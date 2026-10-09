import { describe, it, expect, beforeEach } from 'vitest'
import { gameState, createInitialState, hydrateState } from '../state/gameState.js'
import {
  startEvent,
  addPlayerPoints,
  tickAI,
  checkEventEnd,
  claimEventResults,
  grantProductionPoints,
  getLeaderboard,
  getPointLog
} from './clanEvent.js'
import { CLAN_EVENT_CONFIG } from './clanEventDefinitions.js'

describe('clan event system', () => {
  beforeEach(() => {
    gameState.value = createInitialState()
    hydrateState()
  })

  it('creates a weekly event (7 days) on a fresh state', () => {
    const now = Date.now()
    const state = gameState.value
    expect(CLAN_EVENT_CONFIG.duration).toBe(7 * 24 * 60 * 60 * 1000)
    expect(state.clanEvent.eventEndTime).toBeGreaterThan(now)
    expect(state.clanEvent.cycle).toBe(1)
  })

  it('startEvent resets scores and log, and schedules the next cycle', () => {
    const state = gameState.value
    addPlayerPoints('build', 50)
    state.clanEvent.aiPoints = 42

    startEvent()

    expect(state.clanEvent.playerPoints).toBe(0)
    expect(state.clanEvent.aiPoints).toBe(0)
    expect(state.clanEvent.pointLog).toEqual([])
    expect(state.clanEvent.cycle).toBe(2)
    expect(state.clanEvent.eventEndTime).toBeGreaterThanOrEqual(Date.now() + CLAN_EVENT_CONFIG.duration - 1000)
  })

  it('addPlayerPoints awards, logs, and never drops below zero', () => {
    const state = gameState.value

    addPlayerPoints('build', 50)
    expect(state.clanEvent.playerPoints).toBe(50)
    expect(getPointLog()[0]).toMatchObject({ clan: 'player', source: 'build', amount: 50 })

    // Same source within a minute coalesces into the previous entry.
    addPlayerPoints('build', -20)
    expect(state.clanEvent.playerPoints).toBe(30)
    expect(getPointLog()).toHaveLength(1)
    expect(getPointLog()[0].amount).toBe(30)

    // A different source starts a new entry; the total clamps at zero.
    addPlayerPoints('build_cancel', -1000)
    expect(state.clanEvent.playerPoints).toBe(0)
    expect(getPointLog()).toHaveLength(2)
  })

  it('tickAI accrues points for every profile (fractional accumulation)', () => {
    const state = gameState.value
    const before = state.clanEvent.aiPoints

    tickAI(Date.now())

    expect(state.clanEvent.aiPoints).toBeGreaterThan(before)
    const aiLog = getPointLog().filter(e => e.clan === 'ai')
    expect(aiLog[0]?.source).toBe('passive')
  })

  it('tickAI stops once the event has ended', () => {
    const state = gameState.value
    state.clanEvent.eventEndTime = Date.now() - 1
    const before = state.clanEvent.aiPoints

    tickAI(Date.now())

    expect(state.clanEvent.aiPoints).toBe(before)
  })

  it('checkEventEnd is a no-op while the event is still running', () => {
    checkEventEnd(Date.now())
    expect(gameState.value.clanEvent.lastResults).toBeNull()
    expect(gameState.value.clanEvent.cycle).toBe(1)
  })

  it('checkEventEnd records results with the winner and starts the next cycle', () => {
    const state = gameState.value
    state.clanEvent.playerPoints = 500
    state.clanEvent.aiPoints = 200
    state.clanEvent.eventEndTime = Date.now() - 1

    checkEventEnd(Date.now())

    expect(state.clanEvent.lastResults).not.toBeNull()
    expect(state.clanEvent.lastResults?.winner).toBe('player')
    expect(state.clanEvent.lastResults?.playerPoints).toBe(500)
    expect(state.clanEvent.lastResults?.aiPoints).toBe(200)
    expect(state.clanEvent.lastResults?.reward.currency).toBe(CLAN_EVENT_CONFIG.rewards.winner.currency)
    expect(state.clanEvent.eventEndTime).toBeGreaterThan(Date.now())
    expect(state.clanEvent.cycle).toBe(2)
    expect(state.clanEvent.pointLog.some(e => e.source === 'event_end')).toBe(true)
  })

  it('claimEventResults awards currency and speedups, then clears the results', () => {
    const state = gameState.value
    state.clanEvent.eventEndTime = Date.now() - 1
    checkEventEnd(Date.now())
    const currencyBefore = state.shop.currency

    expect(claimEventResults()).toBe(true)

    expect(state.shop.currency).toBe(currencyBefore + CLAN_EVENT_CONFIG.rewards.winner.currency)
    expect(state.shop.inventory.find(i => i.id === '1h_build')?.count).toBe(1)
    expect(state.clanEvent.lastResults).toBeNull()
    expect(claimEventResults()).toBe(false) // nothing left to claim
  })

  it('grantProductionPoints accumulates fractions until a whole point is earned', () => {
    const state = gameState.value

    grantProductionPoints(50) // 50 × 0.1 = 5 points
    expect(state.clanEvent.playerPoints).toBe(5)
    expect(state.clanEvent.produceAccumulator).toBeCloseTo(0, 5)

    grantProductionPoints(3) // 0.3 points: not whole yet
    expect(state.clanEvent.playerPoints).toBe(5)
    expect(state.clanEvent.produceAccumulator).toBeCloseTo(0.3, 5)

    grantProductionPoints(7) // +0.7 → 1 whole point
    expect(state.clanEvent.playerPoints).toBe(6)
    expect(state.clanEvent.produceAccumulator).toBeCloseTo(0, 5)
  })

  it('getLeaderboard reports both clans with their scores', () => {
    const state = gameState.value
    addPlayerPoints('build', 50)
    state.clanEvent.aiPoints = 12.5

    const board = getLeaderboard()
    expect(board).toHaveLength(2)
    expect(board[0]).toEqual({ clan: 'Player', score: 50 })
    expect(board[1].score).toBe(12.5)
  })
})
