---
id: T015
title: Fix wave 1 cycle 1 review findings in T004
wave: 6
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/time/offlineCatchup.test.ts
  - src/core/time/offlineCatchup.ts
  - src/core/time/resumeTimers.ts
---

# T015 — Fix wave 1 cycle 1 review findings in T004

## Context

Repair task created from the wave 1 cycle 1 review of T004.
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

1. Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence
2. T004 product imports modules outside the wave's delivered surface that do not exist

## Verify

```bash
set -e
(
test -f src/core/time/offlineCatchup.ts
)
```

Heavy: no

## Review findings

### t004_ac6
Criterion: Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence
- Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence — found: reviewer re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts` (sidecar at wave HEAD): collection error, `Test Files 1 failed`, `no tests`, exit 1 — offlineCatchup.test.ts:6-9 imports `../systems/buildingDefinitions.js`, `../systems/resourceDefinitions.js`, `../systems/researchDefinitions.js`, `../systems/clanEventDefinitions.js`, none of which exist anywhere in the wave product (`git ls-tree` at landing abe05c5 and review HEAD 7a1886f: no `src/core/systems/` directory). Additionally, no zero-elapsed scenario exists in the file (actual cases: clock skew :22, 24h clamp :33, storage full :52, timer reduction :66, completion :90, event end :104). fix: decouple offlineCatchup.ts/resumeTimers.ts from the later-wave `src/core/systems/*` modules (see the blocking finding), register minimal test definitions inline in the test file instead of importing definition modules, and add a `lastSave === now` zero-elapsed test case; then re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts`.

### t004_files
Criterion: T004 product imports modules outside the wave's delivered surface that do not exist
- T004 product imports modules outside the wave's delivered surface that do not exist — src/core/time/offlineCatchup.ts:4-7 and src/core/time/resumeTimers.ts:3-5 import `../systems/buildings.js`, `../systems/research.js`, `../systems/clanEvent.js`, `../systems/clanEventDefinitions.js` (`src/core/systems/*` is later-wave T006-T009 territory; `git ls-tree -r abe05c5 -- src/` and `git ls-tree -r 7a1886f -- src/` show no `src/core/systems/` directory). Reviewer re-run `pnpm tsc --noEmit` in the sidecar at wave HEAD: exit 2 with 7× TS2307 for exactly these imports — the wave product does not typecheck, `pnpm run build` (`tsc && vite build`) cannot succeed, and vitest cannot collect T004's suite. fix: invert the dependency — accept completion handlers as a parameter (e.g. `handlers: { completeBuilding, completeResearch, checkEventEnd }` with no-op defaults) and take the AI profile rates as a parameter or local constant instead of importing `CLAN_EVENT_CONFIG`, so the module compiles standalone; the systems wave injects the real implementations. Re-verify with `pnpm tsc --noEmit` and `pnpm vitest run` after the repair.

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 1 cycle 1
