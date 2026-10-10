import type { BuildingDef, SlotDef } from '../state/types.js'
import { registerDefinitions } from '../state/gameState.js'
import { buildSpeedMultiplier } from '../state/derived.js'
import buildingsJson from '../../data/buildings.json'

/**
 * Building and grid-slot definitions, loaded from `src/data/buildings.json`.
 * The JSON file is the single source of truth: designers edit it and the app
 * hot-reloads on dev refresh.
 */
function loadDefinitions(): { slots: SlotDef[]; buildings: Record<string, BuildingDef> } {
  const raw = buildingsJson as unknown as { slots?: unknown; buildings?: unknown }
  if (!Array.isArray(raw.slots) || !Array.isArray(raw.buildings)) {
    throw new Error('buildings.json must contain a "slots" array and a "buildings" array')
  }

  const slots = raw.slots.map(slot => {
    const s = slot as SlotDef
    if (!s.id || !s.type || !s.label) {
      throw new Error('Invalid slot definition: id, type and label are required')
    }
    return s
  })

  const buildings: Record<string, BuildingDef> = {}
  for (const entry of raw.buildings) {
    const def = entry as BuildingDef
    if (!def.id || !def.name || typeof def.baseCost?.materials !== 'number' ||
        typeof def.baseBuildTime !== 'number' || typeof def.maxLevel !== 'number') {
      throw new Error(`Invalid building definition: ${def.id || 'missing id'}`)
    }
    buildings[def.id] = def
  }

  for (const slot of slots) {
    if (slot.buildingType && !buildings[slot.buildingType]) {
      throw new Error(`Slot ${slot.id} references unknown building ${slot.buildingType}`)
    }
  }

  return { slots, buildings }
}

const { slots: SLOT_LAYOUT, buildings: BUILDING_DEFINITIONS } = loadDefinitions()

export { SLOT_LAYOUT, BUILDING_DEFINITIONS }

export function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDING_DEFINITIONS[id]
}

export function calculateCost(level: number, def: BuildingDef) {
  const multiplier = Math.pow(def.costMultiplier, level)
  return {
    materials: Math.floor(def.baseCost.materials * multiplier),
    energy: Math.floor(def.baseCost.energy * multiplier),
    researchData: Math.floor(def.baseCost.researchData * multiplier)
  }
}

export function calculateBuildTime(level: number, def: BuildingDef): number {
  // Completed buildSpeed research shortens every construction (derived multiplier).
  return Math.floor(
    (def.baseBuildTime * Math.pow(def.timeMultiplier, level)) / buildSpeedMultiplier.value
  )
}

export function calculateProduction(level: number, def: BuildingDef) {
  if (!def.production) return { materials: 0, energy: 0, researchData: 0 }
  return {
    materials: (def.production.materials || 0) * level,
    energy: (def.production.energy || 0) * level,
    researchData: (def.production.researchData || 0) * level
  }
}

export function calculateStorageBonus(level: number, def: BuildingDef) {
  if (!def.storageBonus) return { materials: 0, energy: 0, researchData: 0 }
  return {
    materials: (def.storageBonus.materials || 0) * level,
    energy: (def.storageBonus.energy || 0) * level,
    researchData: (def.storageBonus.researchData || 0) * level
  }
}

registerDefinitions({ slots: SLOT_LAYOUT, buildings: BUILDING_DEFINITIONS })
