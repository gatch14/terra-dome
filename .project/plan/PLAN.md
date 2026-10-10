# Plan — Terra Dome

Project verify: `pnpm install --frozen-lockfile && pnpm vitest run && pnpm build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — Risk Burn-down

Goal: Prove core infrastructure works — Vite + TypeScript + Preact Signals + IndexedDB persistence + timer system with offline catch-up + absolute endTime rendering. If this fails, architecture choices are invalid.

Review depth: full

## Wave 2 — Walking Skeleton

Goal: End-to-end slice runs — index.html loads, resources tick, build queue processes, research starts, clan event timer runs, shop purchase applies effect, reload restores all state.

Review depth: full

## Wave 3 — Core Gameplay Systems

Goal: All buildings, resources, and tech tree functional with data-driven definitions.

Review depth: deep

## Wave 4 — Clan Event & Shop

Goal: Weekly clan event with AI opponent + shop with consumables fully integrated.

Review depth: deep

## Wave 5 — Polish & Integration

Goal: All 7 INTENT.md success criteria verified, UI polished, edge cases handled.

Review depth: verify-only

## Surface contract

### Base Tab — T010

Criteria: SC1, SC2
Entry: Open index.html → Base tab active by default
States:
- Empty: No buildings placed yet, only Command Center Lv.1 visible
- Loading: Spinner while IndexedDB loads save
- Error: Toast "Failed to load save" + "Start fresh" button
- Success: Building grid with Command Center, resource buildings, research lab; resource counters animating; build queue visible

Walkthrough:
1. Open index.html in browser
2. Verify Base tab shows Command Center Lv.1, 4 empty resource slots, Research Lab locked
3. Click empty slot → select "Resource Production" → confirm → building added to queue
4. Verify queue shows building with countdown timer
5. Wait for timer → verify building appears on grid, resource rate increases
6. Verify resource counters tick up per second
7. Reload page → verify all state restored (building, queue position, resources, rates)

### Research Tab — T011

Criteria: SC3
Entry: Click Research tab
States:
- Empty: No research started, tree shows locked/available nodes
- Loading: Spinner while research data loads
- Error: Toast "Failed to load research tree"
- Success: Tree view with categories (Production, Research, Clan), nodes colored by state

Walkthrough:
1. Click Research tab
2. Verify tree shows 6-8 nodes across 3 categories
3. Click available node (no prereqs) → confirm → research starts
4. Verify node shows "Researching" with timer, queue shows research item
5. Wait for timer → verify node shows "Completed", bonus appears in resource rates
6. Verify locked nodes with completed prereqs become available
7. Reload page → verify research progress and bonuses restored

### Clan Event Tab — T012

Criteria: SC4
Entry: Click Clan Event tab
States:
- Empty: Event not started, shows "Next event starts in X days"
- Loading: Spinner while event state loads
- Error: Toast "Failed to load clan event"
- Success: 7-day countdown, two clan scores (Player vs AI), point breakdown, AI activity log

Walkthrough:
1. Click Clan Event tab
2. Verify 7-day timer counting down
3. Verify Player clan score = 0, AI clan score > 0 (passive accumulation)
4. Perform action in Base tab (queue build) → verify Player points increase
5. Start research in Research tab → verify Player points increase
6. Verify point breakdown shows source: "Build queued: +50", "Research started: +100"
7. Wait for event end (to skip the 7-day wait: set the save's clanEvent.eventEndTime to a past timestamp via IndexedDB devtools) → verify results modal shows winner
8. Reload page → verify event timer, scores, and cycle state restored

### Shop Tab — T013

Criteria: SC5
Entry: Click Shop tab
States:
- Empty: No currency, shows "Earn currency by playing"
- Loading: Spinner while shop loads
- Error: Toast "Failed to load shop"
- Success: Currency balance, 4 items with prices, buy buttons

Walkthrough:
1. Click Shop tab
2. Verify currency balance displayed (starting 1000)
3. Verify 4 items: 1h Build Speedup (100), 8h Build Speedup (500), 1h Research Boost (150), Resource Pack (200)
4. Click "1h Build Speedup" → confirm purchase → verify currency -100, item added to inventory
5. Queue a building → use speedup from inventory → verify timer reduced by 1h
6. Reload page → verify currency, inventory, and active boosts restored

### Persistence — T005

Criteria: SC6
Entry: Automatic (all tabs)
States: N/A (background system)
Walkthrough:
1. Perform actions in all tabs (build, research, earn clan points, buy shop item)
2. Reload page → verify all state restored exactly
3. Close browser, wait 5 minutes, reopen → verify offline catch-up applied (resources gained, timers reduced)
4. Change system clock forward 1 hour → reload → verify catch-up capped at 24h
5. Open in second tab → perform action → switch to first tab → verify state syncs via storage event

## Wave 6 — fix wave 1 cycle 1 review findings

Goal: Repair the blocking findings of the wave 1 cycle 1 review without changing source task contracts.
Review depth: full

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T015 | Fix wave 1 cycle 1 review findings in T004 | T004 | src/core/time/offlineCatchup.test.ts, src/core/time/offlineCatchup.ts, src/core/time/resumeTimers.ts |
| T016 | Fix wave 1 cycle 1 review findings in T005 | T005 | src/core/persistence/migration.ts, src/core/persistence/persistence.ts, src/core/persistence/schema.ts |

## Wave 7 — fix wave 2 cycle 1 review findings

Goal: Repair the blocking findings of the wave 2 cycle 1 review without changing source task contracts.
Review depth: full

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T017 | Fix wave 2 cycle 1 review findings in T006 | T006 | src/core/systems/buildingDefinitions.ts, src/core/systems/buildings.test.ts, src/core/systems/buildings.ts, src/data/buildings.json |
| T018 | Fix wave 2 cycle 1 review findings in T008 | T008 | src/core/systems/research.test.ts, src/core/systems/research.ts, src/core/systems/researchDefinitions.ts, src/data/research.json |
| T019 | Fix wave 2 cycle 1 review findings in T009 | T009 | src/core/systems/clanEvent.test.ts, src/core/systems/clanEvent.ts, src/core/systems/clanEventDefinitions.ts, src/data/clanEvent.json |

## Wave 8 — fix wave 3 cycle 1 review findings

Goal: Repair the blocking findings of the wave 3 cycle 1 review without changing source task contracts.
Review depth: deep

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T020 | Fix wave 3 cycle 1 review findings in T010 | T010 | src/ui/components/BuildQueue.tsx, src/ui/components/BuildingGrid.tsx, src/ui/components/BuildingSlot.tsx, src/ui/components/ResourceCounters.tsx, src/ui/screens/BaseScreen.tsx, src/ui/utils/format.ts |
| T021 | Fix wave 3 cycle 1 review findings in T011 | T011 | src/ui/components/ResearchCategory.tsx, src/ui/components/ResearchNode.tsx, src/ui/components/ResearchQueue.tsx, src/ui/components/TechTree.tsx, src/ui/screens/ResearchScreen.tsx |

## Wave 9 — fix wave 4 cycle 1 review findings

Goal: Repair the blocking findings of the wave 4 cycle 1 review without changing source task contracts.
Review depth: deep

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T022 | Fix wave 4 cycle 1 review findings in T012 | T012 | src/ui/components/ClanLeaderboard.tsx, src/ui/components/EventResultsModal.tsx, src/ui/components/EventTimer.tsx, src/ui/components/PointLog.tsx, src/ui/screens/ClanEventScreen.tsx |
| T023 | Fix wave 4 cycle 1 review findings in T013 | T013 | src/core/systems/shop.ts, src/core/systems/shopDefinitions.ts, src/data/shop.json, src/ui/components/CurrencyDisplay.tsx, src/ui/components/Inventory.tsx, src/ui/components/ShopItem.tsx, src/ui/screens/ShopScreen.tsx |

## Wave 10 — fix wave 1 cycle 2 review findings

Goal: Repair the blocking findings of the wave 1 cycle 2 review without changing source task contracts.
Review depth: full

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T024 | Fix wave 1 cycle 2 review findings in T005 | T005 | src/core/persistence/migration.ts, src/core/persistence/persistence.ts, src/core/persistence/schema.ts, src/core/time/offlineCatchup.test.ts, src/ui/App.tsx |

## Wave 11 — fix wave 3 cycle 2 review findings

Goal: Repair the blocking findings of the wave 3 cycle 2 review without changing source task contracts.
Review depth: deep

| Task | Title | Deps | Files |
|------|-------|------|-------|
| T025 | Fix wave 3 cycle 2 review findings in T011 | T011 | src/ui/components/ResearchCategory.tsx, src/ui/components/ResearchNode.tsx, src/ui/components/ResearchQueue.tsx, src/ui/components/TechTree.tsx, src/ui/screens/ResearchScreen.tsx |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T010 | AC1 |
| SC2 | T010 | AC4 |
| SC3 | T011 | AC1 |
| SC4 | T012 | AC1 |
| SC5 | T013 | AC1 |
| SC6 | T005 | AC1 |
| SC7 | T014 | AC1 |

## Dependency notes

- T001 (project scaffold) has no deps — starts first
- T002 (core state + signals) depends on T001
- T003 (timer system) depends on T002
- T004 (offline catch-up) depends on T003
- T005 (persistence) depends on T002, T004
- T006 (building system) depends on T003, T005
- T007 (resource system) depends on T005
- T008 (research system) depends on T005, T007
- T009 (clan event system) depends on T005, T003
- T010 (Base UI) depends on T006, T007
- T011 (Research UI) depends on T008
- T012 (Clan Event UI) depends on T009
- T013 (Shop UI) depends on T005, T006
- T014 (Integration & Polish) depends on T010, T011, T012, T013

## Plan defects repaired (pre-dispatch, 2026-10-09)

All repairs were made in the build layer against INTENT.md and SYNTHESIS.md; each affected task brief also carries its own Log line.

- T001 files: added `.gitignore`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.node.json`, `src/core/state/types.ts` (undeclared or compile-required product files; the frozen pnpm install in Verify needs the lockfile and workspace config). Same-wave file overlap forbids T001/T002 sharing paths, so the final typed `gameState.ts` + `types.ts` land at T001. `persistence.ts` is owned by T005 (its ACs depend on the module end-to-end); T001's Approach and AC5 were repaired to match — `main.ts` lands as a state-only minimal bootstrap and `index.html` with 4 static tab buttons (both upgraded at T014).
- T002 files: reduced to `src/core/state/derived.ts` (`gameState.ts`/`types.ts` are owned by T001 after the overlap repair; Verify names only `derived.ts`).
- T003, T004, T006, T007, T008, T009 files: added each task's unit test file (undeclared).
- T004 files: added `src/core/time/resumeTimers.ts` (undeclared).
- T005 files: added `src/core/persistence/persistence.ts` (undeclared; the Zod-validated v2 module upgrades the T001 plain variant).
- T010 files: added `src/ui/utils/format.ts` (undeclared shared util).
- T013 files: added `src/core/systems/shopDefinitions.ts` (undeclared SHOP_DEFINITIONS loader).
- T002 Approach and T014 AC1 stated initial resources as 0, which contradicts the approved Base-tab walkthrough (step 3 queues the first building immediately; cost 200/100). Settled starting state: 500 materials, 300 energy, 0 research data, 1000 premium currency.
- Base Tab walkthrough step 2 said "2 empty building slots"; the slot model (SYNTHESIS, buildings.json) is 6 slots — 1 fixed Command Center, 4 resource slots, 1 locked lab. Corrected to "4 empty resource slots".
- Clan Event walkthrough step 7 referenced "advance time in debug", a debug mechanism no task provides. Corrected to editing the save's `clanEvent.eventEndTime` via IndexedDB devtools (the technique used in the pre-landing smoke test).
- Wave inventory (build-recovery at base b22482d): T012 and T013 were recorded as wave 3, leaving PLAN.md Wave 4 without task files and `build_state ready` rejecting the inventory. Corrected to wave 4, matching PLAN.md's Wave 4 goal "Clan Event & Shop". No other contract field changed.