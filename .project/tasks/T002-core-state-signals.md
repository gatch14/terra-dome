---
id: T002
title: Implement core game state signals and derived state
wave: 1
deps: ["T001"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/state/derived.ts
  - src/core/state/types.ts
---

# T002 — Implement core game state signals and derived state

## Context

Extend the gameState signal with complete typed structure. Create derived signals for computed values: resourceRates (from buildings + research), totalClanPoints, availableResearch, buildingQueue, researchQueue. Define all TypeScript interfaces in types.ts. This provides the reactive foundation for all game systems.

## Approach

- Define interfaces: GameState, Building, ResearchNode, ClanEvent, ShopItem, ResourceAmount
- In gameState.ts: initialize with defaults (Command Center Lv.1, 0 resources, empty queues, clan event starts in 7 days, 1000 currency)
- In derived.ts: create computed signals using `computed()` from @preact/signals
  - resourceRates: calculates per-second rates from building levels + research bonuses
  - buildingQueue: filters buildings with remaining > 0
  - researchQueue: filters research with remaining > 0
  - availableResearch: nodes where prereqs met and not started
- Export all signals and derived for UI consumption

## Interface contract

- gameState signal
- resourceRates derived signal
- buildingQueue derived signal
- researchQueue derived signal
- availableResearch derived signal

## Intent coverage

- None

## Acceptance criteria

1. `gameState.value` has all required fields with correct initial values
2. `resourceRates.value` updates when buildings or research change
3. `buildingQueue.value` reflects queued buildings with remaining time
4. `researchQueue.value` reflects queued research with remaining time
5. `availableResearch.value` shows only nodes with met prerequisites
6. TypeScript compiles without errors (`pnpm tsc --noEmit`)

## Verify

```bash
pnpm tsc --noEmit && test -f src/core/state/derived.ts && test -f src/core/state/types.ts
```

Heavy: no

## Log

- 2026-10-09 — created by planner