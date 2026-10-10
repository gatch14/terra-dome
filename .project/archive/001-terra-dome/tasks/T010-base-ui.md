---
id: T010
title: Implement Base tab UI with building grid, resource counters, build queue
wave: 3
deps: ["T006", "T007"]
status: done
agent: task-t010
base: f05ddef84c4c310fea9d8c3da437b2a561a68a9c
worktree: null
task_branch: null
files:
  - src/ui/screens/BaseScreen.tsx
  - src/ui/components/BuildingGrid.tsx
  - src/ui/components/ResourceCounters.tsx
  - src/ui/components/BuildQueue.tsx
  - src/ui/components/BuildingSlot.tsx
  - src/ui/utils/format.ts
---

# T010 — Implement Base tab UI with building grid, resource counters, build queue

## Context

Create the Base tab screen: building grid (Command Center fixed, 4 resource slots, 1 lab slot), animated resource counters, build queue with countdown timers. Click empty slot → building picker → queue. Click queued item → cancel. Uses Preact Signals for reactive updates.

## Approach

- BaseScreen.tsx: main tab component, subscribes to gameState, resourceRates, buildingQueue
- BuildingGrid.tsx: renders 6 slots, shows building level or "Empty + Add" button
- ResourceCounters.tsx: 3 counters (Materials, Energy, Research Data) with animated numbers, rate display (+X/s)
- BuildQueue.tsx: list of queued items with progress bar, remaining time, cancel button
- BuildingSlot.tsx: individual slot, click → modal with available buildings (filtered by slot type)
- Styling: CSS modules or inline styles, responsive, keyboard navigable

## Interface contract

- gameState signal
- resourceRates derived signal
- buildingQueue derived signal
- queueBuilding()
- cancelBuilding()
- getBuildingLevel()
- useItem()
- tick()
- spend()
- earn()
- getRate()
- getStorage()
- getStored()
- RESOURCE_DEFINITIONS
- buyItem()
- getInventory()
- SHOP_DEFINITIONS
- BaseScreen component
- BuildingGrid component
- ResourceCounters component
- BuildQueue component
- BuildingSlot component

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot
2. Resource counters display current amounts, animate on change, show +X/s rates
3. Click empty resource slot → modal shows Resource Production, Storage → select → queues
4. Build queue shows item with progress bar, countdown timer (MM:SS)
5. Timer reaches 0 → building appears on grid, level increases, rate updates
6. Click queued item → cancel button → refunds resources, removes from queue
7. Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal
8. Reload page → all state restored (buildings, queue, resources)

## Verify

```bash
test -f src/ui/screens/BaseScreen.tsx && test -f src/ui/components/BuildingGrid.tsx && test -f src/ui/components/ResourceCounters.tsx && test -f src/ui/components/BuildQueue.tsx && test -f src/ui/components/BuildingSlot.tsx
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `src/ui/utils/format.ts` (shared number/label formatting util used by counters and queue timers was undeclared).
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t010-verify): pass, exit 0
