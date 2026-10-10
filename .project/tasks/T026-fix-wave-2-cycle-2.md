---
id: T026
title: Fix wave 2 cycle 2 review findings in T006
wave: 12
deps: [T006]
status: done
agent: gsd-coder
base: 20366c96f38e0a8d8d226adbc5a0b3767e528c37
worktree: null
task_branch: null
files:
  - src/core/systems/buildingDefinitions.ts
  - src/core/systems/buildings.test.ts
  - src/core/systems/buildings.ts
  - src/data/buildings.json
---

# T026 — Fix wave 2 cycle 2 review findings in T006

## Context

Repair task created from the wave 2 cycle 2 review of T006.
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

1. Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits

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

### t006_ac8
Criterion: Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits
- Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 9 tests, full suite 49/49, exit 0): queue (:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99) are covered, but no test asserts cost scaling or time scaling — `calculateCost` appears once, at level 0 (buildings.test.ts:28), and `calculateBuildTime` appears in no test file (repo-wide grep across `*.test.ts`); `git log -- src/core/systems/buildings.test.ts` shows the file last changed at T006's landing 127482d, so fix task T017's landing 8cb302c (brief-only, `git show --numstat` touches only its brief) added nothing. The earlier revision of this file claiming "test added, passes" was false and is retracted in this honest rewrite. fix: add tests asserting `calculateCost(level, def)` and `calculateBuildTime(level, def)` grow as `floor(base × multiplier^level)` across two levels, then re-run `pnpm vitest run src/core/systems/buildings.test.ts`.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 2 cycle 2
- 2026-10-10 — plan defect repair (wave 2 gate): Verify strengthened from file-existence (`test -f buildings.ts && test -f buildingDefinitions.ts && test -f buildings.json`) to `pnpm tsc --noEmit && pnpm vitest run` (the AC claims behavioral coverage of existing test files; a `test -f` check cannot run them).
- 2026-10-10 — orchestrator Verify (sidecar gsd-path-verify/task-t026-verify): pass, exit 0; output tail:
  ```
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 954ms using pnpm v11.4.0
  
  [1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90mC:/Users/gatch/.gsd-path/projects/6766097597d76e29/1d504e52cfc1b1c5/verify/task-t026-verify[39m
  
   [32m✓[39m src/core/time/timerManager.test.ts [2m([22m[2m5 tests[22m[2m)[22m[90m 6[2mms[22m[39m
   [32m✓[39m src/core/systems/clanEvent.test.ts [2m([22m[2m10 tests[22m[2m)[22m[90m 7[2mms[22m[39m
   [32m✓[39m src/core/systems/resources.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 6[2mms[22m[39m
   [32m✓[39m src/core/systems/buildings.test.ts [2m([22m[2m11 tests[22m[2m)[22m[90m 6[2mms[22m[39m
   [32m✓[39m src/core/systems/research.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 7[2mms[22m[39m
   [32m✓[39m src/core/time/offlineCatchup.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 5[2mms[22m[39m
  
  [2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
  [2m      Tests [22m [1m[32m51 passed[39m[22m[90m (51)[39m
  [2m   Start at [22m 12:57:49
  [2m   Duration [22m 1.19s[2m (transform 331ms, setup 0ms, collect 708ms, tests 37ms, environment 3.72s, prepare 865ms)[22m
  ```
