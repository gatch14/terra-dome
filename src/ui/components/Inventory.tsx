import { gameState } from '../../core/state/gameState.js'
import { getShopDef } from '../../core/systems/shopDefinitions.js'
import { buildingQueue, researchQueue } from '../../core/state/derived.js'

interface InventoryProps {
  onUse: (itemId: string) => void
}

/** Owned consumables panel (the Shop tab's inventory section). */
export function Inventory({ onUse }: InventoryProps) {
  const inventory = gameState.value.shop.inventory

  const isApplicable = (effectType: string): boolean => {
    if (effectType === 'buildSpeedup') return buildingQueue.value.length > 0
    if (effectType === 'researchSpeedup') return researchQueue.value.length > 0
    return true
  }

  return (
    <div class="inventory-section">
      <h3>Inventory</h3>
      {inventory.length === 0 ? (
        <p class="empty-inventory">No items owned</p>
      ) : (
        <ul class="inventory-list">
          {inventory.map(inv => {
            const item = getShopDef(inv.id)
            const applicable = item ? isApplicable(item.effect.type) : false
            return (
              <li key={inv.id} class="inventory-item">
                <span class="inv-name">{item?.name || inv.id}</span>
                <span class="inv-count">×{inv.count}</span>
                <button
                  class="btn-use"
                  onClick={() => onUse(inv.id)}
                  disabled={!applicable}
                  title={applicable ? 'Use item' : 'No active timer to speed up'}
                >
                  Use
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
