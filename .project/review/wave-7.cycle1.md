# Review — wave 7, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

## T017 — Fix wave 2 cycle 1 review findings in T006: pass

- ✅ Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 11 tests, full suite 56/56, exit 0): queue (buildings.test.ts:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99), cost scaling (:117 — `calculateCost(level, def) = floor(baseCost × costMultiplier^level)` at levels 0/1/2) and time scaling (:138 — `calculateBuildTime(level, def) = floor(baseBuildTime × timeMultiplier^level)` at levels 0/1/2). The two scaling tests were added by T026 (commit be01742), closing the criterion.

Warnings (non-blocking):
- T017's own landing 8cb302c changed only its task brief (retracted in the wave 2 cycle 2 rewrite); the criterion was completed by T026. Recorded for provenance; goal-backward the criterion now holds.

Contract violations (blocking): none

## T018 — Fix wave 2 cycle 1 review findings in T008: pass

- ✅ Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — all four effect types have consumers and tests: resourceRate → resourceRates (derived.ts:7-36); buildSpeed → `buildSpeedMultiplier` (derived.ts:59) consumed by `calculateBuildTime` (buildingDefinitions.ts:61-66, duration divided by the multiplier); researchSpeed → `researchSpeedMultiplier` (derived.ts:62) consumed by startResearch's timer (research.ts:33, `durationMs = floor(def.time × 1000 / researchSpeedMultiplier.value)`); clanPointsMultiplier → `clanPointsMultiplier` (derived.ts:65-67) consumed by addPlayerPoints (clanEvent.ts:56, positive awards floored through the multiplier, deductions never boosted). Multiplier computation: `completedResearchMultiplier` (derived.ts:43-57), including stacking. Tests per effect type (reviewer re-run this cycle): research.test.ts:108 (multipliers incl. 1.15×1.1 stacking), :126 (buildSpeed shortens calculateBuildTime), :141 (researchSpeed shortens the research timer), :162 (clanPointsMultiplier boosts awards; deductions unaffected), :99 (resource rates). Landed by T027 (commit dfd5c1f).

Warnings (non-blocking):
- T018's own landing 23ebbf0 changed only its task brief (retracted in the wave 2 cycle 2 rewrite); the criterion was completed by T027. Recorded for provenance.

Contract violations (blocking): none

## T019 — Fix wave 2 cycle 1 review findings in T009: pass

- ✅ Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (`pnpm vitest run`: clanEvent 11 tests + offlineCatchup 8 tests, full suite 56/56, exit 0): event start (clanEvent.test.ts:21,:29), point sources (:43,:158), AI profiles (:73 — parametrized over rusher/grinder/lateBloomer asserting exact curve values at 10%/90% progress, the early order rusher > grinder > lateBloomer, rusher tapering, lateBloomer overtaking its early accrual and grinder staying steady; :62 covers fractional accrual for the default profile), event end (:120,:126), rewards (:144), offline catch-up (offlineCatchup.test.ts:107,:35). The profile test was added by T028 (commit e42fbea), closing the criterion.

Warnings (non-blocking):
- T019's own landing 65df5cd changed only its task brief (retracted in the wave 2 cycle 2 rewrite); the criterion was completed by T028. Recorded for provenance.

Contract violations (blocking): none

## Summary for orchestrator

- All three wave 7 tasks pass; the wave owns no INTENT success criterion (no Intent coverage section, matching the coverage plan).
- The three original landings (8cb302c, 23ebbf0, 65df5cd) changed only their briefs; the real repairs were delivered by T026/T027/T028 (be01742, dfd5c1f, e42fbea) and verified above — provenance documented in the warnings.
- Reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 56 tests passed, exit 0; `pnpm build` exit 0.
