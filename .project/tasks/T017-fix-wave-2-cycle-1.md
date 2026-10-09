---
id: T017
title: Fix wave 2 cycle 1 review findings in T006
wave: 7
deps: [T006]
status: done
agent: task-t017
base: 2ad06e017c0c6a8e718de39bca11256f11ff1514
worktree: null
task_branch: null
files:
  - src/core/systems/buildings.test.ts
---

# T017 — Fix wave 2 cycle 1 review findings in T006

## Context

Repair task created from the wave 2 cycle 1 review of T006.
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
pnpm vitest run src/core/systems/buildings.test.ts
)
```

Heavy: no

## Review findings

### t006_ac8
Criterion: Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits
- Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — found: reviewer re-run `pnpm exec vitest run src/core/systems/buildings.test.ts` → 9 passed, but the file covers queue (buildings.test.ts:21), complete (:38), cancel (:52) and slot/type limits (:68, :82, :87, :99, :112) only — no test asserts cost scaling or time scaling: `calculateCost` appears once, at level 0 (buildings.test.ts:28), and `calculateBuildTime` appears in no test at all (repo grep for `calculateBuildTime|costMultiplier|timeMultiplier` across `*.test.ts` matches no product test); the scaling math exists only in production code (buildingDefinitions.ts:51-62). fix: add unit tests to src/core/systems/buildings.test.ts asserting `calculateCost(level, def)` grows as `floor(baseCost × costMultiplier^level)` across at least two levels and `calculateBuildTime(level, def) = floor(baseBuildTime × timeMultiplier^level)` across two levels (e.g. resource_production at level 0 vs 1), then re-run `pnpm exec vitest run src/core/systems/buildings.test.ts`.

## Log

- 2026-10-09 - created by dispatch_driver.py fix-tasks from wave 2 cycle 1
- 2026-10-09 - plan defect repair (wave 2 gate): files narrowed to the finding's single named file (buildings.test.ts) and Verify strengthened to the AC's unit-test run; buildingDefinitions.ts write scope granted to T018 per the t008_ac6 finding note.
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t017-verify): pass, exit 0; output tail:
  ```
  + zod 3.25.76
  
  devDependencies:
  + @types/node 22.20.5
  + jsdom 25.0.1
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 826ms using pnpm v11.4.0
  
  [1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90mC:/Users/gatch/.gsd-path/projects/6766097597d76e29/1d504e52cfc1b1c5/verify/task-t017-verify[39m
  
   [32m✓[39m src/core/systems/buildings.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 5[2mms[22m[39m
  
  [2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
  [2m      Tests [22m [1m[32m9 passed[39m[22m[90m (9)[39m
  [2m   Start at [22m 19:55:55
  [2m   Duration [22m 883ms[2m (transform 80ms, setup 0ms, collect 125ms, tests 5ms, environment 427ms, prepare 118ms)[22m
  ```
