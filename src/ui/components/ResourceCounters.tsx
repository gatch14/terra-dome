import { gameState } from '../../core/state/gameState.js'
import { storageLimits } from '../../core/state/derived.js'
import type { ResourceAmount } from '../../core/state/types.js'

interface ResourceCountersProps {
  rates: ResourceAmount
}

const resourceIcons: Record<keyof ResourceAmount, string> = {
  materials: '⛏️',
  energy: '⚡',
  researchData: '📊'
}

const resourceColors: Record<keyof ResourceAmount, string> = {
  materials: '#FFB800',
  energy: '#00D4FF',
  researchData: '#A855F7'
}

const resourceOrder: (keyof ResourceAmount)[] = ['materials', 'energy', 'researchData']

export function ResourceCounters({ rates }: ResourceCountersProps) {
  const state = gameState.value
  const limits = storageLimits.value

  return (
    <div class="resource-counters" role="status" aria-live="polite">
      {resourceOrder.map(resource => {
        const stored = state.resources[resource]
        const storage = limits[resource]
        const pct = storage > 0 ? Math.min(100, (stored / storage) * 100) : 0

        return (
          <div key={resource} class="resource-counter" style={{ '--color': resourceColors[resource] } as never}>
            <span class="resource-icon">{resourceIcons[resource]}</span>
            <div class="resource-info">
              <span class="resource-amount">{Math.floor(stored)}</span>
              <span class="resource-rate">+{rates[resource].toFixed(1)}/s</span>
            </div>
            <div
              class="resource-bar"
              style={{
                '--progress': `${pct}%`,
                '--color': resourceColors[resource]
              } as never}
            />
          </div>
        )
      })}
    </div>
  )
}
