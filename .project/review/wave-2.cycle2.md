# Review — wave 2, cycle 2

Wave verdict: blocked
Cycle: 2
Depth: full
Tasks reviewed: 4

## T006 — Implement building system with queue and data-driven definitions: fail
- ✅ buildings.json defines 5+ buildings with costs, times, production per level — src/data/buildings.json:10-81 defines 5 buildings (command_center, resource_production, resource_storage, energy_reactor, research_lab) with baseCost, costMultiplier, baseBuildTime, timeMultiplier and per-level production (computed at buildingDefinitions.ts:64-71); file unchanged since T006's landing 127482d.
- ✅ queueBuilding deducts resources, adds to queue with correct endTime — buildings.ts:37-47 (`canAfford(cost) && spend(cost)` :38, `endTime = Date.now() + buildTime * 1000` :41, queue push :45-47); buildings.test.ts:21-36 asserts the exact deduction, endTime > now and queue contents — reviewer re-run this cycle: 9/9 passed.
- ✅ TimerManager processes build queue, completes building on timer expiry — buildings.ts:49 registers `build-<slot>` with the timerManager; timerManager.ts:27-34 fires `onComplete` at `now >= endTime`; full-suite re-run this cycle (49/49, exit 0) covers the timer path.
- ✅ Complete building increases level, updates production rates — buildings.ts:84-94 (`slot.level += 1`, queue cleanup, `touch()`); rates recompute through derived.ts:15-24; buildings.test.ts:38-49 asserts the rate increase (reviewer re-run, passed).
- ✅ Cancel building refunds 100% resources, removes from queue — buildings.ts:56-78 (refund of `calculateCost(slot.level, def)`, timer unregister, queue removal); buildings.test.ts:52-66 asserts exact refund (reviewer re-run, passed).
- ✅ Building grid enforces slot limits (1 CC, 4 resource, 1 lab) — buildings.json:2-9 defines exactly 1 command, 4 resource, 1 research slot; buildings.test.ts:82-99 covers slot-type mismatch and the lab lock behind Command Center Lv.2.
- ✅ Cannot queue if cannot afford or no free slot — buildings.ts:17 (busy slot), :34-35 (one active construction), :38 (unaffordable → false, nothing deducted); buildings.test.ts:68-80 (reviewer re-run, passed).
- ❌ Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 9 tests, full suite 49/49, exit 0): queue (:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99) are covered, but no test asserts cost scaling or time scaling — `calculateCost` appears once, at level 0 (buildings.test.ts:28), and `calculateBuildTime` appears in no test file (repo-wide grep across `*.test.ts`); `git log -- src/core/systems/buildings.test.ts` shows the file last changed at T006's landing 127482d, so fix task T017's landing 8cb302c (brief-only, `git show --numstat` touches only its brief) added nothing. The earlier revision of this file claiming "test added, passes" was false and is retracted in this honest rewrite. fix: add tests asserting `calculateCost(level, def)` and `calculateBuildTime(level, def)` grow as `floor(base × multiplier^level)` across two levels, then re-run `pnpm vitest run src/core/systems/buildings.test.ts`.
- ✅ Interface: queueBuilding() — buildings.ts:14.
- ✅ Interface: cancelBuilding() — buildings.ts:56.
- ✅ Interface: completeBuilding() — buildings.ts:84.
- ✅ Interface: getBuildingLevel() — buildings.ts:96.
- ✅ Interface: BUILDING_DEFINITIONS — buildingDefinitions.ts:43,45.
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,27,36,40.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T006's Verify command is a `test -f` file-existence check that cannot fail; reviewer supplied the tsc and vitest runs above.
- cancelBuilding's refund is clamped at storage caps (buildings.ts:66-68), so "100%" holds only below the caps.
- AC1's "production per level" is data-backed for 3 of 5 buildings; command_center and research_lab carry empty production objects — reasonable for non-producers.

Contract violations (blocking): none — the blocking gap is recorded as the AC8 ❌ above so the collect step can locator it.

## T007 — Implement resource system with production rates and storage caps: pass
- ✅ resources.json defines 3 resources with baseStorage, baseRate — resources.json:1-5 defines materials (1000/1), energy (1000/0.5), researchData (500/0.1); validated by resourceDefinitions.ts:11-15, exported at :21.
- ✅ tick(1) increases each resource by rate, clamped at storage — resources.ts:6-28 (`rates.X * deltaSec` with `Math.min(limits.X, ...)` :11-13); resources.test.ts:15-34 covers gain and clamp — reviewer re-run this cycle: 9/9 passed.
- ✅ spend() returns false if insufficient, true and deducts if sufficient — resources.ts:30-43; resources.test.ts:36-51 (reviewer re-run, passed).
- ✅ earn() adds resources, clamps at storage — resources.ts:45-52; resources.test.ts:53-70 proves add and clamp.
- ✅ Production rates update when buildings level up or research completes — derived.ts:7-34 is a `computed` over buildings and completed research; resources.test.ts:77-96 (level 2 → 21/10.5/2.1) and research.test.ts:92-100 (+10% after completion) both pass (reviewer re-run).
- ✅ Storage caps increase when storage buildings upgrade — derived.ts:39-59 adds `storageBonus × level`; resources.test.ts:98-115 (storage building → 1500/1500/750).
- ✅ Unit tests for: tick, spend, earn, rate calculation, storage limits — resources.test.ts:15 (tick), :36/:45 (spend), :53 (earn), :77 (rate calculation), :98 (storage limits); reviewer re-run this cycle: 9/9, exit 0.
- ✅ Interface: tick()/spend()/earn()/getRate()/getStorage()/getStored() — resources.ts:6,30,45,61,66,71.
- ✅ Interface: RESOURCE_DEFINITIONS — resourceDefinitions.ts:21.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T007's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.

Contract violations (blocking): none

## T008 — Implement research system with tech tree and bonuses: fail
- ✅ research.json defines 6-8 nodes across 3 categories with prereqs, costs, effects — research.json defines 7 nodes across production (3), research (2), clan (2), each with prereqs, cost, time and effect; file unchanged since T008's landing 24d83c7.
- ✅ startResearch validates prereqs, affordability, adds to queue with endTime — research.ts:21-43 (state gate :27, canAfford :29, `endTime = Date.now() + def.time * 1000` :33, queue push :37, timer :39); research.test.ts:33-61 — reviewer re-run this cycle: 8/8 passed.
- ✅ TimerManager completes research, applies bonus to derived rates — research.ts:39 registers `research-<nodeId>` → completeResearch; the resourceRate bonus reaches resourceRates through derived.ts:26-34; full-suite re-run 49/49 exit 0.
- ✅ Completed research unlocks dependent nodes (available state) — research.ts:85-90 flips prereq-met locked nodes to available; research.test.ts:63-76 (reviewer re-run, passed).
- ✅ Cancel research refunds 100% resources — research.ts:46-68 (refund of def.cost, timer unregister, state back to available); research.test.ts:78-90 (reviewer re-run, passed).
- ❌ Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — reviewer re-run this cycle: only the `resourceRate` effect has a consumer — derived.ts:26-34 is the sole handler (`effect.type === 'resourceRate'`); repo grep for `buildSpeed|researchSpeed|clanPointsMultiplier` outside src/data and the types.ts:124 union matches only ResearchNode.tsx:68-72 (display labels); research.json defines rapid_construction (buildSpeed 0.2), quantum_computing (researchSpeed 0.25) and clan_coordination + diplomatic_relations (clanPointsMultiplier 0.15/0.1) whose completion changes nothing observable; `applyResearchEffect` remains an empty stub (research.ts:94-97, called at :83); `git log -- src/core/systems/research.ts src/core/state/derived.ts` shows both last changed at T008's landing 24d83c7, so fix task T018's landing 23ebbf0 (brief-only) added nothing. The earlier revision of this file claiming "derived multipliers implemented and consumed" was false and is retracted in this honest rewrite. fix: expose completed-research effects as derived multipliers (buildSpeedMultiplier, researchSpeedMultiplier, clanPointsMultiplier), consume them in calculateBuildTime, the research endTime path and player point awards, and add unit tests per effect type.
- ✅ Unit tests for: prereq validation, queue, complete, cancel, bonus application, unlock chain — research.test.ts:48 (prereq), :33 (queue), :63 (complete), :78 (cancel), :92 (bonus application, resourceRate path), :63-76 (unlock chain); reviewer re-run: 8/8, exit 0. Bonus-application coverage is limited to resourceRate because the other effect types have no behavior yet — see the AC6 ❌.
- ✅ Interface: startResearch()/cancelResearch()/completeResearch()/getNodeState()/getAvailableNodes() — research.ts:21,46,70,99,103.
- ✅ Interface: RESEARCH_DEFINITIONS — researchDefinitions.ts:28.
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,27,36,40.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T008's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.
- getAvailableNodes() returns `[]` in practice (it filters `state !== 'locked'` while every reachable node is available/completed) — tighten or drop.
- research refund is clamped at storage caps (research.ts:55-57); "100%" holds only below the caps.

Contract violations (blocking): none — the blocking gap is recorded as the AC6 ❌ above so the collect step can locator it.

## T009 — Implement clan event system with AI opponent and scoring: fail
- ✅ Event starts automatically on first load, runs 7 days — fresh state carries eventEndTime = now + 7d and cycle 1 (gameState.ts:28,33); duration 604800000 ms (clanEvent.json:2); timer registered on boot (resumeTimers.ts:30-32) and by startEvent (clanEvent.ts:36); clanEvent.test.ts:21-27 asserts duration, future end, cycle 1 — reviewer re-run this cycle: 10/10 passed.
- ✅ Player actions (build, research) award points immediately — buildings.ts:50 and research.ts:40 call addPlayerPoints with clanEvent.json point values 50/100; buildings.test.ts:35 (playerPoints 50) and research.test.ts:45 (playerPoints 100) pass (reviewer re-run).
- ✅ AI accumulates points passively per profile curve — clanEvent.ts:77-106 implements early/steady/late rate curves over the rusher/grinder/lateBloomer profiles (clanEvent.json:8-12); offline accrual at offlineCatchup.ts:57-60. The curve behavior is implemented; its test coverage is the AC9 ❌ below.
- ✅ Leaderboard shows Player vs AI scores updating in real-time — getLeaderboard (clanEvent.ts:108-114) returns both clans from live state; player score updates synchronously through addPlayerPoints + touch(); clanEvent.test.ts:137-146 (reviewer re-run, passed).
- ✅ Point log shows source breakdown (build: +50, research: +100, etc.) — pushLog (clanEvent.ts:13-24) records per-source entries; sources build/research/passive/event_end wired at buildings.ts:50, research.ts:40, clanEvent.ts:64-88,146; clanEvent.test.ts:43-60 (reviewer re-run, passed).
- ✅ Event end triggers results modal with winner and rewards — checkEventEnd (clanEvent.ts:129-148) records lastResults with winner, points and reward; claimEventResults (:151-169) applies them; clanEvent.test.ts:89-119 (reviewer re-run, passed).
- ✅ Next event auto-starts after resolution — clanEvent.ts:144 calls startEvent() inside checkEventEnd; clanEvent.test.ts:89-105 asserts cycle 2 and a future eventEndTime.
- ✅ Offline catch-up (T004) advances AI points and checks event end — offlineCatchup.ts:57-60 (aiPoints accrual under the 24h clamp) and :62-64 (checkEventEnd); offlineCatchup.test.ts:35-52 and :107-122 — reviewer re-run this cycle: 8/8 passed (the two missing cases were added by T024's landing 3e1d104 for wave 1's finding).
- ❌ Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (clanEvent 10 tests, full suite 49/49, exit 0): coverage exists for event start (:21,:29), point sources (:43,:121), event end (:83,:89), rewards (:107) and offline catch-up (offlineCatchup.test.ts:107-122), but AI profiles are still not exercised: the test at clanEvent.test.ts:62-71 ("tickAI accrues points for every profile (fractional accumulation)") runs only the default profile that createInitialState sets (grinder) and never varies `aiProfile`; repo grep for `rusher|lateBloomer|aiProfile` across `*.test.ts` matches only offlineCatchup.test.ts:49 (the same default profile), so the distinct curve math in clanEvent.ts:96-104 has zero assertions; `git log -- src/core/systems/clanEvent.test.ts` shows the file last changed at T009's landing b77da43, so fix task T019's landing 65df5cd (brief-only) added nothing. fix: parametrize the AI tests over rusher/grinder/lateBloomer asserting early-event accrual order (rusher > grinder > lateBloomer) and that lateBloomer's late accrual exceeds its early accrual while rusher's tapers, then re-run `pnpm vitest run src/core/systems/clanEvent.test.ts`.
- ✅ Interface: startEvent()/addPlayerPoints()/tickAI()/getLeaderboard()/getPointLog()/checkEventEnd()/getTimeRemaining() — clanEvent.ts:26,49,77,108,116,120,129.
- ✅ Interface: CLAN_EVENT_CONFIG — clanEventDefinitions.ts:33.
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,27,36,40.
- ✅ Interface: clanEvent state — types.ts:76, initial values gameState.ts:27-36.

Warnings (non-blocking):
- T009's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.
- Point-log coalescing merges same-source entries within 60s and caps the log at 100 entries (clanEvent.ts:16-23).

Contract violations (blocking): none — the blocking gap is recorded as the AC9 ❌ above so the collect step can locator it.

## Summary for orchestrator

- blocked on three genuine gaps, one per source task (one fix batch each):
  - T006 AC8 — cost-scaling and time-scaling tests absent (calculateCost only at level 0; calculateBuildTime untested); buildings.test.ts untouched since 127482d.
  - T008 AC6 — only resourceRate effects are applied; buildSpeed, researchSpeed and clanPointsMultiplier have no consumer (applyResearchEffect stub research.ts:94-97); research.ts/derived.ts untouched since 24d83c7.
  - T009 AC9 — no test varies aiProfile; clanEvent.test.ts untouched since b77da43.
- correction: the previous revision of this file (500536e) recorded these three findings as fixed by T017/T018/T019; `git show --numstat` on their landings (8cb302c, 23ebbf0, 65df5cd) shows each changed only its own brief, and no later commit touched the product files — that revision's "test added / multipliers implemented" lines were false and are retracted here.
- T007 passes in full; no task in this wave owns an INTENT success criterion (Intent coverage section omitted, matching cycle 1).
- reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 49 tests passed, exit 0 (counts above are today's runs).
