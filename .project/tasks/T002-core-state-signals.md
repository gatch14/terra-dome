---
id: T002
title: Implement core game state signals and derived state
wave: 1
deps: ["T001"]
status: in-progress
agent: build_T002
base: b1edce5eec157881c405e31effc39a5768d8bfad
worktree: C:\dev\gsd\terra-dome
task_branch: null
files:
  - src/core/state/derived.ts
---

# T002 — Implement core game state signals and derived state

## Context

Extend the gameState signal with complete typed structure. Create derived signals for computed values: resourceRates (from buildings + research), totalClanPoints, availableResearch, buildingQueue, researchQueue. Define all TypeScript interfaces in types.ts. This provides the reactive foundation for all game systems.

## Approach

- Define interfaces: GameState, Building, ResearchNode, ClanEvent, ShopItem, ResourceAmount
- In gameState.ts: initialize with defaults (Command Center Lv.1, 500 materials / 300 energy / 0 research data, empty queues, clan event starts in 7 days, 1000 currency)
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
pnpm tsc --noEmit && test -f src/core/state/derived.ts
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — same-wave overlap forbids sharing `gameState.ts`/`types.ts` with T001, so both are owned and landed by T001; this task lands `derived.ts` only and its Verify names that path. Approach text repaired: initial resources "0" contradicted the approved Base-tab walkthrough (first build queueable immediately, cost 200/100); settled starting state is 500 materials / 300 energy / 0 research data.