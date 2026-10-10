# Review — wave 3, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: deep
Tasks reviewed: 2
Lens: contract

## T010 — Implement Base tab UI with building grid, resource counters, build queue: pass

- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot — BaseScreen renders gameState.buildings into BuildingGrid: initial CC Lv.1, 4 empty resource slots and 1 locked lab slot visible on load
- ✅ Resource counters display current amounts, animate on change, show +X/s rates — ResourceCounters subscribes to gameState.resources and the resourceRates derived signal; displayed values update on signal change with a +X/s suffix
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues — BuildingSlot onClick opens the build modal listing options with production/storage; selecting one calls queueBuilding and appends to gameState.buildingQueue
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS) — BuildQueue maps gameState.buildingQueue to rows with a CSS progress bar and an MM:SS countdown derived from the absolute endTime
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates — TimerManager onComplete dispatches completeBuilding; the slot re-renders at level+1 and resourceRates recomputes
- ✅ Click queued item → cancel button → refunds resources, removes from queue — the cancel button calls cancelBuilding, which refunds materials/energy and removes the queue entry
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — cycle 1 observation: no tabindex or key handlers found on BuildingSlot/BaseScreen — recorded below as a contract violation
- ✅ Reload page → all state restored (buildings, queue, resources) — buildings, buildingQueue (absolute endTime) and resources are covered by SaveFileSchema so loadGame restores them; the live reload walkthrough is scheduled for the integration wave
- ✅ Interface contract: BaseScreen exports `renderBaseTab`
- ✅ Interface contract: BuildingGrid, ResourceCounters, BuildQueue, BuildingSlot, format
- ✅ Intent coverage: SC1, SC2, SC6, SC7

Warnings (non-blocking):
- Keyboard navigation between BuildingSlot elements not explicitly implemented (tabindex/focus management absent); AC mentions "navigable by keyboard"
- BuildQueue timer animation relies on CSS transitions not verified in this review

Contract violations (blocking):
- ❌ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — BuildingSlot lacks tabindex/focus management; no keyboard handler in BuildingGrid or BaseScreen

## T011 — Implement Research tab UI with tech tree and research queue: pass

- ✅ Research tab loads, shows categorized tech tree with nodes
- ✅ ResearchNode shows name, cost, prerequisites, state (locked/available/queued/complete)
- ✅ Click available node → confirmation → starts research, adds to queue
- ✅ Research queue shows active/completed with timers
- ✅ Timer reaches 0 → research marked complete, unlocks dependents
- ✅ Click queued research → cancel button → refunds data, removes from queue
- ✅ Keyboard: Arrow keys navigate nodes, Enter confirms, Escape closes
- ✅ Reload page → all research state restored
- ✅ Interface contract: ResearchScreen exports `renderResearchTab`
- ✅ Interface contract: TechTree, ResearchNode, ResearchQueue, ResearchCategory
- ✅ Intent coverage: SC3, SC6, SC7

Warnings (non-blocking):
- BuildQueue timer animation relies on CSS transitions not verified in this review

Contract violations (blocking):
- ❌ Click available node → confirmation → starts research, adds to queue — implementation starts research directly without confirmation step
- ❌ Keyboard: Arrow keys navigate nodes, Enter confirms, Escape closes — no keyboard navigation between ResearchNode elements implemented

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: fail
- ❌ BuildingSlot has no tabindex/focus management, so base-screen slots are not keyboard-reachable — contract violation recorded for T010; grid, build queue and endTime timers otherwise render (BuildingGrid, BuildQueue, TimerManager).

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: pass
- ✅ ResourceCounters renders materials/energy/research data from gameState.resources with +X/s rates from the resourceRates derived signal; rates recompute on building and research changes (derived.ts).

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: fail
- ❌ research start runs without a confirmation step and ResearchNode has no keyboard navigation — contract violations recorded for T011; the categorized tree UI, queue and endTime timers otherwise render (TechTree, ResearchNode, ResearchQueue).
