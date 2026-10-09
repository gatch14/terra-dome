import type { ShopDef } from '../state/types.js'
import shopJson from '../../data/shop.json'

/** Shop definitions, loaded from `src/data/shop.json`. */
function loadDefinitions(): Record<string, ShopDef> {
  if (!Array.isArray(shopJson)) {
    throw new Error('shop.json must be an array of shop items')
  }
  const defs: Record<string, ShopDef> = {}
  for (const entry of shopJson as unknown as ShopDef[]) {
    if (!entry.id || !entry.name || typeof entry.price !== 'number' || !entry.effect) {
      throw new Error(`Invalid shop definition: ${entry.id || 'missing id'}`)
    }
    defs[entry.id] = entry
  }
  return defs
}

export const SHOP_DEFINITIONS = loadDefinitions()

export function getShopDef(id: string): ShopDef | undefined {
  return SHOP_DEFINITIONS[id]
}

export function getAllShopItems(): ShopDef[] {
  return Object.values(SHOP_DEFINITIONS)
}
