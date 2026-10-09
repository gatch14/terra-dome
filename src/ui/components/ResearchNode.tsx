import type { ResearchDef } from '../../core/state/types.js'
import { formatTimeShort } from '../utils/format.js'

interface ResearchNodeProps {
  id: string
  def: ResearchDef
  state: 'locked' | 'available' | 'researching' | 'completed'
  isAvailable: boolean
  onStart: (nodeId: string) => void
}

const STATE_COLORS = {
  locked: '#6B7280',
  available: '#22C55E',
  researching: '#3B82F6',
  completed: '#F59E0B'
}

export function ResearchNode({ id, def, state, isAvailable, onStart }: ResearchNodeProps) {
  const color = STATE_COLORS[state]

  const handleClick = () => {
    if (state === 'available') onStart(id)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const effectLabel = describeEffect(def)
  const tooltip = `⛏️ ${def.cost.materials} · ⚡ ${def.cost.energy} · 📊 ${def.cost.researchData} · ⏱️ ${formatTimeShort(def.time)} · ${effectLabel}`

  return (
    <div
      class={`research-node ${state}`}
      style={{ '--node-color': color } as never}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={tooltip}
      tabindex={isAvailable ? 0 : -1}
      role="button"
      aria-label={`${def.name}: ${effectLabel}`}
      aria-pressed={state === 'completed'}
      aria-disabled={state === 'locked' || state === 'researching'}
    >
      <div class="node-icon">{getCategoryIcon(def.category)}</div>
      <div class="node-name">{def.name}</div>
      <div class="node-effect">{effectLabel}</div>
      <div class="node-cost">
        <span>⛏️ {def.cost.materials}</span>
        <span>⚡ {def.cost.energy}</span>
        <span>📊 {def.cost.researchData}</span>
        <span>⏱️ {formatTimeShort(def.time)}</span>
      </div>
      {state === 'researching' && <div class="node-pulse" />}
    </div>
  )
}

export function describeEffect(def: ResearchDef): string {
  const pct = Math.round(def.effect.value * 100)
  switch (def.effect.type) {
    case 'resourceRate':
      return `+${pct}% ${def.effect.target} rate`
    case 'buildSpeed':
      return `+${pct}% build speed`
    case 'researchSpeed':
      return `+${pct}% research speed`
    case 'clanPointsMultiplier':
      return `+${pct}% clan points`
    default:
      return def.effect.type
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'production': return '⚙️'
    case 'research': return '🔬'
    case 'clan': return '🤝'
    default: return '📦'
  }
}
