---
id: T002
title: Implement core game state signals and derived state
wave: 1
deps: ["T001"]
status: done
agent: build_T002
base: 6ea4be19593fc54c55c3c1df848a8d62d927158d
worktree: null
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
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  Lockfile is up to date, resolution step is skipped
  Progress: resolved 1, reused 0, downloaded 0, added 0
  Packages: +110
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Progress: resolved 110, reused 110, downloaded 0, added 110, done
  
  dependencies:
  + @preact/signals 1.3.4
  + idb-keyval 6.3.0
  + preact 10.29.8
  + zod 3.25.76
  
  devDependencies:
  + @types/node 22.20.5
  + jsdom 25.0.1
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 1.2s using pnpm v11.4.0
  ```
