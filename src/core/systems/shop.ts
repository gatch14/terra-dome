import type { ShopDef } from '../state/types.js'
import { SHOP_DEFINITIONS, getShopDef } from './shopDefinitions.js'
import { timerManager } from '../time/timerManager.js'
import { gameState, touch } from '../state/gameState.js'
import { earn } from './resources.js'
import { completeBuilding } from './buildings.js'
import { completeResearch } from './research.js'

export function buyItem(itemId: string): boolean {
  const state = gameState.value
  const def = getShopDef(itemId)
  if (!def) return false
  
  if (state.shop.currency < def.price) return false
  
  state.shop.currency -= def.price
  
  const existing = state.shop.inventory.find(item => item.id === itemId)
  if (existing) {
    existing.count += 1
  } else {
    state.shop.inventory.push({ id: itemId, count: 1 })
  }
  touch()

  return true
}

export function useItem(itemId: string): boolean {
  const state = gameState.value
  const inventoryItem = state.shop.inventory.find(item => item.id === itemId)
  if (!inventoryItem || inventoryItem.count <= 0) return false

  const def = getShopDef(itemId)
  if (!def) return false

  // Speedups with no active timer target are not applicable — refuse instead
  // of consuming the item for nothing (AC6: "Use enabled when applicable").
  if (!applyItemEffect(def)) return false

  inventoryItem.count -= 1
  if (inventoryItem.count <= 0) {
    state.shop.inventory = state.shop.inventory.filter(item => item.id !== itemId)
  }
  touch()

  return true
}

function applyItemEffect(def: ShopDef): boolean {
  const state = gameState.value

  switch (def.effect.type) {
    case 'buildSpeedup': {
      const buildingQueue = state.buildingQueue
      if (buildingQueue.length > 0) {
        const oldestId = buildingQueue[0]
        const building = state.buildings[oldestId]
        if (building && building.endTime) {
          building.endTime = Math.max(Date.now(), building.endTime - def.effect.value * 1000)
          timerManager.unregisterTimer(`build-${oldestId}`)
          if (building.endTime > Date.now()) {
            timerManager.registerTimer(`build-${oldestId}`, building.endTime, () => completeBuilding(oldestId))
          } else {
            completeBuilding(oldestId)
          }
          return true
        }
      }
      return false
    }
    case 'researchSpeedup': {
      const researchQueue = state.researchQueue
      if (researchQueue.length > 0) {
        const oldestId = researchQueue[0]
        const research = state.research[oldestId]
        if (research && research.endTime) {
          research.endTime = Math.max(Date.now(), research.endTime - def.effect.value * 1000)
          timerManager.unregisterTimer(`research-${oldestId}`)
          if (research.endTime > Date.now()) {
            timerManager.registerTimer(`research-${oldestId}`, research.endTime, () => completeResearch(oldestId))
          } else {
            completeResearch(oldestId)
          }
          return true
        }
      }
      return false
    }
    case 'resourcePack': {
      earn({ materials: 500, energy: 300, researchData: 100 })
      return true
    }
    default:
      return true
  }
}

export function getInventory(): { id: string; count: number }[] {
  return gameState.value.shop.inventory
}

export function getCurrency(): number {
  return gameState.value.shop.currency
}

export function getShopItems(): ShopDef[] {
  return Object.values(SHOP_DEFINITIONS)
}