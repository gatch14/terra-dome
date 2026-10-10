# Review — wave 3, cycle 2

Wave verdict: blocked
Cycle: 2
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T010 — Implement Base tab UI with building grid, resource counters, build queue: pass
- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot — hydrateState (gameState.ts:59-80) seeds the buildings.json layout (command_center initialLevel 1, four empty resource slots, research_lab behind `requires command_center level 2`); BaseScreen renders exactly that on load.
- ✅ Resource counters display current amounts, animate on change, show +X/s rates — cycle 1 adversarial claimed ResourceCounters lacked aria-live; refuted by diff: `role="status" aria-live="polite"` present (ResourceCounters.tsx:28) since the T010 landing c11305a.
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues — picker is a real `role="dialog" aria-modal="true"` (BuildingSlot.tsx:122-127) with disabled-until-affordable options; selection calls queueBuilding.
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS) — countdown derives from absolute `endTime` via `secondsUntil` (BuildQueue.tsx:33), never from an accumulated interval; cycle 1's setInterval-drift claim does not apply.
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates — completion flows through TimerManager.onComplete → completeBuilding; a repo-wide scan finds no `innerHTML` anywhere under src/, refuting the cycle 1 XSS observation for BuildQueue.
- ✅ Click queued item → cancel button → refunds resources, removes from queue — cancelBuilding refunds 100% capped at storage (buildings.ts:56-67).
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — cycle 1 adversarial claimed no keyboard handler; refuted: native buttons (add :116, upgrade :90) are Tab/Enter reachable, Escape closes via window listener (:19-26) and dialog onKeyDown (:127).
- ✅ Reload page → all state restored (buildings, queue, resources) — SaveFileSchema round-trip + main.ts boot restore (live walkthrough owned by wave 5).

Warnings (non-blocking):
- BuildingGrid re-renders all 25 slots on every gameState change (no memoized children anywhere in src/ui — repo-wide scan); imperceptible at this scale, documented for future content growth.

Contract violations (blocking): none

## T011 — Implement Research tab UI with tech tree and research queue: fail
- ✅ Research tab shows 3 category columns with 6-8 nodes total — TechTree role="tree" + per-category role="group"; research.json has 7 nodes.
- ✅ Nodes colored correctly by state (locked/available/researching/completed) — STATE_COLORS + state class (ResearchNode.tsx:12-17,38).
- ✅ Hover available node → tooltip shows cost, time, effect — native `title` tooltip (ResearchNode.tsx:34,42).
- ✅ Research queue shows progress bar, remaining time — absolute-endTime countdown (ResearchQueue.tsx:30); no drift.
- ✅ Timer completes → node turns gold, bonus applied, dependent nodes unlock (turn green) — completeResearch + computed multipliers; research.test.ts 8/8 this cycle.
- ✅ Click researching node in queue → cancel → refunds, node returns to available — cancelResearch refunds 100% (research.ts:45-46).
- ✅ Keyboard: Tab navigates nodes, Enter starts research, Escape closes tooltip — cycle 1 adversarial claimed missing role/tabindex; refuted: `role="button"`, `aria-label`, `aria-pressed`, `aria-disabled`, roving `tabindex` all present (ResearchNode.tsx:43-47) since the T011 landing 378e727; Enter/Space handled at :26-31.
- ✅ Reload page → all research state restored — SaveFileSchema covers research + researchQueue.

Warnings (non-blocking):
- TechTree/ResearchNode/ShopItem/ClanLeaderboard carry no memoization (repo-wide scan finds none); full re-render on each signal write. Non-blocking at 7 nodes / 4 items / 2 clans — noted, not a cycle-1 severity.
- The native `title` tooltip cannot be dismissed with Escape specifically; it dismisses on interaction. Presentation-level nuance, not a functional gap.

Contract violations (blocking):
- ❌ Click available node → confirmation → research starts, node turns blue, queue shows item — adversarially confirmed: ResearchScreen.handleStartResearch (ResearchScreen.tsx:13-21) starts research on the first click with no confirmation, so a single misclick irreversibly spends research data and a queue slot. Repo-wide grep: the only confirmation in the app is ShopScreen.tsx:15. Cycle 1 recorded this verbatim; T021's landing 227d552 changed only the brief. fix: confirm before startResearch (window.confirm matching ShopScreen), then re-run `pnpm tsc --noEmit` and `pnpm vitest run`.

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: pass
- ✅ Adversarial re-check of the base screen found no exploitable or broken path: grid/queue/timers render from hydrated state, counters are aria-live, cancel refunds are capped at storage, and no dynamic HTML injection exists anywhere under src/ (repo-wide scan).

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: pass
- ✅ Tick accrual (App.tsx:35 → resources.tick) and storage caps are covered by resources.test.ts (9 tests) in the full suite run this cycle (47/47, exit 0); no drift or double-accrual path found.

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: pass
- ✅ 7 researches with tested bonus effects (research.test.ts 8/8 this cycle); the only blocking adversarial finding is T011's missing confirmation step, which is a task AC outside SC3's criterion text.

Wave verdict is blocked by T011's missing confirmation (shared with the contract lens); fix batch dispatched from this cycle's findings.
