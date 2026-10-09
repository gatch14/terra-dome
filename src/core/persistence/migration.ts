import type { SaveFile } from '../state/types.js'
import { CURRENT_SAVE_VERSION } from './schema.js'

/**
 * Legacy v1 save key -> v2 grid slot id. v1 stored one singleton entry per
 * building type; v2 stores one entry per grid slot with a `buildingType`.
 */
const LEGACY_TO_SLOT: Record<string, string> = {
  command_center: 'command_center',
  resource_production: 'resource_1',
  resource_storage: 'resource_2',
  energy_reactor: 'resource_3',
  research_lab: 'research_lab'
}

function migrateV1toV2(data: Record<string, unknown>): Record<string, unknown> {
  const legacyBuildings = (data.buildings ?? {}) as Record<string, Record<string, unknown>>
  const buildings: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(legacyBuildings)) {
    const slotId = LEGACY_TO_SLOT[key]
    if (!slotId) continue // unknown legacy building: drop it
    buildings[slotId] = { ...entry, id: slotId, buildingType: key }
  }

  const { storage: _storage, ...rest } = data
  const clanEvent = { ...(data.clanEvent as Record<string, unknown>), lastResults: null }
  return { ...rest, buildings, clanEvent }
}

/**
 * Upgrade any older save to CURRENT_SAVE_VERSION. Input is unvalidated
 * on purpose: migration runs before the Zod schema so v0/v1 saves still load.
 */
export function migrateSave(raw: unknown): SaveFile {
  const save = raw as { version?: number; data?: Record<string, unknown>; savedAt?: number }
  if (!save || typeof save !== 'object' || !save.data || typeof save.data !== 'object') {
    throw new Error('Invalid save file')
  }

  let version = typeof save.version === 'number' && save.version > 0 ? save.version : 0
  let data: Record<string, unknown> = save.data
  const savedAt = typeof save.savedAt === 'number' ? save.savedAt : Date.now()

  if (version < 1) {
    // v0 -> v1: introduce the save version field.
    version = 1
  }
  if (version === 1) {
    // v1 -> v2: grid slot model, derived storage, event results.
    data = migrateV1toV2(data)
    version = 2
  }
  if (version > CURRENT_SAVE_VERSION) {
    // Future save: leave it as-is; schema validation decides whether it loads.
    return { version, data: data as unknown as SaveFile['data'], savedAt }
  }

  return { version, data: data as unknown as SaveFile['data'], savedAt }
}
