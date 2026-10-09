import type { ResourceDef } from '../state/types.js'
import { registerDefinitions } from '../state/gameState.js'
import resourcesJson from '../../data/resources.json'

/** Resource definitions, loaded from `src/data/resources.json`. */
function loadDefinitions(): Record<string, ResourceDef> {
  if (!Array.isArray(resourcesJson)) {
    throw new Error('resources.json must be an array of resources')
  }
  const defs: Record<string, ResourceDef> = {}
  for (const entry of resourcesJson as unknown as ResourceDef[]) {
    if (!entry.id || !entry.name || typeof entry.baseStorage !== 'number' ||
        typeof entry.baseRate !== 'number') {
      throw new Error(`Invalid resource definition: ${entry.id || 'missing id'}`)
    }
    defs[entry.id] = entry
  }
  return defs
}

export const RESOURCE_DEFINITIONS = loadDefinitions()

export function getResourceDef(id: string): ResourceDef | undefined {
  return RESOURCE_DEFINITIONS[id]
}

registerDefinitions({ resources: RESOURCE_DEFINITIONS })
