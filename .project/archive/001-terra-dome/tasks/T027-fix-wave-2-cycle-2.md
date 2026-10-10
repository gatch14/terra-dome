---
id: T027
title: Fix wave 2 cycle 2 review findings in T008
wave: 12
deps: [T008]
status: done
agent: gsd-coder
base: c699c4897b6df2d0c8a970540456220ace9f6697
worktree: null
task_branch: null
files:
  - src/core/systems/research.test.ts
  - src/core/systems/research.ts
  - src/core/systems/researchDefinitions.ts
  - src/data/research.json
  - src/core/state/derived.ts
  - src/core/systems/buildingDefinitions.ts
  - src/core/systems/clanEvent.ts
---

# T027 — Fix wave 2 cycle 2 review findings in T008

## Context

Repair task created from the wave 2 cycle 2 review of T008.
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

1. Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier

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

### t008_ac6
Criterion: Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier
- Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — reviewer re-run this cycle: only the `resourceRate` effect has a consumer — derived.ts:26-34 is the sole handler (`effect.type === 'resourceRate'`); repo grep for `buildSpeed|researchSpeed|clanPointsMultiplier` outside src/data and the types.ts:124 union matches only ResearchNode.tsx:68-72 (display labels); research.json defines rapid_construction (buildSpeed 0.2), quantum_computing (researchSpeed 0.25) and clan_coordination + diplomatic_relations (clanPointsMultiplier 0.15/0.1) whose completion changes nothing observable; `applyResearchEffect` remains an empty stub (research.ts:94-97, called at :83); `git log -- src/core/systems/research.ts src/core/state/derived.ts` shows both last changed at T008's landing 24d83c7, so fix task T018's landing 23ebbf0 (brief-only) added nothing. The earlier revision of this file claiming "derived multipliers implemented and consumed" was false and is retracted in this honest rewrite. fix: expose completed-research effects as derived multipliers (buildSpeedMultiplier, researchSpeedMultiplier, clanPointsMultiplier), consume them in calculateBuildTime, the research endTime path and player point awards, and add unit tests per effect type.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 2 cycle 2
- 2026-10-10 — plan defect repair (wave 2 gate): files extended with src/core/state/derived.ts, src/core/systems/buildingDefinitions.ts and src/core/systems/clanEvent.ts — the batch inherited only T008's files, but the finding's fix line names derived multipliers (derived.ts), calculateBuildTime consumption (buildingDefinitions.ts) and player point awards (clanEvent.ts); PLAN wave 12 Files column updated to match.
- 2026-10-10 — plan defect repair (wave 2 gate): Verify strengthened from file-existence (`test -f research.ts && test -f researchDefinitions.ts && test -f research.json`) to `pnpm tsc --noEmit && pnpm vitest run` (the AC claims observable bonus behavior; a `test -f` check cannot validate it).
- 2026-10-10 — orchestrator Verify (sidecar gsd-path-verify/task-t027-verify): pass, exit 0; output tail:
  ```
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 960ms using pnpm v11.4.0
  
  [1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90mC:/Users/gatch/.gsd-path/projects/6766097597d76e29/1d504e52cfc1b1c5/verify/task-t027-verify[39m
  
   [32m✓[39m src/core/time/timerManager.test.ts [2m([22m[2m5 tests[22m[2m)[22m[90m 7[2mms[22m[39m
   [32m✓[39m src/core/systems/clanEvent.test.ts [2m([22m[2m10 tests[22m[2m)[22m[90m 11[2mms[22m[39m
   [32m✓[39m src/core/systems/buildings.test.ts [2m([22m[2m11 tests[22m[2m)[22m[90m 5[2mms[22m[39m
   [32m✓[39m src/core/systems/resources.test.ts [2m([22m[2m9 tests[22m[2m)[22m[90m 4[2mms[22m[39m
   [32m✓[39m src/core/time/offlineCatchup.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 5[2mms[22m[39m
   [32m✓[39m src/core/systems/research.test.ts [2m([22m[2m12 tests[22m[2m)[22m[90m 7[2mms[22m[39m
  
  [2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
  [2m      Tests [22m [1m[32m55 passed[39m[22m[90m (55)[39m
  [2m   Start at [22m 13:00:39
  [2m   Duration [22m 1.18s[2m (transform 297ms, setup 0ms, collect 696ms, tests 39ms, environment 3.52s, prepare 902ms)[22m
  ```
