import { CLAN_EVENT_CONFIG, type AIProfileCurve } from './clanEventDefinitions.js'
import { timerManager } from '../time/timerManager.js'
import { gameState, touch } from '../state/gameState.js'
import { clanPointsMultiplier } from '../state/derived.js'
import type { ClanEventResults, PointLogEntry } from '../state/types.js'

const LOG_COALESCE_MS = 60_000

/**
 * Append a point-log entry, coalescing with the previous entry when it shares
 * clan and source within a minute (passive AI/produce ticks would otherwise
 * flood the log), and cap the log so saves stay small.
 */
function pushLog(entry: PointLogEntry): void {
  const log = gameState.value.clanEvent.pointLog
  const last = log[log.length - 1]
  if (last && last.clan === entry.clan && last.source === entry.source &&
      entry.timestamp - last.timestamp < LOG_COALESCE_MS) {
    last.amount += entry.amount
    last.timestamp = entry.timestamp
  } else {
    log.push(entry)
    if (log.length > 100) log.splice(0, log.length - 100)
  }
}

export function startEvent(): void {
  const state = gameState.value
  const now = Date.now()
  state.clanEvent.eventEndTime = now + CLAN_EVENT_CONFIG.duration
  state.clanEvent.playerPoints = 0
  state.clanEvent.aiPoints = 0
  state.clanEvent.aiProfile = pickAIProfile()
  state.clanEvent.pointLog = []
  state.clanEvent.cycle += 1

  timerManager.registerTimer('clan-event', state.clanEvent.eventEndTime, () => checkEventEnd(Date.now()))
  touch()
}

function pickAIProfile(): 'rusher' | 'grinder' | 'lateBloomer' {
  const profiles: Array<'rusher' | 'grinder' | 'lateBloomer'> = ['rusher', 'grinder', 'lateBloomer']
  return profiles[Math.floor(Math.random() * profiles.length)]
}

/**
 * Award (or deduct, with a negative amount) clan points for a player action.
 * Awards happen when the action is queued so the log updates immediately.
 */
export function addPlayerPoints(source: string, amount: number): void {
  if (amount === 0) return
  const state = gameState.value
  const now = Date.now()
  // Completed clanPointsMultiplier research boosts positive awards; deductions
  // are never boosted and floor() keeps the total an integer.
  const awarded = amount > 0 ? Math.floor(amount * clanPointsMultiplier.value) : amount
  state.clanEvent.playerPoints = Math.max(0, state.clanEvent.playerPoints + awarded)
  pushLog({ timestamp: now, clan: 'player', source, amount: awarded })
  touch()
}

/**
 * Production grants points per POINTS_PER_UNIT resources generated.
 * The fractional remainder is kept in `produceAccumulator` so it survives reloads.
 */
const POINTS_PER_UNIT_PRODUCED = CLAN_EVENT_CONFIG.pointValues.produce / 100

export function grantProductionPoints(unitsProduced: number): void {
  if (unitsProduced <= 0) return
  const state = gameState.value
  state.clanEvent.produceAccumulator += unitsProduced * POINTS_PER_UNIT_PRODUCED
  const whole = Math.floor(state.clanEvent.produceAccumulator)
  if (whole < 1) {
    touch()
    return
  }
  state.clanEvent.produceAccumulator -= whole
  addPlayerPoints('produce', whole)
}

export function tickAI(now: number): void {
  const state = gameState.value
  if (now >= state.clanEvent.eventEndTime) return

  const profile = CLAN_EVENT_CONFIG.aiProfiles[state.clanEvent.aiProfile]
  const elapsed = (now - (state.clanEvent.eventEndTime - CLAN_EVENT_CONFIG.duration)) / 1000
  const rate = getAIPointsRate(profile, elapsed)

  // Fractional accumulation: every profile accrues visibly (floor() would
  // freeze grinder/lateBloomer at zero forever).
  state.clanEvent.aiPoints += rate
  pushLog({ timestamp: now, clan: 'ai', source: 'passive', amount: rate })
  touch()
}

function getAIPointsRate(profile: { baseRate: number; curve: AIProfileCurve }, elapsedSec: number): number {
  const totalDuration = CLAN_EVENT_CONFIG.duration / 1000
  const progress = Math.min(elapsedSec / totalDuration, 1)

  switch (profile.curve) {
    case 'early':
      return profile.baseRate * (2 - progress)
    case 'steady':
      return profile.baseRate
    case 'late':
      return profile.baseRate * (0.5 + 1.5 * progress)
    default:
      return profile.baseRate
  }
}

export function getLeaderboard(): { clan: string; score: number }[] {
  const state = gameState.value
  return [
    { clan: 'Player', score: state.clanEvent.playerPoints },
    { clan: `AI (${state.clanEvent.aiProfile})`, score: state.clanEvent.aiPoints }
  ]
}

export function getPointLog(): { timestamp: number; clan: 'player' | 'ai'; source: string; amount: number }[] {
  return gameState.value.clanEvent.pointLog
}

export function getTimeRemaining(): number {
  const state = gameState.value
  return Math.max(0, state.clanEvent.eventEndTime - Date.now())
}

/**
 * Resolve a finished event: record the results (the UI shows them in the
 * results modal) and start the next cycle immediately.
 */
export function checkEventEnd(now: number): void {
  const state = gameState.value
  if (now < state.clanEvent.eventEndTime) return

  const winner = state.clanEvent.playerPoints >= state.clanEvent.aiPoints ? 'player' : 'ai'
  const rewards = winner === 'player' ? CLAN_EVENT_CONFIG.rewards.winner : CLAN_EVENT_CONFIG.rewards.participant

  const results: ClanEventResults = {
    winner,
    playerPoints: state.clanEvent.playerPoints,
    aiPoints: state.clanEvent.aiPoints,
    reward: { currency: rewards.currency, speedups: [...rewards.speedups] },
    endedAt: now
  }

  startEvent()
  state.clanEvent.lastResults = results
  pushLog({ timestamp: now, clan: winner, source: 'event_end', amount: 0 })
  touch()
}

/** Claim the rewards of the last finished event and dismiss the results modal. */
export function claimEventResults(): boolean {
  const state = gameState.value
  const results = state.clanEvent.lastResults
  if (!results) return false

  state.shop.currency += results.reward.currency
  for (const speedupId of results.reward.speedups) {
    const existing = state.shop.inventory.find(item => item.id === speedupId)
    if (existing) {
      existing.count += 1
    } else {
      state.shop.inventory.push({ id: speedupId, count: 1 })
    }
  }

  state.clanEvent.lastResults = null
  touch()
  return true
}
