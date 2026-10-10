---
id: T028
title: Fix wave 2 cycle 2 review findings in T009
wave: 12
deps: [T009]
status: done
agent: gsd-coder
base: bff4852d5f348e56fbcf267a9b0b1ff991a2c96e
worktree: null
task_branch: null
files:
  - src/core/systems/clanEvent.test.ts
  - src/core/systems/clanEvent.ts
  - src/core/systems/clanEventDefinitions.ts
  - src/data/clanEvent.json
---

# T028 — Fix wave 2 cycle 2 review findings in T009

## Context

Repair task created from the wave 2 cycle 2 review of T009.
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
pnpm tsc --noEmit
pnpm vitest run
)
```

Heavy: no

## Review findings

### t009_ac9
Criterion: Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up
- Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (clanEvent 10 tests, full suite 49/49, exit 0): coverage exists for event start (:21,:29), point sources (:43,:121), event end (:83,:89), rewards (:107) and offline catch-up (offlineCatchup.test.ts:107-122), but AI profiles are still not exercised: the test at clanEvent.test.ts:62-71 ("tickAI accrues points for every profile (fractional accumulation)") runs only the default profile that createInitialState sets (grinder) and never varies `aiProfile`; repo grep for `rusher|lateBloomer|aiProfile` across `*.test.ts` matches only offlineCatchup.test.ts:49 (the same default profile), so the distinct curve math in clanEvent.ts:96-104 has zero assertions; `git log -- src/core/systems/clanEvent.test.ts` shows the file last changed at T009's landing b77da43, so fix task T019's landing 65df5cd (brief-only) added nothing. fix: parametrize the AI tests over rusher/grinder/lateBloomer asserting early-event accrual order (rusher > grinder > lateBloomer) and that lateBloomer's late accrual exceeds its early accrual while rusher's tapers, then re-run `pnpm vitest run src/core/systems/clanEvent.test.ts`.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 2 cycle 2
- 2026-10-10 — plan defect repair (wave 2 gate): Verify strengthened from file-existence (`test -f clanEvent.ts && test -f clanEventDefinitions.ts && test -f clanEvent.json`) to `pnpm tsc --noEmit && pnpm vitest run` (the AC claims behavioral test coverage; a `test -f` check cannot run the tests).
- 2026-10-10 — orchestrator Verify (sidecar gsd-path-verify/task-t028-verify): pass, exit 0; output tail:
  ```
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 908ms using pnpm v11.4.0
  
  [1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90mC:/Users/gatch/.gsd-path/projects/6766097597d76e29/1d504e52cfc1b1c5/verify/task-t028-verify[39m
  
   [32m✓[39m src/core/time/timerManager.test.ts [2m([22m[2m5 tests[22m[2m)[22m[90m 6[2mms[22m[39m
   [32m✓[39m src/core/systems/clanEvent.test.ts [2m([22m[2m11 tests[22m[2m)[22m[90m 10[2mms[22m[39m
   [32m✓[39m src/core/systems/buildings.test.ts [2m([22m[2m11 tests[22m[2m)[22m[90m 8[2mms[22m[39m
   [32m✓[39m src/core/systems/resources.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 6[2mms[22m[39m
   [32m✓[39m src/core/systems/research.test.ts [2m([22m[2m12 tests[22m[2m)[22m[90m 8[2mms[22m[39m
   [32m✓[39m src/core/time/offlineCatchup.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 5[2mms[22m[39m
  
  [2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
  [2m      Tests [22m [1m[32m56 passed[39m[22m[90m (56)[39m
  [2m   Start at [22m 13:02:09
  [2m   Duration [22m 1.15s[2m (transform 356ms, setup 0ms, collect 729ms, tests 42ms, environment 3.47s, prepare 818ms)[22m
  ```
