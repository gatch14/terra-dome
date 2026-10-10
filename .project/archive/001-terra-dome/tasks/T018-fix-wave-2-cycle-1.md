---
id: T018
title: Fix wave 2 cycle 1 review findings in T008
wave: 7
deps: [T008]
status: done
agent: task-t018
base: cf7a5a530709580ea58bf830c6671d66705df07f
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

# T018 — Fix wave 2 cycle 1 review findings in T008

## Context

Repair task created from the wave 2 cycle 1 review of T008.
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
pnpm vitest run src/core/systems/research.test.ts
)
```

Heavy: no

## Review findings

### t008_ac6
Criterion: Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier
- Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — found: only `resourceRate` bonuses are applied — src/core/state/derived.ts:29-30 is the sole consumer (`effect.type === 'resourceRate'`). Repo grep for `buildSpeed|researchSpeed|clanPointsMultiplier` matches only src/data/research.json:36,45,54,63 and the type union src/core/state/types.ts:124 — no code consumes those effect types: `applyResearchEffect` is an empty stub (research.ts:94-97, comment claims effects flow through derived signals), `calculateBuildTime` ignores research (buildingDefinitions.ts:60-62), and clan-point awards are flat `pointValues` with no multiplier (clanEvent.ts:53, buildings.ts:50, research.ts:40). Researching rapid_construction / quantum_computing / clan_coordination changes nothing observable. fix: expose completed-research effects as derived multipliers (e.g. `buildSpeedMultiplier`, `researchSpeedMultiplier`, `clanPointsMultiplier` computeds in src/core/state/derived.ts over `state.research`), consume them where build/research time is computed (buildingDefinitions.ts:60-62 and the research endTime path research.ts:33) and in `addPlayerPoints`/point-value awards (clanEvent.ts:49-56), remove or implement the applyResearchEffect stub, and add unit tests per effect type; note the repair task needs granted write scope for src/core/systems/buildingDefinitions.ts (T006's file) and src/core/systems/clanEvent.ts (T009's file) beyond T008's declared files.

## Log

- 2026-10-09 - created by dispatch_driver.py fix-tasks from wave 2 cycle 1
- 2026-10-09 - plan defect repair (wave 2 gate): write scope granted for src/core/state/derived.ts, src/core/systems/buildingDefinitions.ts, and src/core/systems/clanEvent.ts per the t008_ac6 finding's granted-scope note; Verify strengthened to `pnpm tsc --noEmit` plus the research.test.ts run.
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t018-verify): pass, exit 0; output tail:
  ```
  + zod 3.25.76
  
  devDependencies:
  + @types/node 22.20.5
  + jsdom 25.0.1
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 803ms using pnpm v11.4.0
  
  [1m[7m[36m RUN [39m[27m[22m [36mv2.1.9 [39m[90mC:/Users/gatch/.gsd-path/projects/6766097597d76e29/1d504e52cfc1b1c5/verify/task-t018-verify[39m
  
   [32m✓[39m src/core/systems/research.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 6[2mms[22m[39m
  
  [2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
  [2m      Tests [22m [1m[32m8 passed[39m[22m[90m (8)[39m
  [2m   Start at [22m 19:57:31
  [2m   Duration [22m 899ms[2m (transform 88ms, setup 0ms, collect 134ms, tests 6ms, environment 434ms, prepare 84ms)[22m
  ```
