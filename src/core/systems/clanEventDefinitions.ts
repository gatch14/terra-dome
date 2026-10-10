import clanEventJson from '../../data/clanEvent.json'

export type AIProfileCurve = 'early' | 'steady' | 'late'
export type AIProfile = 'rusher' | 'grinder' | 'lateBloomer'

export interface ClanEventConfig {
  duration: number
  pointValues: { build: number; research: number; produce: number }
  aiProfiles: Record<AIProfile, { baseRate: number; curve: AIProfileCurve }>
  rewards: Record<'winner' | 'participant', { currency: number; speedups: string[] }>
}

/** Clan-event configuration, loaded from `src/data/clanEvent.json`. */
function loadConfig(): ClanEventConfig {
  const raw = clanEventJson as unknown as Partial<ClanEventConfig> & { durationMs?: number }
  if (typeof raw.durationMs !== 'number' || !raw.pointValues || !raw.aiProfiles || !raw.rewards) {
    throw new Error('clanEvent.json must define durationMs, pointValues, aiProfiles and rewards')
  }
  const curves: AIProfileCurve[] = ['early', 'steady', 'late']
  for (const profile of Object.values(raw.aiProfiles)) {
    if (typeof profile.baseRate !== 'number' || !curves.includes(profile.curve)) {
      throw new Error('Invalid AI profile in clanEvent.json')
    }
  }
  return {
    duration: raw.durationMs,
    pointValues: raw.pointValues,
    aiProfiles: raw.aiProfiles as ClanEventConfig['aiProfiles'],
    rewards: raw.rewards as ClanEventConfig['rewards']
  }
}

export const CLAN_EVENT_CONFIG = loadConfig()
