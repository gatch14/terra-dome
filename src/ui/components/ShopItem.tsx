import type { ShopDef } from '../../core/state/types.js'
import { getCurrency } from '../../core/systems/shop.js'
import { buildingQueue, researchQueue } from '../../core/state/derived.js'

interface ShopItemProps {
  item: ShopDef
  owned: number
  onBuy: (itemId: string) => void
  onUse: (itemId: string) => void
}

export function ShopItem({ item, owned, onBuy, onUse }: ShopItemProps) {
  const currency = getCurrency()
  const canAfford = currency >= item.price
  const hasOwned = owned > 0

  // AC6: the Use button is enabled only when the item can actually apply.
  const applicable =
    item.effect.type === 'buildSpeedup' ? buildingQueue.value.length > 0 :
    item.effect.type === 'researchSpeedup' ? researchQueue.value.length > 0 :
    true

  const effectIcons: Record<string, string> = {
    buildSpeedup: '⏱️',
    researchSpeedup: '🔬',
    resourcePack: '📦',
    clanPointBoost: '⭐'
  }

  return (
    <div class={`shop-item ${!canAfford ? 'unaffordable' : ''}`}>
      <div class="item-header">
        <span class="item-icon">{effectIcons[item.effect.type]}</span>
        <span class="item-name">{item.name}</span>
      </div>
      <p class="item-description">{item.description}</p>
      <div class="item-price">💎 {item.price}</div>
      <div class="item-owned">Owned: {owned}</div>
      <div class="item-actions">
        <button
          class="btn-buy"
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          title={!canAfford ? `Need 💎 ${item.price - currency} more` : `Buy for 💎 ${item.price}`}
        >
          Buy
        </button>
        {hasOwned && (
          <button
            class="btn-use"
            onClick={() => onUse(item.id)}
            disabled={!applicable}
            title={applicable ? 'Use item' : 'No active timer to speed up'}
          >
            Use
          </button>
        )}
      </div>
    </div>
  )
}
