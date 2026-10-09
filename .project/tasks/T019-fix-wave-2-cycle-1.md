---
id: T019
title: Fix wave 2 cycle 1 review findings in T009
wave: 7
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/systems/clanEvent.test.ts
  - src/core/systems/clanEvent.ts
  - src/core/systems/clanEventDefinitions.ts
  - src/data/clanEvent.json
---

# T019 — Fix wave 2 cycle 1 review findings in T009

## Context

Repair task created from the wave 2 cycle 1 review of T009.
The failed criteria and every reviewer observation are recorded verbatim under Review findings.
The source task contracts are unchanged; read them and .project/intent/INTENT.md before editing.

## Approach

- Fix only what the Review findings name, inside the listed files; do not change the source
  tasks' acceptance criteria or interface contracts.
- Re-run the source tasks' Verify commands after the fix and record the result in the Log.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up

## Verify

```bash
set -e
(
test -f src/core/systems/clanEvent.ts && test -f src/core/systems/clanEventDefinitions.ts && test -f src/data/clanEvent.json
)
```

Heavy: no

## Review findings

### t009_ac9
Criterion: Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up
- Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — found: coverage exists for event start (clanEvent.test.ts:21,:29), point sources (:43,:121), event end (:83,:89), rewards (:107) and offline catch-up (offlineCatchup.test.ts:35-52,:107-122; reviewer re-run, 6 passed), but **AI profiles** are not actually tested: the test titled "tickAI accrues points for every profile" (clanEvent.test.ts:62-71) exercises only the single default profile (`grinder`, from createInitialState gameState.ts:31) and never varies `aiProfile`; repo grep for `rusher|lateBloomer|profile` across `*.test.ts` matches no product test, so the distinct curve math in clanEvent.ts:96-104 (rusher front-loaded taper, lateBloomer back-loaded surge) has zero assertions. fix: parametrize the AI test over rusher/grinder/lateBloomer in src/core/systems/clanEvent.test.ts, asserting early-event accrual order (rusher > grinder > lateBloomer) and that lateBloomer's late-event accrual exceeds its early accrual while rusher's tapers (the reviewer's temp test in this sidecar shows the exact assertions), retitle the existing misleading test, then re-run `pnpm exec vitest run src/core/systems/clanEvent.test.ts`.

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 2 cycle 1
