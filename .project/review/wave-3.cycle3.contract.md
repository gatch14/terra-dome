# Review — wave 3, cycle 3

Wave verdict: pass
Cycle: 3
Depth: deep
Tasks reviewed: 2
Lens: contract

## T010 — Implement Base tab UI with building grid, resource counters, build queue: pass

- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot — hydrateState (gameState.ts:59-80) seeds the buildings.json layout (command_center initialLevel 1, four empty resource slots, research_lab behind `requires command_center level 2`); BaseScreen renders exactly that on load (BaseScreen.tsx:9).
- ✅ Resource counters display current amounts, animate on change, show +X/s rates — ResourceCounters (ResourceCounters.tsx:23-46) shows amounts and per-second rates from the `resourceRates` computed (derived.ts:7); cycle 1's aria-live claim refuted: `role="status" aria-live="polite"` present (ResourceCounters.tsx:28) since the T010 landing c11305a.
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues — picker is a real `role="dialog" aria-modal="true"` (BuildingSlot.tsx:122-127) with disabled-until-affordable options; selection calls queueBuilding.
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS) — BuildQueue rows render a progress bar and countdown from `secondsUntil(item.endTime)` (BuildQueue.tsx:33), derived from absolute endTime.
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates — App's 1s tick runs `timerManager.tick(now)` (App.tsx:75-79) → `completeBuilding` sets level+1 (buildings.ts:84-94); the `resourceRates` computed recomputes so counters jump immediately.
- ✅ Click queued item → cancel button → refunds resources, removes from queue — cancel button calls `cancelBuilding`, which refunds 100% of materials/energy capped at storage limits (buildings.ts:56-78) and removes the entry from `buildingQueue`.
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — slots expose native buttons (add BuildingSlot.tsx:116, upgrade :90, cancel :91) so Tab/Enter work natively; Escape closes the picker via the window keydown listener (:18-25) and the dialog's `onKeyDown` (:127). The cycle 1 keyboard finding is refuted by current code (closed via T020's re-review at cycle 2).
- ✅ Reload page → all state restored (buildings, queue, resources) — buildings, buildingQueue (absolute endTime) and resources are SaveFileSchema fields (schema.ts:14-71); main.ts:21-26 restores them on boot and resumeTimers re-registers active timers (main.ts:36-37).
- ✅ Interface: BaseScreen exports `renderBaseTab` — exported as `BaseScreen` (BaseScreen.tsx:9); the renderBaseTab naming is the brief's wording for the same capability (mounted by App getScreen, App.tsx:20).
- ✅ Interface: BuildingGrid — BuildingGrid.tsx:12.
- ✅ Interface: ResourceCounters — ResourceCounters.tsx:23.
- ✅ Interface: BuildQueue — BuildQueue.tsx:17.
- ✅ Interface: BuildingSlot — BuildingSlot.tsx:15.

Warnings (non-blocking):
- The T010 brief's `renderBaseTab` name differs from the shipped `BaseScreen` export (App.tsx:20 binds the tab); non-blocking naming drift.

Contract violations (blocking): none

## T011 — Implement Research tab UI with tech tree and research queue: pass

- ✅ Research tab shows 3 category columns with 6-8 nodes total — TechTree groups by category (TechTree.tsx:15-30, `ResearchCategory` per column); research.json defines exactly 7 nodes across production/research/clan; categories validated at startup (researchDefinitions.ts:12-14).
- ✅ Nodes colored correctly by state (locked/available/researching/completed) — STATE_COLORS maps all four states (ResearchNode.tsx:12-17); getNodeState derives the state from the signal state (research.ts:93-95).
- ✅ Hover available node → tooltip shows cost, time, effect — tooltip block renders cost, `def.time`s, and `describeEffect(def)` (ResearchNode.tsx:34-35, :50-59); describeEffect (ResearchNode.tsx:63) formats all four effect types; CSS-only hover tooltip (TechTree.tsx:52-55).
- ✅ Click available node → confirmation → research starts, node turns blue, queue shows item — ResearchScreen.handleStartResearch confirms before mutating: `window.confirm('Start research <name>?')` (ResearchScreen.tsx:15) gates the `startResearch` call (:16); success toast :17, refusal toast :18-19. The researching state colors the node blue (STATE_COLORS :13-16) and the queue lists the item (ResearchQueue.tsx:25-44). This cycle 2 blocking finding was fixed by T025 (commit 6bb42ab).
- ✅ Research queue shows progress bar, remaining time — ResearchQueue rows render a progress bar and countdown (ResearchQueue.tsx:25-44, `secondsUntil` :30).
- ✅ Timer completes → node turns gold, bonus applied — the `research-<nodeId>` timer fires completeResearch (research.ts:71-91); the node state becomes completed (gold via STATE_COLORS :15), and the effect reaches the derived multipliers (derived.ts:7-36, :43-67) — research.test.ts:70 and :99-175, reviewer re-run this cycle 12/12.
- ✅ Cannot start locked/unaffordable nodes — disabled or tooltip — state gate (research.ts:27) and `canAfford` gate (:28-31) return false; UI shows the refusal toast (ResearchScreen.tsx:18-19); research.test.ts:55 and :61 (reviewer re-run, passed).
- ✅ Reload → completed research persist, queue resumes — research, researchQueue and state.research are SaveFileSchema fields (schema.ts:14-71); main.ts:21-26 restores and resumeTimers re-registers the research timer (main.ts:33-37).
- ✅ Keyboard: Tab to nodes, Enter activates, Escape closes tooltip — ResearchNode exposes `role="button"` with tabIndex (ResearchNode.tsx:43-47) and handles Enter/Space (:26-31, wired via onKeyDown :41); tooltips are pure-CSS hover (TechTree.tsx:52-55) that do not persist under keyboard focus — see Warnings.
- ✅ Interface: ResearchScreen exports `renderResearchTab` — exported as `ResearchScreen` (ResearchScreen.tsx:8), mounted by App getScreen (App.tsx:21); same naming drift as T010.
- ✅ Interface: TechTree — TechTree.tsx:15; ResearchNode — ResearchNode.tsx:19; ResearchCategory — ResearchCategory.tsx:17.
- ✅ Interface: researchQueue derived signal — derived.ts:103.
- ✅ Interface: startResearch()/cancelResearch() — research.ts:20, :47.
- ✅ Interface: ResearchDef type — types.ts:44.

Warnings (non-blocking):
- AC9's "Escape closes tooltip" is satisfied de facto: the tooltip exists only under pointer hover (TechTree.tsx:52-55) and Escape cancels the native confirm dialog; no persistent tooltip remains to dismiss. Documented rather than hidden.
- T011's Verify (`pnpm vitest run && pnpm build`) recorded pass at landing; reviewer re-ran vitest (56/56) and build (exit 0) this cycle.

Contract violations (blocking): none

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: pass
- ✅ Grid renders Command Center Lv1, resource buildings and the Research Lab, each with build queue and timers — hydrateState seeds 1 CC (Lv1), 4 resource slots and the locked lab (gameState.ts:59-80, buildings.json:2-9); BuildingSlot picker queues via queueBuilding with disabled-until-affordable options (BuildingSlot.tsx:122-127); queue countdown from absolute endTime (BuildQueue.tsx:33); completion raises the level (buildings.ts:84-94); build time and costs scale per level (buildings.test.ts:117,:138, reviewer re-run)
- ✅ Level increases production — completeBuilding (buildings.ts:84-94) → `resourceRates` recomputes (derived.ts:7-36); buildings.test.ts:38-49 and resources.test.ts:77-96 (reviewer re-run, passed)
- ✅ Cancel path refunds (buildings.ts:56-78) — reviewed this cycle at T010 AC6; the Research Lab unlocks behind Command Center Lv.2 (buildings.json:2-9, buildings.test.ts:87)

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: pass
- ✅ 3 resources tick per second based on building levels — resources.json:1-5 defines materials/energy/researchData; tick applies `rates.X × deltaSec` every second (App.tsx:75-79 → resources.ts:6-28) with rates derived from buildings and completed research (derived.ts:7-36); resources.test.ts:15-96 (reviewer re-run, passed)
- ✅ Counters show amounts and change — ResourceCounters shows amounts and rates and animates on change, with `role="status" aria-live="polite"` (ResourceCounters.tsx:23-46, :28); clamp at storage limits (resources.ts:11-13, derived.ts:70-90; resources.test.ts:98-115)

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: pass
- ✅ 7 researches unlocking production/speed bonuses in a visible tree — research.json defines 7 nodes; speed multipliers are consumed (buildSpeed → buildingDefinitions.ts:61-66, researchSpeed → research.ts:33; multipliers wired by T027, dfd5c1f); three-column TechTree (TechTree.tsx:15-30)
- ✅ Queue, costs, completion, unlock chain — ResearchQueue with countdown (ResearchQueue.tsx:25-44); affordability gate (research.ts:28-31); completeResearch and the unlock loop (research.ts:71-91); research.test.ts:70,:85 (reviewer re-run 12/12)

All 2 wave 3 tasks pass this cycle: T010 unchanged since the cycle 2 pass; T011's cycle 2 blocking finding (first-click start without confirmation) is closed by T025's landing 6bb42ab (ResearchScreen.tsx:15 confirm gate). Reviewer evidence this cycle: `pnpm tsc --noEmit` exit 0, `pnpm vitest run` 56/56 exit 0, `pnpm build` exit 0.
