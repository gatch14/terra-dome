# Review — wave 12, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

## T026 — Fix wave 2 cycle 2 review findings in T006: pass

- ✅ Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 11 tests, full suite 56/56, exit 0): queue (buildings.test.ts:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99), and the two scaling tests added by this task's landing (be017428): cost scaling (:117 — `calculateCost(level, def) = floor(baseCost × costMultiplier^level)` asserted at levels 0/1/2) and time scaling (:138 — `calculateBuildTime(level, def) = floor(baseBuildTime × timeMultiplier^level)` at levels 0/1/2).

Warnings (non-blocking):
- The task's recorded Verify ran `pnpm tsc --noEmit && pnpm vitest run` (exit 0 at landing, suite 51/51); reviewer re-ran the full suite this cycle after the later landings (56/56).

Contract violations (blocking): none

## T027 — Fix wave 2 cycle 2 review findings in T008: pass

- ✅ Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — all four effect types now have consumers and tests, landed by this task (commit dfd5c1f3): `completedResearchMultiplier` helper (derived.ts:43-57) reads only `state.research` — no import cycle — and is exposed as `buildSpeedMultiplier` (derived.ts:59), `researchSpeedMultiplier` (:62) and `clanPointsMultiplier` (:65-67). Consumers: `calculateBuildTime` divides the level-scaled duration by buildSpeed (buildingDefinitions.ts:61-66); startResearch computes `durationMs = floor(def.time × 1000 / researchSpeedMultiplier.value)` (research.ts:33); addPlayerPoints floors positive awards through clanPointsMultiplier with deductions never boosted (clanEvent.ts:50-66, awarded line :56). resourceRate keeps its direct path (derived.ts:7-36). Tests per effect type (reviewer re-run this cycle): research.test.ts:108 (multipliers incl. 1.15×1.1 stacking), :126 (buildSpeed shortens calculateBuildTime), :141 (researchSpeed shortens the research timer), :162 (clanPointsMultiplier boosts awards; deductions unaffected), :99 (resource rates). The dead `applyResearchEffect` stub flagged in review was removed.

Warnings (non-blocking):
- The task's recorded Verify ran `pnpm tsc --noEmit && pnpm vitest run` (exit 0 at landing, suite 55/55); reviewer re-ran the full suite this cycle (56/56).
- The T024 autosave's default 500ms debounce sits between a multiplier change (research completion) and the persisted save; the completion itself is applied to live state synchronously, so the visible effect is immediate — non-blocking timing note.

Contract violations (blocking): none

## T028 — Fix wave 2 cycle 2 review findings in T009: pass

- ✅ Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (`pnpm vitest run`: clanEvent 11 tests, full suite 56/56, exit 0): event start (clanEvent.test.ts:21,:29), point sources (:43,:158), AI profiles (:62,:73 — this task's landing e42fbea1 renamed the old default-profile accrual test to 'tickAI accrues points fractionally for the default profile' and added the parametrized curve test asserting exact rusher/grinder/lateBloomer values at 10%/90% progress plus the early order rusher > grinder > lateBloomer, rusher tapering, lateBloomer overtaking its early accrual and grinder staying steady), event end (:120,:126), rewards (:144), offline catch-up (offlineCatchup.test.ts:107,:35).

Warnings (non-blocking):
- The task's recorded Verify ran `pnpm tsc --noEmit && pnpm vitest run` (exit 0 at landing, suite 56/56); reviewer re-ran the full suite this cycle (56/56).

Contract violations (blocking): none

## Summary for orchestrator

- All three wave 12 tasks pass; the wave owns no INTENT success criterion (no Intent coverage section, matching the coverage plan).
- Each task landed real product code and tests (be017428, dfd5c1f3, e42fbea1), closing the wave 2 cycle 2 findings — no brief-only landings in this batch.
- Reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 56 tests passed, exit 0; `pnpm build` exit 0.
