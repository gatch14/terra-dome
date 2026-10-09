import type { ResearchDef } from '../state/types.js'
import { registerDefinitions } from '../state/gameState.js'
import researchJson from '../../data/research.json'

/** Tech-tree definitions, loaded from `src/data/research.json`. */
function loadDefinitions(): Record<string, ResearchDef> {
  if (!Array.isArray(researchJson)) {
    throw new Error('research.json must be an array of research nodes')
  }
  const defs: Record<string, ResearchDef> = {}
  for (const entry of researchJson as unknown as ResearchDef[]) {
    if (!entry.id || !entry.name || !Array.isArray(entry.prereqs) ||
        typeof entry.time !== 'number' || !entry.effect) {
      throw new Error(`Invalid research definition: ${entry.id || 'missing id'}`)
    }
    defs[entry.id] = entry
  }
  for (const def of Object.values(defs)) {
    for (const prereq of def.prereqs) {
      if (!defs[prereq]) {
        throw new Error(`Research ${def.id} has unknown prerequisite ${prereq}`)
      }
    }
  }
  return defs
}

export const RESEARCH_DEFINITIONS = loadDefinitions()

export function getResearchDef(id: string): ResearchDef | undefined {
  return RESEARCH_DEFINITIONS[id]
}

/** Topological order for display: prerequisites always come first. */
export function getResearchOrder(): string[] {
  const visited = new Set<string>()
  const order: string[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    const def = RESEARCH_DEFINITIONS[id]
    if (def) {
      for (const prereq of def.prereqs) {
        visit(prereq)
      }
    }
    order.push(id)
  }

  for (const id of Object.keys(RESEARCH_DEFINITIONS)) {
    visit(id)
  }

  return order
}

registerDefinitions({ research: RESEARCH_DEFINITIONS })
