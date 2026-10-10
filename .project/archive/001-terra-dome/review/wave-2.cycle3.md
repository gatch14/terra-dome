# Review — wave 2, cycle 3

Wave verdict: pass
Cycle: 3
Depth: full
Tasks reviewed: 4

## T006 — Implement building system with queue and data-driven definitions: pass
- ✅ buildings.json defines 5+ buildings with costs, times, production per level — src/data/buildings.json:10-81 defines 5 buildings (command_center, resource_production, resource_storage, energy_reactor, research_lab) with baseCost, costMultiplier, baseBuildTime, timeMultiplier and per-level production (computed at buildingDefinitions.ts:52-75); file unchanged since T006's landing 127482d.
- ✅ queueBuilding deducts resources, adds to queue with correct endTime — buildings.ts:14-54 (`canAfford(cost) && spend(cost)`, `endTime = Date.now() + buildTime * 1000`, queue push); buildings.test.ts:21-36 asserts the exact deduction, endTime > now and queue contents — reviewer re-run this cycle: 11/11 passed.
- ✅ TimerManager processes build queue, completes building on timer expiry — buildings.ts:49-50 registers `build-<slot>` with the timerManager; timerManager.ts:30-36 fires `onComplete` at `now >= endTime`; full-suite re-run this cycle (56/56, exit 0) covers the timer path.
- ✅ Complete building increases level, updates production rates — buildings.ts:84-94 (`slot.level += 1`, queue cleanup, `touch()`); rates recompute through derived.ts:7-36; buildings.test.ts:38-49 asserts the rate increase (reviewer re-run, passed).
- ✅ Cancel building refunds 100% resources, removes from queue — buildings.ts:56-78 (refund of `calculateCost(slot.level, def)`, timer unregister, queue removal); buildings.test.ts:52-66 asserts exact refund (reviewer re-run, passed).
- ✅ Building grid enforces slot limits (1 CC, 4 resource, 1 lab) — buildings.json:2-9 defines exactly 1 command, 4 resource, 1 research slot; buildings.test.ts:82-99 covers slot-type mismatch and the lab lock behind Command Center Lv.2.
- ✅ Cannot queue if cannot afford or no free slot — buildings.ts:17 (busy slot), :34-35 (one active construction), :38 (unaffordable → false, nothing deducted); buildings.test.ts:68-80 (reviewer re-run, passed).
- ✅ Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — reviewer re-run this cycle (`pnpm vitest run`: buildings 11 tests, full suite 56/56, exit 0): queue (:21), complete (:38), cancel (:52), slot/type limits (:82,:87,:99), cost scaling (:117, asserts `calculateCost(level, def) = floor(baseCost × costMultiplier^level)` at levels 0/1/2) and time scaling (:138, asserts `calculateBuildTime(level, def) = floor(baseBuildTime × timeMultiplier^level)` at levels 0/1/2). The two scaling tests were added by fix task T026 (commit be01742), closing this wave's cycle 2 AC8 finding; T017's earlier landing 8cb302c had changed only its brief (retracted in the cycle 2 rewrite).
- ✅ Interface: queueBuilding() — buildings.ts:14.
- ✅ Interface: cancelBuilding() — buildings.ts:56.
- ✅ Interface: completeBuilding() — buildings.ts:84.
- ✅ Interface: getBuildingLevel() — buildings.ts:96.
- ✅ Interface: BUILDING_DEFINITIONS — buildingDefinitions.ts:48 (getBuildingDef reads the registered map populated by loadDefinitions, buildingDefinitions.ts:11).
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,30,38,40.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T006's Verify command is a `test -f` file-existence check that cannot fail; reviewer supplied the tsc and vitest runs above.
- cancelBuilding's refund is clamped at storage caps (buildings.ts:66-68), so "100%" holds only below the caps.
- AC1's "production per level" is data-backed for 3 of 5 buildings; command_center and research_lab carry empty production objects — reasonable for non-producers.
- calculateBuildTime now divides by `buildSpeedMultiplier` (buildingDefinitions.ts:61-66), so it reads completed-research state; with no completed research the multiplier is exactly 1 and the level-scaling formula tested at buildings.test.ts:138 holds unchanged.

Contract violations (blocking): none

## T007 — Implement resource system with production rates and storage caps: pass
- ✅ resources.json defines 3 resources with baseStorage, baseRate — resources.json:1-5 defines materials (1000/1), energy (1000/0.5), researchData (500/0.1); validated by resourceDefinitions.ts:11-15, exported at :21.
- ✅ tick(1) increases each resource by rate, clamped at storage — resources.ts:6-28 (`rates.X * deltaSec` with `Math.min(limits.X, ...)` :11-13); resources.test.ts:15-34 covers gain and clamp — reviewer re-run this cycle: 9/9 passed.
- ✅ spend() returns false if insufficient, true and deducts if sufficient — resources.ts:30-43; resources.test.ts:36-51 (reviewer re-run, passed).
- ✅ earn() adds resources, clamps at storage — resources.ts:45-52; resources.test.ts:53-70 proves add and clamp.
- ✅ Production rates update when buildings level up or research completes — derived.ts:7-36 is a `computed` over buildings and completed research; resources.test.ts:77-96 (level 2 → 21/10.5/2.1) and research.test.ts:99-107 (+10% after completion) both pass (reviewer re-run).
- ✅ Storage caps increase when storage buildings upgrade — derived.ts:70-90 adds `storageBonus × level`; resources.test.ts:98-115 (storage building → 1500/1500/750).
- ✅ Unit tests for: tick, spend, earn, rate calculation, storage limits — resources.test.ts:15 (tick), :36/:45 (spend), :53 (earn), :77 (rate calculation), :98 (storage limits); reviewer re-run this cycle: 9/9, exit 0.
- ✅ Interface: tick()/spend()/earn()/getRate()/getStorage()/getStored() — resources.ts:6,30,45,61,66,71.
- ✅ Interface: RESOURCE_DEFINITIONS — resourceDefinitions.ts:21.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T007's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.

Contract violations (blocking): none

## T008 — Implement research system with tech tree and bonuses: pass
- ✅ research.json defines 6-8 nodes across 3 categories with prereqs, costs, effects — research.json defines 7 nodes across production (3), research (2), clan (2), each with prereqs, cost, time and effect; file unchanged since T008's landing 24d83c7.
- ✅ startResearch validates prereqs, affordability, adds to queue with endTime — research.ts:20-45 (state gate, `canAfford`, `durationMs = floor(def.time × 1000 / researchSpeedMultiplier.value)` :33, queue push, `research-<nodeId>` timer registration); research.test.ts:40-68 — reviewer re-run this cycle: 12/12 passed.
- ✅ TimerManager completes research, applies bonus to derived rates — completeResearch (research.ts:71-91) is invoked by the timer; the resourceRate bonus reaches resourceRates through derived.ts:26-36; full-suite re-run 56/56 exit 0.
- ✅ Completed research unlocks dependent nodes (available state) — the prereq-unlock loop inside completeResearch (research.ts:71-91) flips prereq-met locked nodes to available; research.test.ts:70-83 (reviewer re-run, passed).
- ✅ Cancel research refunds 100% resources — cancelResearch (research.ts:47-69) refunds def.cost, unregisters the timer and returns the node to available; research.test.ts:85-97 (reviewer re-run, passed).
- ✅ Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — reviewer re-run this cycle: all four effect types now have consumers. resourceRate → resourceRates (derived.ts:7-36); the other three → `completedResearchMultiplier` (derived.ts:43-57) exported as `buildSpeedMultiplier` (derived.ts:59), `researchSpeedMultiplier` (:62) and `clanPointsMultiplier` (:65-67), consumed by `calculateBuildTime` (buildingDefinitions.ts:61-66: duration divided by buildSpeed), `startResearch`'s timer (research.ts:33: durationMs divided by researchSpeed) and `addPlayerPoints` (clanEvent.ts:56: positive awards floored through the multiplier). Tests per effect type: research.test.ts:108 (multipliers, including 1.15×1.1 stacking), :126 (buildSpeed shortens calculateBuildTime), :141 (researchSpeed shortens the research timer), :162 (clanPointsMultiplier boosts awards; deductions never boosted). Landed by fix task T027 (commit dfd5c1f); the empty `applyResearchEffect` stub flagged in cycle 2 was removed.
- ✅ Unit tests for: prereq validation, queue, complete, cancel, bonus application, unlock chain — research.test.ts:55 (prereq), :40 (queue), :70 (complete), :85 (cancel), :99/:108/:126/:141/:162 (bonus application across all four effect types), :70-83 (unlock chain); reviewer re-run: 12/12, exit 0.
- ✅ Interface: startResearch()/cancelResearch()/completeResearch()/getNodeState()/getAvailableNodes() — research.ts:20,47,71,93,97.
- ✅ Interface: RESEARCH_DEFINITIONS — researchDefinitions.ts:28.
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,30,38,40.
- ✅ Interface: resourceRates derived signal — derived.ts:7.

Warnings (non-blocking):
- T008's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.
- getAvailableNodes() returns `[]` in practice (it filters `state !== 'locked'` while every reachable node is available/completed) — tighten or drop.
- research refund is clamped at storage caps (research.ts:55-57); "100%" holds only below the caps.
- AC6's behavioral claim rests on unit tests plus code-path inspection; the UI does not surface the multipliers as numbers (research nodes show effect labels only) — presentation-level, non-blocking.

Contract violations (blocking): none

## T009 — Implement clan event system with AI opponent and scoring: pass
- ✅ Event starts automatically on first load, runs 7 days — fresh state carries eventEndTime = now + 7d and cycle 1 (gameState.ts:28,33); duration 604800000 ms (clanEvent.json:2); timer registered on boot (resumeTimers.ts:30-32) and by startEvent (clanEvent.ts:27-39); clanEvent.test.ts:21-27 asserts duration, future end, cycle 1 — reviewer re-run this cycle: 11/11 passed.
- ✅ Player actions (build, research) award points immediately — buildings.ts:50 and research.ts (startResearch awards inside research.ts:20-45) call addPlayerPoints (clanEvent.ts:50-66) with clanEvent.json point values 50/100; buildings.test.ts:35 (playerPoints 50) and research.test.ts:40-53 (playerPoints 100) pass (reviewer re-run).
- ✅ AI accumulates points passively per profile curve — tickAI (clanEvent.ts:81-94) applies `getAIPointsRate` (clanEvent.ts:96-110): early `baseRate × (2 − progress)`, steady `baseRate`, late `baseRate × (0.5 + 1.5 × progress)` over the rusher/grinder/lateBloomer profiles (clanEvent.json:8-12); offline accrual at offlineCatchup.ts:57-60.
- ✅ Leaderboard shows Player vs AI scores updating in real-time — getLeaderboard (clanEvent.ts:112-118) returns both clans from live state; player score updates synchronously through addPlayerPoints + touch(); clanEvent.test.ts:174 (reviewer re-run, passed).
- ✅ Point log shows source breakdown (build: +50, research: +100, etc.) — pushLog (clanEvent.ts:14-25) records per-source entries; sources build/research/passive/event_end wired through addPlayerPoints, tickAI and checkEventEnd; human labels rendered by PointLog.tsx:7-15 ("Build queued", "Research started", "AI passive"); clanEvent.test.ts:43-60 (reviewer re-run, passed).
- ✅ Event end triggers results modal with winner and rewards — checkEventEnd (clanEvent.ts:133-153) records lastResults with winner, points and reward; claimEventResults (clanEvent.ts:155-173) applies them; the modal renders from lastResults (App.tsx:91,117 → EventResultsModal.tsx:12-49); clanEvent.test.ts:126-142 (reviewer re-run, passed).
- ✅ Next event auto-starts after resolution — clanEvent.ts:151 calls startEvent() inside checkEventEnd; clanEvent.test.ts:126-142 asserts cycle 2 and a future eventEndTime.
- ✅ Offline catch-up (T004) advances AI points and checks event end — offlineCatchup.ts:57-60 (aiPoints accrual under the 24h clamp) and :62-64 (checkEventEnd); offlineCatchup.test.ts:35 and :107 — reviewer re-run this cycle: 8/8 passed.
- ✅ Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (clanEvent 11 tests, full suite 56/56, exit 0): event start (:21,:29), point sources (:43,:158), AI profiles (:73 — parametrized over rusher/grinder/lateBloomer asserting exact curve values at 10%/90% progress, the early order rusher > grinder > lateBloomer, rusher tapering, lateBloomer overtaking its early accrual and grinder staying steady; :62 covers fractional accumulation for the default profile), event end (:120,:126), rewards (:144), offline catch-up (offlineCatchup.test.ts:107). The profile test was added by fix task T028 (commit e42fbea), closing this wave's cycle 2 AC9 finding; T019's earlier landing 65df5cd had changed only its brief (retracted in the cycle 2 rewrite).
- ✅ Interface: startEvent()/addPlayerPoints()/tickAI()/getLeaderboard()/getPointLog()/checkEventEnd()/getTimeRemaining() — clanEvent.ts:27,50,81,112,120,133,124.
- ✅ Interface: CLAN_EVENT_CONFIG — clanEventDefinitions.ts:33.
- ✅ Interface: TimerManager singleton with register/unregister/tick/start/pause — timerManager.ts:5,10,22,30,38,40.
- ✅ Interface: clanEvent state — types.ts:76, initial values gameState.ts:27-36.

Warnings (non-blocking):
- T009's Verify is a `test -f` check; reviewer supplied tsc and vitest evidence.
- Point-log coalescing merges same-source entries within 60s and caps the log at 100 entries (clanEvent.ts:16-25).

Contract violations (blocking): none

## Summary for orchestrator

- All four wave 2 tasks pass this cycle; no wave in this cycle owns an INTENT success criterion (Intent coverage section omitted, matching cycles 1-2).
- The three cycle 2 findings are closed by real landings: T006 AC8 → T026 (be01742, buildings.test.ts:117,:138), T008 AC6 → T027 (dfd5c1f, derived.ts:43-67 + consumers + research.test.ts:108/:126/:141/:162), T009 AC9 → T028 (e42fbea, clanEvent.test.ts:73).
- Reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 56 tests passed, exit 0; `pnpm build` exit 0.
