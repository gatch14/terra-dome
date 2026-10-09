import type { ResearchDef, ResearchNode as ResearchNodeState } from '../../core/state/types.js'
import { ResearchCategory } from './ResearchCategory.js'

interface TechTreeProps {
  definitions: Record<string, ResearchDef>
  nodeStates: Record<string, ResearchNodeState>
  available: string[]
  onStart: (nodeId: string) => void
}

const CATEGORY_ORDER = ['production', 'research', 'clan'] as const
const CATEGORY_LABELS = { production: 'Production', research: 'Research', clan: 'Clan' }
const CATEGORY_ICONS = { production: '⚙️', research: '🔬', clan: '🤝' }

export function TechTree({ definitions, nodeStates, available, onStart }: TechTreeProps) {
  return (
    <div class="tech-tree" role="tree" aria-label="Research tree">
      {CATEGORY_ORDER.map(category => {
        const nodes = Object.entries(definitions)
          .filter(([, def]) => def.category === category)
          .map(([id, def]) => ({
            id,
            def,
            state: nodeStates[id]?.state ?? 'locked' as ResearchNodeState['state'],
            isAvailable: available.includes(id)
          }))

        if (nodes.length === 0) return null

        return (
          <ResearchCategory
            key={category}
            category={category}
            label={CATEGORY_LABELS[category]}
            icon={CATEGORY_ICONS[category]}
            nodes={nodes}
            onStart={onStart}
          />
        )
      })}
    </div>
  )
}
