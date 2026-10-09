---
id: T007
title: Implement resource system with production rates and storage caps
wave: 2
deps: ["T005"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/systems/resources.ts
  - src/core/systems/resourceDefinitions.ts
  - src/data/resources.json
---

# T007 — Implement resource system with production rates and storage caps

## Context

Create the resource system: 3 resources (Materials, Energy, Research Data) with per-second production rates derived from building levels + research bonuses. Storage caps per resource (upgradeable via buildings). Resource tick updates counters every second. Resource spending/earning for builds, research, shop.

## Approach

- In resourceDefinitions.ts: load resources.json, export RESOURCE_DEFINITIONS with baseStorage, baseRate
- In resources.ts:
  - `tick(deltaSec: number)`: adds rate × deltaSec to each resource, clamps at storage
  - `spend(cost: ResourceCost): boolean` checks affordability, deducts if possible
  - `earn(amount: ResourceAmount)`: adds resources, clamps at storage
  - `getRate(resourceId)`: returns current per-second rate
  - `getStorage(resourceId)`: returns current storage cap
  - `getStored(resourceId)`: returns current amount
- Called by TimerManager tick (T003) for per-second updates
- Derived signal `resourceRates` (T002) computes rates from buildings + research

## Interface contract

- tick()
- spend()
- earn()
- getRate()
- getStorage()
- getStored()
- RESOURCE_DEFINITIONS
- resourceRates derived signal
- gameState signal
- TimerManager.tick()
- queueBuilding()
- cancelBuilding()
- completeBuilding()
- getBuildingLevel()
- canAfford()
- BUILDING_DEFINITIONS

## Intent coverage

- None

## Acceptance criteria

1. resources.json defines 3 resources with baseStorage, baseRate
2. tick(1) increases each resource by rate, clamped at storage
3. spend() returns false if insufficient, true and deducts if sufficient
4. earn() adds resources, clamps at storage
5. Production rates update when buildings level up or research completes
5. Storage caps increase when storage buildings upgrade
6. Unit tests for: tick, spend, earn, rate calculation, storage limits

## Verify

```bash
test -f src/core/systems/resources.ts && test -f src/core/systems/resourceDefinitions.ts && test -f src/data/resources.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner