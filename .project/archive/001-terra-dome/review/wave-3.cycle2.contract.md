# Review — wave 3, cycle 2

Wave verdict: blocked
Cycle: 2
Depth: deep
Tasks reviewed: 2
Lens: contract

## T010 — Implement Base tab UI with building grid, resource counters, build queue: pass
- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot — hydrateState (gameState.ts:59-80) fills the buildings.json slot layout (command_center with initialLevel 1, resource_1-4 empty, research_lab `requires command_center level 2` → locked) and BaseScreen/BuildingGrid renders `gameState.buildings` from it.
- ✅ Resource counters display current amounts, animate on change, show +X/s rates — ResourceCounters renders with `role="status" aria-live="polite"` (ResourceCounters.tsx:28) reading `gameState.resources` and the `resourceRates` derived signal; values update on signal change with a `+X/s` suffix.
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues — BuildingSlot's add button (:116) opens the picker dialog (:121-131) listing every resource-slot option with name, category (Resource Production / Storage / Energy Reactor), cost and build time (:150-159); selecting one calls `onQueue` → `queueBuilding`.
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS) — BuildQueue rows render a progress bar and countdown from `secondsUntil(item.endTime)` (BuildQueue.tsx:33), derived from absolute endTime.
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates — App's 1s tick runs `timerManager.tick(now)` (App.tsx:36) → `completeBuilding` sets level+1; the `resourceRates` computed recomputes so counters jump immediately.
- ✅ Click queued item → cancel button → refunds resources, removes from queue — cancel button calls `cancelBuilding`, which refunds 100% of materials/energy capped at storage limits (buildings.ts:56-67) and removes the entry from `buildingQueue`.
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — slots expose native buttons (add :116, upgrade :90, cancel :91) so Tab/Enter work natively; Escape closes the picker via the window keydown listener (:19-26) and the dialog's `onKeyDown` (:127).
- ✅ Reload page → all state restored (buildings, queue, resources) — buildings, buildingQueue (absolute endTime) and resources are SaveFileSchema fields (schema.ts); main.ts:21-26 loadGame + hydrateState + offline catch-up restore them on boot (live walkthrough evidence is owned by wave 5 / T014).
- ✅ Interface contract: BaseScreen exports `renderBaseTab` — src/ui/screens/BaseScreen.tsx exports the screen component consumed by App's tab switch (App.tsx:19).
- ✅ Interface contract: BuildingGrid, ResourceCounters, BuildQueue, BuildingSlot, format — all present under src/ui/components/ and src/ui/utils/format.ts, imported by BaseScreen.
- ✅ Reviewer re-run this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` full suite 47/47 exit 0.

Warnings (non-blocking):
- Cycle 1's contract lens recorded T010 pass while listing blocking violations; this cycle resolves the contradiction: every AC re-checked against current code, all pass. The cycle 1 observations about missing keyboard handling and setInterval drift were not reproducible (native buttons and absolute-endTime countdowns were present from the T010 landing).

Contract violations (blocking): none

## T011 — Implement Research tab UI with tech tree and research queue: fail
- ✅ Research tab shows 3 category columns with 6-8 nodes total — TechTree renders `role="tree"` (TechTree.tsx:17) with a ResearchCategory group per category (`role="group"`, ResearchCategory.tsx:19); src/data/research.json defines 7 researches (within 6-8).
- ✅ Nodes colored correctly by state (locked/available/researching/completed) — STATE_COLORS map (ResearchNode.tsx:12-17) applied via `class={`research-node ${state}`}` (:38).
- ✅ Hover available node → tooltip shows cost, time, effect — `title={tooltip}` (ResearchNode.tsx:42) built at :34 from materials/energy/researchData cost, `formatTimeShort(time)` and the effect label.
- ✅ Research queue shows progress bar, remaining time — ResearchQueue rows render progress and `secondsUntil(item.endTime)` (ResearchQueue.tsx:30) against absolute endTime.
- ✅ Timer completes → node turns gold, bonus applied, dependent nodes unlock (turn green) — `completeResearch` sets state completed (gold via STATE_COLORS), `resourceRates`/`buildSpeed` computed pick up the multipliers, and hydration marks prereq-met nodes available; research.test.ts (8 tests) covers bonuses and dependent unlocks — suite run this cycle: pass.
- ✅ Click researching node in queue → cancel → refunds, node returns to available — `cancelResearch` refunds 100% of the research cost (research.ts:45-46); ResearchScreen's cancel handler (ResearchScreen.tsx:23-27) wires it to the queue.
- ✅ Keyboard: Tab navigates nodes, Enter starts research, Escape closes tooltip — roving `tabindex={isAvailable ? 0 : -1}` (ResearchNode.tsx:43) puts available nodes in the Tab order; Enter/Space handled at :26-31; the tooltip is the native `title` attribute, which browsers dismiss on any pointer or keyboard interaction (no persistent overlay needs escaping).
- ✅ Reload page → all research state restored — research node states, researchQueue (absolute endTime) are SaveFileSchema fields; main.ts:21-26 restores them on boot.

Warnings (non-blocking):
- TechTree and ResearchNode are not memoized, so the tree re-renders on every gameState change; at 7 nodes this is imperceptible (adversarial lens carries it as a warning too).
- Escape-to-dismiss applies to the native `title` tooltip semantics rather than a custom overlay; acceptable, documented.

Contract violations (blocking):
- ❌ Click available node → confirmation → research starts, node turns blue, queue shows item — ResearchScreen.handleStartResearch (ResearchScreen.tsx:13-21) calls `startResearch(nodeId)` directly: no confirmation step exists anywhere between click and start (repo-wide, the only confirmation dialog is ShopScreen.tsx:15 for purchases). Node color and queue work; the confirmation is missing. Cycle 1 named this finding verbatim, and fix task T021's landing 227d552 changed only its brief — no product code. fix: add a confirmation before `startResearch` in handleStartResearch (window.confirm matching the ShopScreen pattern), then re-run `pnpm tsc --noEmit` and `pnpm vitest run`.

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: pass
- ✅ Grid renders Command Center Lv.1, 4 resource slots and a research-locked lab from the buildings.json slot layout (gameState.ts:59-80, BuildingGrid/BaseScreen), with BuildQueue rows and TimerManager absolute-endTime countdowns for every queued build.

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: pass
- ✅ App's 1s tick calls `tick(deltaSec)` (App.tsx:35) which accrues materials/energy/researchData from `resourceRates` (derived from building levels and research); resources.test.ts (9 tests) passes in the full suite run this cycle.

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: pass
- ✅ research.json defines 7 researches; TechTree/ResearchCategory/ResearchNode render the visible tree; research.test.ts (8 tests) proves bonuses modify resourceRates, buildSpeed and researchSpeed — full suite 47/47 exit 0 this cycle. (The T011 confirmation-step violation is a task AC, outside SC3's text.)

Wave verdict is blocked solely by T011's missing confirmation step (contract and adversarial lenses agree); fix batch dispatched from this cycle's findings.
