import { signal } from '@preact/signals'
import type { Building, GameDefinitions, GameState } from './types.js'

/**
 * Definition registry shared with derived signals. Definition modules call
 * `registerDefinitions()` on import; `gameState` and its computeds only read
 * this plain object, so no module here imports later-wave definition files.
 */
export const definitions: GameDefinitions = {
  slots: [],
  buildings: {},
  resources: {},
  research: {}
}

function createInitialBuildings(): Record<string, Building> {
  return {}
}

export function createInitialState(): GameState {
  return {
    resources: { materials: 500, energy: 300, researchData: 0 },
    buildings: createInitialBuildings(),
    research: {},
    buildingQueue: [],
    researchQueue: [],
    clanEvent: {
      eventEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      playerPoints: 0,
      aiPoints: 0,
      aiProfile: 'grinder',
      pointLog: [],
      cycle: 1,
      produceAccumulator: 0,
      lastResults: null
    },
    shop: { currency: 1000, inventory: [] },
    lastSave: Date.now(),
    version: 1
  }
}

export const gameState = signal<GameState>(createInitialState())

/**
 * Force la notification du signal après une mutation en place.
 * Preact Signals ne détecte que la réassignation de `.value`, pas la
 * mutation de propriétés imbriquées.
 */
export function touch(): void {
  gameState.value = { ...gameState.value }
}

/**
 * Fill missing state entries from the registered definitions. Idempotent:
 * loaded saves keep their values, only absent slots and research nodes are
 * added. Returns true when anything changed.
 */
export function hydrateState(): boolean {
  const state = gameState.value
  let changed = false

  for (const slot of definitions.slots) {
    if (!state.buildings[slot.id]) {
      const type = slot.buildingType ?? null
      const def = type ? definitions.buildings[type] : undefined
      state.buildings[slot.id] = {
        id: slot.id,
        buildingType: type,
        level: def?.initialLevel ?? 0,
        maxLevel: def?.maxLevel ?? 10,
        queuePosition: null,
        endTime: null
      }
      changed = true
    }
  }

  for (const [id, def] of Object.entries(definitions.research)) {
    if (!state.research[id]) {
      state.research[id] = {
        id,
        state: def.prereqs.length === 0 ? 'available' : 'locked',
        queuePosition: null,
        endTime: null
      }
      changed = true
    }
  }

  if (changed) touch()
  return changed
}

/** Merge definition slices into the registry and rehydrate state. */
export function registerDefinitions(partial: Partial<GameDefinitions>): void {
  if (partial.slots) definitions.slots = partial.slots
  if (partial.buildings) Object.assign(definitions.buildings, partial.buildings)
  if (partial.resources) Object.assign(definitions.resources, partial.resources)
  if (partial.research) Object.assign(definitions.research, partial.research)
  hydrateState()
  touch()
}
