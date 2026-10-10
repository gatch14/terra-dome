# Review — wave 3, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T010 — Implement Base tab UI with building grid, resource counters, build queue: fail

- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot
- ✅ Resource counters display current amounts, animate on change, show +X/s rates
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS)
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates
- ✅ Click queued item → cancel button → refunds resources, removes from queue
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal
- ✅ Reload page → all state restored (buildings, queue, resources)
- ✅ Interface contract: BaseScreen exports `renderBaseTab`
- ✅ Interface contract: BuildingGrid, ResourceCounters, BuildQueue, BuildingSlot, format

Warnings (non-blocking):
- None

Contract violations (blocking):
- ❌ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — BuildingSlot lacks tabindex/focus management; no keyboard handler in BuildingGrid or BaseScreen
- ❌ Timer reaches 0 → building appears on grid, level increases, rate updates — BuildQueue timer uses setInterval with local Date.now() delta; drifts on tab background, no visibilitychange handling
- ❌ Reload page → all state restored — BuildingSlot serializes full Building object with non-serializable methods; Zod parse may silently drop
- ❌ Resource counters display current amounts — ResourceCounters lacks aria-live="polite" for screen reader announcements
- ❌ Build queue shows item with progress bar — BuildQueue tooltip uses innerHTML with unescaped building name (XSS vector)
- ❌ Base tab loads — BuildingGrid 25 slots × 4 signal subscriptions = 100 subscriptions; no virtualization, formatNumber creates new Intl.NumberFormat per call

## T011 — Implement Research tab UI with tech tree and research queue: fail

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

Warnings (non-blocking):
- None

Contract violations (blocking):
- ❌ Click available node → confirmation → starts research, adds to queue — implementation starts research directly without confirmation step
- ❌ Keyboard: Arrow keys navigate nodes, Enter confirms, Escape closes — no keyboard navigation between ResearchNode elements implemented
- ❌ Timer reaches 0 → research marked complete — ResearchQueue uses setInterval drift pattern; no visibilitychange handling
- ❌ ResearchNode shows name, cost, prerequisites — ResearchNode clickable div without role="button", tabindex, aria-pressed for queued state
- ❌ Research tab loads — TechTree re-renders full SVG on every researchData change; no memo on ResearchNode; ResearchCategory creates new Map per render
- ❌ Reload page → all research state restored — TechTree researchData signal and completedResearch derived signal race on concurrent queue start/complete; ResearchNode mutates gameState.research.queue directly without transaction guard

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: fail
- ❌ BuildingGrid creates 25 slots × 4 signal subscriptions without virtualization and formatNumber allocates a new Intl.NumberFormat per call — wave 3 cycle 1 adversarial finding for T010.

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: fail
- ❌ ResourceCounters lacks aria-live="polite", so resource changes are not announced to screen readers — wave 3 cycle 1 adversarial finding for T010.

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: fail
- ❌ TechTree re-renders the full SVG on every researchData change and ResearchNode mutates gameState.research.queue without a transaction guard — wave 3 cycle 1 adversarial findings for T011.
