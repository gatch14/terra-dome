---
id: T026
title: Fix wave 2 cycle 2 review findings in T006
wave: 12
deps: [T006]
status: pending
agent: null
base: null
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
test -f src/core/systems/buildings.ts && test -f src/core/systems/buildingDefinitions.ts && test -f src/data/buildings.json
)
```

Heavy: no

## Review findings

### t006_ac8
Criterion: Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits
- Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 9 tests, full suite 49/49, exit 0): queue (:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99) are covered, but no test asserts cost scaling or time scaling — `calculateCost` appears once, at level 0 (buildings.test.ts:28), and `calculateBuildTime` appears in no test file (repo-wide grep across `*.test.ts`); `git log -- src/core/systems/buildings.test.ts` shows the file last changed at T006's landing 127482d, so fix task T017's landing 8cb302c (brief-only, `git show --numstat` touches only its brief) added nothing. The earlier revision of this file claiming "test added, passes" was false and is retracted in this honest rewrite. fix: add tests asserting `calculateCost(level, def)` and `calculateBuildTime(level, def)` grow as `floor(base × multiplier^level)` across two levels, then re-run `pnpm vitest run src/core/systems/buildings.test.ts`.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 2 cycle 2
