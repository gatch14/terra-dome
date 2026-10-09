import { gameState } from '../../core/state/gameState.js'
import { buyItem, useItem, getShopItems, getCurrency } from '../../core/systems/shop.js'
import { ShopItem } from '../components/ShopItem.js'
import { CurrencyDisplay } from '../components/CurrencyDisplay.js'
import { Inventory } from '../components/Inventory.js'
import { showToast } from '../components/Toast.js'

export function ShopScreen() {
  const state = gameState.value
  const items = getShopItems()
  const currency = getCurrency()

  const handleBuy = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!window.confirm(`Buy ${item?.name} for 💎 ${item?.price}?`)) return
    if (buyItem(itemId)) {
      showToast(`Purchased ${item?.name}`, 'success')
    } else {
      showToast('Not enough gems', 'warning')
    }
  }

  const handleUse = (itemId: string) => {
    if (useItem(itemId)) {
      const item = items.find(i => i.id === itemId)
      showToast(`Used ${item?.name}`, 'success')
    } else {
      showToast('Nothing to use', 'warning')
    }
  }

  return (
    <div class="screen shop-screen" id="shop-panel" role="tabpanel">
      <div class="screen-header">
        <h2>Shop</h2>
        <CurrencyDisplay currency={currency} />
      </div>

      <div class="screen-content shop-content">
        <div class="shop-grid">
          {items.map(item => (
            <ShopItem
              key={item.id}
              item={item}
              owned={state.shop.inventory.find(i => i.id === item.id)?.count || 0}
              onBuy={handleBuy}
              onUse={handleUse}
            />
          ))}
        </div>

        <Inventory onUse={handleUse} />
      </div>
    </div>
  )
}
