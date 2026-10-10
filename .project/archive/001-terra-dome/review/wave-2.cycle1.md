# Review — wave 2, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 4

<!-- Reviewer-supplied evidence (recorded Verify in every task Log is a
     `test -f` file-existence check that cannot check behavior):
     in this sidecar at base 95215f4, `pnpm install --frozen-lockfile`,
     `pnpm exec tsc --noEmit` → exit 0;
     `pnpm exec vitest run src/core/systems/{buildings,resources,research,clanEvent}.test.ts`
     → 4 files, 36 tests passed, exit 0;
     `pnpm exec vitest run src/core/time/offlineCatchup.test.ts` → 6 passed, exit 0;
     sidecar-only temp file src/core/systems/reviewerWave2Temp.test.ts
     (untracked, not product) → 3 passed, exit 0. -->

## T006 — Implement building system with queue and data-driven definitions: fail

- ✅ buildings.json defines 5+ buildings with costs, times, production per level — src/data/buildings.json:10-81 defines 5 buildings (command_center, resource_production, resource_storage, energy_reactor, research_lab), each with baseCost, costMultiplier, baseBuildTime, timeMultiplier and a `production` object; per-level production computed at src/core/systems/buildingDefinitions.ts:64-71.
- ✅ queueBuilding deducts resources, adds to queue with correct endTime — src/core/systems/buildings.ts:37-47 (`canAfford(cost) && spend(cost)` :38, `endTime = Date.now() + buildTime * 1000` :41, queue push :45-47); reviewer re-run `pnpm exec vitest run src/core/systems/buildings.test.ts` → 9 passed, exit 0; buildings.test.ts:21-36 asserts exact deduction, endTime > now, queue contents.
- ✅ TimerManager processes build queue, completes building on timer expiry — buildings.ts:49 `timerManager.registerTimer('build-' + slotId, endTime, () => completeBuilding(slotId))`; fires via src/core/time/timerManager.ts:27-34 (`now >= timer.endTime` → `onComplete()`); recorded Verify (`test -f`, T006 Log: pass, exit 0) cannot check this → reviewer-supplied: temp test reviewerWave2Temp.test.ts "timer expiry completes the queued build" (queueBuilding → `timerManager.tick(endTime)` → level 1, queue empty, timer removed) passed, exit 0.
- ✅ Complete building increases level, updates production rates — buildings.ts:84-94 (`slot.level += 1`, queue cleanup, `touch()`); rates recompute through the derived computed src/core/state/derived.ts:15-24; buildings.test.ts:38-49 (reviewer re-run, passed) asserts rate increase after `completeBuilding`.
- ✅ Cancel building refunds 100% resources, removes from queue — buildings.ts:64-78 (refund `calculateCost(slot.level, def)` :64-68, `unregisterTimer` :70, queue removal :78); buildings.test.ts:52-66 asserts resources exactly restored and queue emptied (reviewer re-run, passed).
- ✅ Building grid enforces slot limits (1 CC, 4 resource, 1 lab) — src/data/buildings.json:2-9 defines exactly 1 `command` slot, 4 `resource` slots, 1 `research` slot; queueBuilding rejects a def whose slotType mismatches the slot (buildings.ts:26) and derives fixed-slot building types (:20); buildings.test.ts:82-85 (research building rejected in a resource slot).
- ✅ Cannot queue if cannot afford or no free slot — buildings.ts:17 (target slot busy), :34-35 (any active construction blocks), :38 (unaffordable → false, nothing deducted); buildings.test.ts:68-80 (reviewer re-run, passed).
- ❌ Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits — found: reviewer re-run `pnpm exec vitest run src/core/systems/buildings.test.ts` → 9 passed, but the file covers queue (buildings.test.ts:21), complete (:38), cancel (:52) and slot/type limits (:68, :82, :87, :99, :112) only — no test asserts cost scaling or time scaling: `calculateCost` appears once, at level 0 (buildings.test.ts:28), and `calculateBuildTime` appears in no test at all (repo grep for `calculateBuildTime|costMultiplier|timeMultiplier` across `*.test.ts` matches no product test); the scaling math exists only in production code (buildingDefinitions.ts:51-62).
  fix: add unit tests to src/core/systems/buildings.test.ts asserting `calculateCost(level, def)` grows as `floor(baseCost × costMultiplier^level)` across at least two levels and `calculateBuildTime(level, def) = floor(baseBuildTime × timeMultiplier^level)` across two levels (e.g. resource_production at level 0 vs 1), then re-run `pnpm exec vitest run src/core/systems/buildings.test.ts`.
- ✅ Interface: queueBuilding() — src/core/systems/buildings.ts:14.
- ✅ Interface: cancelBuilding() — src/core/systems/buildings.ts:56.
- ✅ Interface: completeBuilding() — src/core/systems/buildings.ts:84.
- ✅ Interface: getBuildingLevel() — src/core/systems/buildings.ts:96.
- ✅ Interface: canAfford() — src/core/systems/resources.ts:54 (T007's declared file, same wave).
- ✅ Interface: BUILDING_DEFINITIONS — src/core/systems/buildingDefinitions.ts:43,45.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5 (singleton).
- ✅ Interface: TimerManager.registerTimer() — src/core/time/timerManager.ts:36.
- ✅ Interface: TimerManager.unregisterTimer() — src/core/time/timerManager.ts:40.
- ✅ Interface: TimerManager.start() — src/core/time/timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — src/core/time/timerManager.ts:20.
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: tick() — src/core/systems/resources.ts:6.
- ✅ Interface: spend() — src/core/systems/resources.ts:30.
- ✅ Interface: earn() — src/core/systems/resources.ts:45.
- ✅ Interface: getRate() — src/core/systems/resources.ts:61.
- ✅ Interface: getStorage() — src/core/systems/resources.ts:66.
- ✅ Interface: getStored() — src/core/systems/resources.ts:71.
- ✅ Interface: RESOURCE_DEFINITIONS — src/core/systems/resourceDefinitions.ts:21.

Warnings (non-blocking):
- T006's Verify command (`test -f src/core/systems/buildings.ts && ...`, Log: pass exit 0) cannot fail once the files exist; it concealed the missing cost/time-scaling tests (now the blocking AC7 finding) — reviewer supplied `pnpm exec tsc --noEmit` (exit 0) and the vitest runs above.
- cancelBuilding's refund is clamped at storage caps (buildings.ts:66-68), so "100%" holds only while resources sit below the caps; same pattern in T008's research refund.
- AC1's "production per level" is data-backed for 3 of 5 buildings; command_center and research_lab carry empty `production`/`storageBonus` objects (buildings.json:22-23,78-79) — reasonable as non-producers, tighten the criterion if every building must produce.

Contract violations (blocking):
- none — landing 127482d changes exactly the four declared files plus `.project/tasks/T006-building-system.md` (`git show --numstat`); the task-file diff only flips orchestrator-owned `status`/`agent`/`base` and appends Log entries; no commit after the landing touched its files (`git log 127482d..HEAD -- <declared files>` empty).

## T007 — Implement resource system with production rates and storage caps: pass

- ✅ resources.json defines 3 resources with baseStorage, baseRate — src/data/resources.json:1-5 defines materials (1000/1), energy (1000/0.5), researchData (500/0.1); validated by src/core/systems/resourceDefinitions.ts:11-15, exported at :21.
- ✅ tick(1) increases each resource by rate, clamped at storage — src/core/systems/resources.ts:6-28 (`rates.X * deltaSec` with `Math.min(limits.X, ...)` :11-13); reviewer re-run `pnpm exec vitest run src/core/systems/resources.test.ts` → 9 passed, exit 0; resources.test.ts:15-25 (per-rate gain) and :27-34 (clamp at cap).
- ✅ spend() returns false if insufficient, true and deducts if sufficient — resources.ts:30-43 (per-resource check → false with no mutation :32-36; else deduct + `touch()` + true); resources.test.ts:36-51 (reviewer re-run, passed).
- ✅ earn() adds resources, clamps at storage — resources.ts:45-52 (`Math.min(limits.X, ...)`); resources.test.ts:53-70 proves both the add and the clamp at the cap.
- ✅ Production rates update when buildings level up or research completes — src/core/state/derived.ts:7-33 is a signal `computed` over `state.buildings` (:15-24) and completed `state.research` (:26-33), so any `touch()`/level change recomputes; resources.test.ts:77-96 (building level 2 → 21/10.5/2.1) and src/core/systems/research.test.ts:92-99 (+10% after completion), both reviewer-run and passed; also asserted through the real completion path in buildings.test.ts:38-49.
- ✅ Storage caps increase when storage buildings upgrade — derived.ts:39-59 adds `storageBonus × level` on top of baseStorage; resources.test.ts:98-115 (storage building at level 1 → 1500/1500/750).
- ✅ Unit tests for: tick, spend, earn, rate calculation, storage limits — resources.test.ts:15 (tick), :36 and :45 (spend), :53 (earn), :77 (rate calculation), :98 (storage limits); reviewer re-run: 9 passed, exit 0.
- ✅ Interface: tick() — src/core/systems/resources.ts:6.
- ✅ Interface: spend() — src/core/systems/resources.ts:30.
- ✅ Interface: earn() — src/core/systems/resources.ts:45.
- ✅ Interface: getRate() — src/core/systems/resources.ts:61.
- ✅ Interface: getStorage() — src/core/systems/resources.ts:66.
- ✅ Interface: getStored() — src/core/systems/resources.ts:71.
- ✅ Interface: RESOURCE_DEFINITIONS — src/core/systems/resourceDefinitions.ts:21.
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: gameState signal — src/core/state/gameState.ts:43.
- ✅ Interface: TimerManager.tick() — src/core/time/timerManager.ts:27.
- ✅ Interface: queueBuilding() — src/core/systems/buildings.ts:14 (T006's declared file, same wave).
- ✅ Interface: cancelBuilding() — src/core/systems/buildings.ts:56.
- ✅ Interface: completeBuilding() — src/core/systems/buildings.ts:84.
- ✅ Interface: getBuildingLevel() — src/core/systems/buildings.ts:96.
- ✅ Interface: canAfford() — src/core/systems/resources.ts:54.
- ✅ Interface: BUILDING_DEFINITIONS — src/core/systems/buildingDefinitions.ts:43,45.

Warnings (non-blocking):
- T007's Verify command (`test -f ...`, Log: pass exit 0) cannot fail once the files exist; reviewer supplied `pnpm exec tsc --noEmit` (exit 0) and the vitest run above.
- Nothing in the product calls `resources.tick(deltaSec)` per second yet (repo grep: only resources.ts and its test reference it), and `resources.ts` does not hook `TimerManager.tick()`; the Approach line "Called by TimerManager tick (T003)" is therefore unwired — per-second loop ownership sits with a later integration wave (T014). The interface criterion `TimerManager.tick()` is read as presence-based; tighten if it means integration.

Contract violations (blocking):
- none — landing f65d681 changes exactly the four declared files plus `.project/tasks/T007-resource-system.md` (`git show --numstat`); task-file diff only flips orchestrator-owned fields and appends Log entries; no later commit touched its files.

## T008 — Implement research system with tech tree and bonuses: fail

- ✅ research.json defines 6-8 nodes across 3 categories with prereqs, costs, effects — src/data/research.json:1-65 defines 7 nodes across categories production (3), research (2), clan (2), each with prereqs, cost, time and effect.
- ✅ startResearch validates prereqs, affordability, adds to queue with endTime — src/core/systems/research.ts:21-43 (`state !== 'available'` gate :27 rejects unmet prereqs, `canAfford` :29, `endTime = Date.now() + def.time * 1000` :33, queue push :37, timer :39); reviewer re-run `pnpm exec vitest run src/core/systems/research.test.ts` → 8 passed, exit 0; research.test.ts:33-61 (deduction/queue/endTime, prereq rejection, unaffordable rejection).
- ✅ TimerManager completes research, applies bonus to derived rates — research.ts:39 registers `research-<nodeId>` with callback `completeResearch`; timerManager.ts:27-34 fires it at expiry; bonus reaches resourceRates through derived.ts:26-33; recorded Verify (`test -f`, T008 Log: pass exit 0) cannot check this → reviewer-supplied: temp test reviewerWave2Temp.test.ts "timer expiry completes research and the bonus reaches derived rates" passed, exit 0 (timer fire → state `completed` → materials rate ×1.1).
- ✅ Completed research unlocks dependent nodes (available state) — research.ts:85-90 flips every prereq-met `locked` node to `available` on completion; research.test.ts:63-76 (advanced_circuitry and data_compression become `available`; reviewer re-run, passed).
- ✅ Cancel research refunds 100% resources — research.ts:46-68 (refund of `def.cost` :55-57, timer unregister :59, state back to `available` :60, queue removal :63); research.test.ts:78-90 asserts an exact full refund (reviewer re-run, passed).
- ❌ Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier — found: only `resourceRate` bonuses are applied — src/core/state/derived.ts:29-30 is the sole consumer (`effect.type === 'resourceRate'`). Repo grep for `buildSpeed|researchSpeed|clanPointsMultiplier` matches only src/data/research.json:36,45,54,63 and the type union src/core/state/types.ts:124 — no code consumes those effect types: `applyResearchEffect` is an empty stub (research.ts:94-97, comment claims effects flow through derived signals), `calculateBuildTime` ignores research (buildingDefinitions.ts:60-62), and clan-point awards are flat `pointValues` with no multiplier (clanEvent.ts:53, buildings.ts:50, research.ts:40). Researching rapid_construction / quantum_computing / clan_coordination changes nothing observable.
  fix: expose completed-research effects as derived multipliers (e.g. `buildSpeedMultiplier`, `researchSpeedMultiplier`, `clanPointsMultiplier` computeds in src/core/state/derived.ts over `state.research`), consume them where build/research time is computed (buildingDefinitions.ts:60-62 and the research endTime path research.ts:33) and in `addPlayerPoints`/point-value awards (clanEvent.ts:49-56), remove or implement the applyResearchEffect stub, and add unit tests per effect type; note the repair task needs granted write scope for src/core/systems/buildingDefinitions.ts (T006's file) and src/core/systems/clanEvent.ts (T009's file) beyond T008's declared files.
- ✅ Unit tests for: prereq validation, queue, complete, cancel, bonus application, unlock chain — research.test.ts:48 (prereq validation), :33 (queue), :63 (complete), :78 (cancel), :92 (bonus application, resourceRate path), :63-76 (unlock chain); reviewer re-run: 8 passed, exit 0. (Bonus-application coverage is limited to resourceRate because the other effect types have no behavior yet — see the AC5 failure.)
- ✅ Interface: startResearch() — src/core/systems/research.ts:21.
- ✅ Interface: cancelResearch() — src/core/systems/research.ts:46.
- ✅ Interface: completeResearch() — src/core/systems/research.ts:70.
- ✅ Interface: getNodeState() — src/core/systems/research.ts:99.
- ✅ Interface: getAvailableNodes() — src/core/systems/research.ts:103 (see warnings — semantically vacuous as written).
- ✅ Interface: RESEARCH_DEFINITIONS — src/core/systems/researchDefinitions.ts:28.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5.
- ✅ Interface: TimerManager.registerTimer() — src/core/time/timerManager.ts:36.
- ✅ Interface: TimerManager.unregisterTimer() — src/core/time/timerManager.ts:40.
- ✅ Interface: TimerManager.start() — src/core/time/timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — src/core/time/timerManager.ts:20.
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: tick() — src/core/systems/resources.ts:6.
- ✅ Interface: spend() — src/core/systems/resources.ts:30.
- ✅ Interface: earn() — src/core/systems/resources.ts:45.
- ✅ Interface: getRate() — src/core/systems/resources.ts:61.
- ✅ Interface: getStorage() — src/core/systems/resources.ts:66.
- ✅ Interface: getStored() — src/core/systems/resources.ts:71.
- ✅ Interface: RESOURCE_DEFINITIONS — src/core/systems/resourceDefinitions.ts:21.
- ✅ Interface: gameState signal — src/core/state/gameState.ts:43.

Warnings (non-blocking):
- T008's Verify command (`test -f ...`, Log: pass exit 0) cannot fail once the files exist; reviewer supplied `pnpm exec tsc --noEmit` (exit 0) and the vitest runs above.
- getAvailableNodes() returns `[]` in practice: it filters `state !== 'locked'` (research.ts:15), but prereq-free nodes hydrate as `available` (gameState.ts:83) and completion flips dependents synchronously (research.ts:85-90), so no `locked` node with met prereqs is ever observable outside a completion call — tighten the contract or return `state === 'available'` nodes.
- research refund is clamped at storage caps (research.ts:55-57); "100%" holds only while below caps.

Contract violations (blocking):
- none — landing 24d83c7 changes exactly the four declared files plus `.project/tasks/T008-research-system.md` (`git show --numstat`); task-file diff only flips orchestrator-owned fields and appends Log entries; no later commit touched its files.

## T009 — Implement clan event system with AI opponent and scoring: fail

- ✅ Event starts automatically on first load, runs 7 days — fresh state carries `eventEndTime = Date.now() + 7d` and `cycle: 1` (src/core/state/gameState.ts:28,33); duration 604800000 ms (src/data/clanEvent.json:2) validated by clanEventDefinitions.ts:16-18; the clan-event timer is registered from state on boot by src/core/time/resumeTimers.ts:30-32 and by startEvent (clanEvent.ts:36); reviewer re-run `pnpm exec vitest run src/core/systems/clanEvent.test.ts` → 10 passed; clanEvent.test.ts:21-27 asserts duration = 7 days, end in the future, cycle 1.
- ✅ Player actions (build, research) award points immediately — buildings.ts:50 (`addPlayerPoints('build', pointValues.build)` at queue time) and research.ts:40; point values 50/100 (clanEvent.json:3-7); reviewer-run tests buildings.test.ts:35 (playerPoints 50) and research.test.ts:45 (playerPoints 100) passed.
- ✅ AI accumulates points passively per profile curve — clanEvent.ts:77-106 (`tickAI` + `getAIPointsRate`: early → `baseRate × (2 − progress)`, steady → `baseRate`, late → `baseRate × (0.5 + 1.5 × progress)`); profiles rusher/grinder/lateBloomer in clanEvent.json:8-12; offline accrual src/core/time/offlineCatchup.ts:59-60; reviewer-supplied temp test reviewerWave2Temp.test.ts "AI profile curves differ (early rusher vs late lateBloomer)" passed, exit 0 (rusher early > grinder > lateBloomer early; lateBloomer late > early; rusher tapers). Live-play caller gap recorded under warnings.
- ✅ Leaderboard shows Player vs AI scores updating in real-time — clanEvent.ts:108-114 returns both clans from live state; player score updates synchronously through `addPlayerPoints` + `touch()` (clanEvent.ts:49-56) so the signal-driven view updates immediately; clanEvent.test.ts:137-146 (reviewer-run, passed). Display rendering belongs to the Clan Event tab (PLAN.md:82-100, T012) — see warnings.
- ✅ Point log shows source breakdown (build: +50, research: +100, etc.) — `pushLog` clanEvent.ts:13-24 records `{timestamp, clan, source, amount}`; sources `build` +50 / `research` +100 wired at buildings.ts:50 and research.ts:40 against clanEvent.json:3-7; `produce` (clanEvent.ts:64-75), `passive` (:88), cancels (:79, :64), `event_end` (:146); clanEvent.test.ts:43-60 asserts per-source log entries (reviewer-run, passed).
- ✅ Event end triggers results modal with winner and rewards — clanEvent.ts:129-148 resolves winner, records `lastResults` with winner, points and reward (currency + speedups) and `claimEventResults` (:151-169) applies them; clanEvent.test.ts:89-119 (reviewer-run, passed) asserts winner, rewards and claim. Modal rendering is the Clan Event tab's job (PLAN.md:99, T012) — see warnings.
- ✅ Next event auto-starts after resolution — clanEvent.ts:144 `startEvent()` inside `checkEventEnd` resets scores/log and schedules the next 7-day cycle + timer (:29-36); clanEvent.test.ts:89-105 asserts `cycle === 2` and a future `eventEndTime` (reviewer-run, passed).
- ✅ Offline catch-up (T004) advances AI points and checks event end — src/core/time/offlineCatchup.ts:59-60 (`aiPoints += aiRate × elapsedSec`, capped with the 24h elapsed clamp :24) and :63-64 (`checkEventEnd(now)`); reviewer re-run `pnpm exec vitest run src/core/time/offlineCatchup.test.ts` → 6 passed, exit 0; offlineCatchup.test.ts:35-52 (AI points follow `AI_POINTS_PER_SEC × capped elapsed`) and :107-122 (event ended while offline → results recorded, next cycle starts).
- ❌ Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — found: coverage exists for event start (clanEvent.test.ts:21,:29), point sources (:43,:121), event end (:83,:89), rewards (:107) and offline catch-up (offlineCatchup.test.ts:35-52,:107-122; reviewer re-run, 6 passed), but **AI profiles** are not actually tested: the test titled "tickAI accrues points for every profile" (clanEvent.test.ts:62-71) exercises only the single default profile (`grinder`, from createInitialState gameState.ts:31) and never varies `aiProfile`; repo grep for `rusher|lateBloomer|profile` across `*.test.ts` matches no product test, so the distinct curve math in clanEvent.ts:96-104 (rusher front-loaded taper, lateBloomer back-loaded surge) has zero assertions.
  fix: parametrize the AI test over rusher/grinder/lateBloomer in src/core/systems/clanEvent.test.ts, asserting early-event accrual order (rusher > grinder > lateBloomer) and that lateBloomer's late-event accrual exceeds its early accrual while rusher's tapers (the reviewer's temp test in this sidecar shows the exact assertions), retitle the existing misleading test, then re-run `pnpm exec vitest run src/core/systems/clanEvent.test.ts`.
- ✅ Interface: startEvent() — src/core/systems/clanEvent.ts:26.
- ✅ Interface: addPlayerPoints() — src/core/systems/clanEvent.ts:49.
- ✅ Interface: tickAI() — src/core/systems/clanEvent.ts:77.
- ✅ Interface: getLeaderboard() — src/core/systems/clanEvent.ts:108.
- ✅ Interface: getPointLog() — src/core/systems/clanEvent.ts:116.
- ✅ Interface: checkEventEnd() — src/core/systems/clanEvent.ts:129.
- ✅ Interface: getTimeRemaining() — src/core/systems/clanEvent.ts:120.
- ✅ Interface: CLAN_EVENT_CONFIG — src/core/systems/clanEventDefinitions.ts:33.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5.
- ✅ Interface: TimerManager.registerTimer() — src/core/time/timerManager.ts:36.
- ✅ Interface: TimerManager.unregisterTimer() — src/core/time/timerManager.ts:40.
- ✅ Interface: TimerManager.start() — src/core/time/timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — src/core/time/timerManager.ts:20.
- ✅ Interface: gameState signal — src/core/state/gameState.ts:43.
- ✅ Interface: clanEvent state — src/core/state/types.ts:76 (`clanEvent: ClanEvent`), initial values gameState.ts:27-36.

Warnings (non-blocking):
- T009's Verify command (`test -f ...`, Log: pass exit 0) cannot fail once the files exist; reviewer supplied `pnpm exec tsc --noEmit` (exit 0) plus the vitest runs above.
- No production caller invokes `tickAI` during a live session (repo grep: clanEvent.ts + tests only) — while the tab is open, AI points advance only after the next load's offline catch-up; whether the per-second game loop belongs to T014/T012 is unstated. Same for AC1's "on first load": `main.ts` is still the T001 scaffold, so boot wiring (loadGame → applyOfflineProgress → resumeTimers → timerManager.start) has no caller yet — AC1/AC4/AC6 were judged at system level because PLAN.md assigns boot and the Clan Event tab to T012/T014 (PLAN.md:82-100,175); tighten the criteria if a systems wave must own wiring.
- Point-log coalescing merges same-source entries within 60s and caps the log at 100 entries (clanEvent.ts:16-23); source attribution is preserved but the breakdown view will show merged amounts.

Contract violations (blocking):
- none — landing b77da43 changes exactly the four declared files plus `.project/tasks/T009-clan-event-system.md` (`git show --numstat`); task-file diff only flips orchestrator-owned fields and appends Log entries; no later commit touched its files.

## Summary for orchestrator

- blocked findings (three disjoint file scopes, one fix task per scope):
  - Scope A — T006, `src/core/systems/buildings.test.ts`: AC7 "Unit tests for: queue, complete, cancel, cost scaling, time scaling, slot limits" — cost-scaling and time-scaling tests absent (calculateCost tested only at level 0; calculateBuildTime untested). Repair: add the two scaling tests; re-run the task's vitest file.
  - Scope B — T008, `src/core/systems/research.ts` plus consumers `src/core/state/derived.ts`, `src/core/systems/buildingDefinitions.ts`, `src/core/systems/clanEvent.ts`: AC5 — only `resourceRate` effects are applied; `buildSpeed`, `researchSpeed`, `clanPointsMultiplier` have no consumer anywhere (applyResearchEffect stub research.ts:94-97). Repair needs granted write scope beyond T008's declared files (T006/T009 own two of them).
  - Scope C — T009, `src/core/systems/clanEvent.test.ts`: AC9 — no test exercises the rusher/lateBloomer profile curves (clanEvent.test.ts:62-71 covers only the default `grinder` profile despite its title). Repair: parametrize the AI-profile tests; re-run vitest.
  - T007 passes in full; no task in this wave owns an INTENT success criterion (Intent coverage section omitted).
- repeat offenders: none — cycle 1 (no previous wave-2 review).
- warnings worth a human eye: all four Verify commands are `test -f` file-existence checks that cannot fail — they concealed T006's missing tests and can conceal future regressions (consider mandating `pnpm exec tsc --noEmit` plus the task's own vitest file in core-module Verifies); no production caller exists for `resources.tick(deltaSec)` or `tickAI` (per-second loop owner unstated, likely T014); T008 `getAvailableNodes()` returns `[]` in practice; refunds are clamped at storage caps so "100%" holds only below caps; T009 AC1/AC4/AC6 were judged at system level because boot wiring and modal display belong to T012/T014 per PLAN; reviewer-supplied evidence lives in this sidecar only, including the untracked temp file `src/core/systems/reviewerWave2Temp.test.ts` (sidecar-only, not product — do not transfer).
