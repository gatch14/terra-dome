---
id: T006
title: Implement building system with queue and data-driven definitions
wave: 2
deps: ["T003", "T005"]
status: done
agent: build_T006
base: 50cd93e18bf6e56442b0ca0527042996a869c35c
worktree: null
task_branch: null
files:
  - src/core/systems/buildings.ts
  - src/core/systems/buildings.test.ts
  - src/core/systems/buildingDefinitions.ts
  - src/data/buildings.json
---

# T006 — Implement building system with queue and data-driven definitions

## Context

Create the building system: data-driven building definitions (JSON), build queue management, building placement on grid, level progression. Buildings have: id, name, category, maxLevel, baseCost, costMultiplier, baseBuildTime, timeMultiplier, production (per level). Queue processes one at a time (free slot), premium slot for speedups (T013).

## Approach

- In buildingDefinitions.ts: load buildings.json, export `BUILDING_DEFINITIONS` map, `getBuildingDef(id)`, `calculateCost(level)`, `calculateBuildTime(level)`, `calculateProduction(level)`
- In buildings.ts:
  - `queueBuilding(buildingId: string)`: validates can afford, deducts resources, adds to queue with endTime = now + buildTime
  - `completeBuilding(queueItem)`: increments building level, updates resource rates via derived signal
  - `cancelBuilding(queueItem)`: refunds resources, removes from queue
  - `getBuildingLevel(id)`: returns current level
  - `canAfford(cost)`: checks resources
- Building grid: 1 Command Center (fixed), 4 resource slots, 1 research lab slot
- Register build timers with TimerManager (T003)

## Interface contract

- queueBuilding()
- cancelBuilding()
- completeBuilding()
- getBuildingLevel()
- canAfford()
- BUILDING_DEFINITIONS
- TimerManager
- TimerManager.registerTimer()
- TimerManager.unregisterTimer()
- TimerManager.start()
- TimerManager.pause()
- resourceRates derived signal
- tick()
- spend()
- earn()
- getRate()
- getStorage()
- getStored()
- RESOURCE_DEFINITIONS

## Intent coverage

- None

## Acceptance criteria

1. buildings.json defines 5+ buildings with costs, times, production per level
2. queueBuilding deducts resources, adds to queue with correct endTime
3. TimerManager processes build queue, completes building on timer expiry
4. Complete building increases level, updates production rates
5. Cancel building refunds 100% resources, removes from queue
6. Building grid enforces slot limits (1 CC, 4 resource, 1 lab)
7. Cannot queue if cannot afford or no free slot
8. Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits

## Verify

```bash
test -f src/core/systems/buildings.ts && test -f src/core/systems/buildingDefinitions.ts && test -f src/data/buildings.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `src/core/systems/buildings.test.ts` (task's unit tests were undeclared).
- 2026-10-09 - orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): pass, exit 0
- 2026-10-09 - plan defect repair (wave 2 gate): duplicated AC numbering (two `5.`) renumbered contiguously 1-8; criterion text unchanged.
