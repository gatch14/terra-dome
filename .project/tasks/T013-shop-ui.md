---
id: T013
title: Implement Shop tab UI with currency, items, inventory
wave: 3
deps: ["T005", "T006"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/ui/screens/ShopScreen.tsx
  - src/ui/components/ShopItem.tsx
  - src/ui/components/Inventory.tsx
  - src/ui/components/CurrencyDisplay.tsx
  - src/core/systems/shop.ts
  - src/core/systems/shopDefinitions.ts
  - src/data/shop.json
---

# T013 — Implement Shop tab UI with currency, items, inventory

## Context

Create the Shop tab screen and shop system: premium currency balance, 4 consumable items (1h/8h build speedup, 1h research boost, resource pack), inventory for owned items, purchase flow, item usage on timers.

## Approach

- In shop.ts (core system):
  - buyItem(itemId): validates currency, deducts, adds to inventory
  - useItem(itemId): applies effect (reduces build/research timer, adds resources)
  - getInventory(): returns owned consumables with counts
  - Shop definitions in shop.json: id, name, description, price, effect{ type, value }
- ShopScreen.tsx: main tab, currency display, item grid
- ShopItem.tsx: shows icon, name, price, owned count, "Buy" / "Use" button
- Inventory.tsx: separate panel or section showing owned consumables
- CurrencyDisplay.tsx: animated premium currency counter

## Interface contract

- buyItem()
- useItem()
- getInventory()
- SHOP_DEFINITIONS
- gameState signal
- TimerManager
- TimerManager.registerTimer()
- tick()
- spend()
- earn()
- getRate()
- getStorage()
- getStored()
- RESOURCE_DEFINITIONS
- ShopScreen component
- ShopItem component
- Inventory component
- CurrencyDisplay component

## Intent coverage

- SC5

## Acceptance criteria

1. Shop tab shows premium currency balance (starts 1000)
2. 4 items displayed: 1h Build Speedup (100), 8h Build Speedup (500), 1h Research Boost (150), Resource Pack (200)
3. Click Buy -> confirms -> currency deducted, item added to inventory
4. Click Use on speedup -> applies to oldest building/research timer (reduces by 1h/8h)
5. Resource Pack -> instantly adds resources (capped at storage)
6. Inventory shows owned counts, Use button enabled when applicable
7. Insufficient currency -> Buy disabled, tooltip shows needed amount
8. Reload page -> currency, inventory, active boosts restored

## Verify

```bash
test -f src/ui/screens/ShopScreen.tsx && test -f src/ui/components/ShopItem.tsx && test -f src/ui/components/Inventory.tsx && test -f src/ui/components/CurrencyDisplay.tsx && test -f src/core/systems/shop.ts && test -f src/data/shop.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `src/core/systems/shopDefinitions.ts` (SHOP_DEFINITIONS data loader used by shop.ts was undeclared).