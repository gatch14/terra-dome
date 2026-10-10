---
id: T027
title: Fix wave 2 cycle 2 review findings in T008
wave: 12
deps: [T008]
status: pending
agent: null
base: null
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
