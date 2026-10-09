import type { ResearchDef, ResearchNode as ResearchNodeState } from '../../core/state/types.js'
import { ResearchNode } from './ResearchNode.js'

interface ResearchCategoryProps {
  category: string
  label: string
  icon: string
  nodes: {
    id: string
    def: ResearchDef
    state: ResearchNodeState['state']
    isAvailable: boolean
  }[]
  onStart: (nodeId: string) => void
}

export function ResearchCategory({ category, label, icon, nodes, onStart }: ResearchCategoryProps) {
  return (
    <div class="tech-category" role="group" aria-label={`${label} research`}>
      <div class="category-header">
        <span class="category-icon">{icon}</span>
        <span class="category-label">{label}</span>
      </div>
      <div class="category-nodes">
        {nodes.map(({ id, def, state, isAvailable }) => (
          <ResearchNode
            key={id}
            id={id}
            def={def}
            state={state}
            isAvailable={isAvailable}
            onStart={onStart}
          />
        ))}
      </div>
      <span class="sr-only">{category}</span>
    </div>
  )
}
