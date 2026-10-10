# FINAL — Milestone 001: Terra Dome peaceful KvK strategy prototype

Reviewed HEAD: 2860f92f4fb450bb2d212d447d942454e520f134
Overall verdict: pass

## Success criteria

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers

- **Verdict**: met
- **Surface**: Base Tab
- **Check**: Performed the PLAN Base Tab walkthrough on the running app (pnpm dev, fresh browser profile): opened the app with the Base tab active by default; verified the starting grid (Command Center Lv.1, 4 empty resource slots, Research Lab slot locked); clicked an empty slot, selected Resource Production from the picker (costs and build times shown; Energy Reactor disabled while unaffordable); watched the build queue item count down (0:59 to 0:00); waited for natural completion; queued and completed a Command Center upgrade and a Resource Production upgrade; confirmed the Research Lab slot unlocks at Command Center Lv.2.
- **Observed**: The grid rendered CC Lv.1, 4 empty slots and the locked lab on first load. Queueing showed "#1 Resource Production 0:59" with a Cancel button; after 60s (buildings.json baseBuildTime 60) the building appeared as Lv.1 with an Upgrade button showing the Lv.2 cost. The CC upgrade (30s base) completed on its timer and the lab slot became an unlocked "+ Add Building" cell. A queued Resource Production Lv.2 upgrade (1:07) was later completed instantly by a 1-hour offline catch-up, and an Energy Reactor build (0:48 remaining) completed instantly from the shop's 1h Build Speedup — all three completion paths landed on the same grid state.
- **Reference**: .project/plan/PLAN.md Surface contract (Base Tab); src/data/buildings.json; src/core/state/gameState.ts hydrateState; src/ui/components/BuildingSlot.tsx, BuildQueue.tsx; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md (project Verify exit 0 at this HEAD)
- **Finding**: none
- **Fix direction**: none

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels

- **Verdict**: met
- **Surface**: Base Tab
- **Check**: Watched the three resource counters on the Base tab over several minutes of live play: sampled displayed amounts and +X/s rates before and after completing a Resource Production building, a Resource Storage building, an Energy Reactor and a research bonus; observed the per-second tick and the storage caps; triggered a 1-hour offline catch-up and re-read the amounts.
- **Observed**: On a fresh state the counters showed 500 Materials, 300 Energy, 0 Research Data with base rates +1.0/+0.5/+0.1 per second (resources.json baseRate summed in derived.ts), and values increased live (energy 791 to 797 across a sample, research data 118 to 119). Completing Resource Production Lv.1 raised rates to +11.0/+5.5/+1.1; Lv.2 raised them to +23.1/+22.5/+2.1; the Energy Reactor added +12 energy/s; the completed Efficient Smelting research multiplied the materials rate by 1.1 (11.0 to 12.1). Gains clamped at the storage caps (all three pinned at 1500/1500/750 after a Resource Pack). After a 1-hour offline reload the amounts matched one hour of production at the stored building levels.
- **Reference**: src/core/state/derived.ts resourceRates; src/core/systems/resources.ts tick; src/data/resources.json; src/data/buildings.json production; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI

- **Verdict**: met
- **Surface**: Research Tab
- **Check**: Performed the PLAN Research Tab walkthrough: opened the Research tab and counted the tree (7 nodes across Production/Research/Clan categories with effects in their accessible names); clicked available node Efficient Smelting and answered the "Start research Efficient Smelting?" confirmation; observed the refusal while Research Data was insufficient; started it again after gaining resources; watched the research queue countdown (4:58); completed it with the 1h Research Boost from the shop; verified the completed state, the applied bonus in the resource rates and the locked-to-available unlock of dependent nodes; reloaded and confirmed the state persisted.
- **Observed**: Exactly 7 research nodes render with effects (+10% materials rate, +15% energy, +20% researchData, +20% build speed, +25% research speed, +15% and +10% clan points); nodes without prereqs were available and the rest rendered locked/disabled with tooltips. The native confirm gate blocked until answered; with only 2 Research Data (cost 100) the start was refused (queue stayed empty); after the Resource Pack the research started, awarded +100 clan points, and completed instantly from the boost with class "research-node completed" and aria-pressed=true; the materials rate rose by x1.1 live; Advanced Circuitry and Data Compression flipped from locked to available while Quantum Computing and Diplomatic Relations stayed locked behind unmet prereqs; all states survived a reload.
- **Reference**: src/data/research.json (7 entries, cost/time/effect); src/ui/screens/ResearchScreen.tsx (confirm); src/ui/components/ResearchNode.tsx (states, title tooltip, keyboard); src/core/systems/research.ts; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none

### SC4 — **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard

- **Verdict**: met
- **Surface**: Clan Event Tab
- **Check**: Performed the PLAN Clan Event Tab walkthrough: read the 7-day countdown (days:hours:minutes:seconds, refreshed every second); read the live leaderboard after player actions; queued a building and started a research and checked the point log and scores; watched the AI clan's points accrue; edited the stored eventEndTime into the past via IndexedDB from an inert same-origin page and reloaded; claimed the results in the dialog; verified the new cycle; ran 1-hour and 48-hour offline catch-ups and compared the AI score deltas against the flat rate and the 24h clamp.
- **Observed**: The timer rendered "Event ends in 6 DAYS:23 HOURS:55 MIN:49 SEC" from the absolute endTime and ticked down (role=timer). The leaderboard table showed rank/clan/score with Player vs "AI (grinder)" — the AI profile visible in the name — and updated live (AI accrued continuously during play, 860 to 1011). Player points were awarded per action: "Production +1" entries appeared every tick in the visible log, and the persisted point log held {source: build, amount: 50} and {source: research, amount: 100} entries right after those actions (the log keeps the most recent 100 entries, so per-second production entries push action labels out of the visible window within about a minute — recorded, not hidden). Ending the event offline surfaced the results dialog "Defeat — Your Clan 852 vs AI Clan 2163" with reward "💎 100 · 1 speedups"; claiming closed the modal, showed the toast "Event rewards claimed — rewards added to your inventory", raised currency 50 to 150 and added the speedup to the inventory; a new cycle (2) started with scores reset, a fresh "AI (rusher)" profile and a fresh ~7-day timer. Offline catch-up matched the flat AI rate exactly: +1101 points for 1h (grinder) and +43,233 for a 48h absence = exactly 24h x 0.5/s (rusher), proving the 24h clamp.
- **Reference**: src/core/systems/clanEvent.ts (leaderboard, point log, checkEventEnd, claimEventResults); src/ui/components/EventTimer.tsx, ClanLeaderboard.tsx, PointLog.tsx, EventResultsModal.tsx; src/core/time/offlineCatchup.ts (AI accrual, MAX_OFFLINE_MS clamp); .project/review/wave-4.cycle2.contract.md; .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none

### SC5 — **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately

- **Verdict**: met
- **Surface**: Shop Tab
- **Check**: Performed the PLAN Shop Tab walkthrough: read the currency balance; verified the 4 items with exact names and prices; bought items through the confirm dialogs and checked each deduction arithmetically; used a Resource Pack and watched the resources jump; queued a build and a research and used the speedups on the active timers; tested the Use gating with and without active timers; drained the balance to check the unaffordable state and its tooltips; verified inventory counts and the event-reward speedup arriving in the inventory.
- **Observed**: The tab showed 💎 1000 at start and exactly four items — 1h Build Speedup (💎 100), 8h Build Speedup (💎 500), 1h Research Boost ( 💎 150), Resource Pack (💎 200). Each purchase first showed a native confirm ("Buy Resource Pack for 💎 200?") and only then deducted (balance walked 1000 to 800 to 650 to 550 to 50, exact arithmetic); the Resource Pack applied instantly on Use (+500/+300/+100 clamped at the 1500/1500/750 caps, toast shown); the 1h Build Speedup reduced a 0:48 reactor timer to instant completion and the 1h Research Boost reduced a 4:58 research timer to instant completion (both with toasts); Use stayed disabled while no matching timer was active and re-enabled when one was queued; with 💎 50 left every Buy button was disabled with its exact shortfall tooltip ("Need 💎 50 more", "Need 💎 450 more", "Need 💎 100 more", "Need 💎 150 more"). Scope disclosure: v1 ships exactly the four items above — three time reducers and one resource pack; no point-booster item exists (the clanPointBoost effect type is defined but unused; point growth comes from the clanPointsMultiplier research). INTENT §4/§8/§10 and the approved T013 brief all specify "4 items" and the criterion's listed categories are illustrative; the gap is disclosed rather than glossed over. The shop has no dedicated unit-test file; the purchase flows above were verified live and by the suite (56/56), recorded in wave-9 warnings.
- **Reference**: src/data/shop.json (4 items at 100/500/150/200); src/core/systems/shop.ts (buyItem, speedups, resourcePack); src/ui/screens/ShopScreen.tsx (confirm, toasts, use); src/ui/components/ShopItem.tsx (affordability gate, tooltip), Inventory.tsx; .project/review/wave-4.cycle2.contract.md (SC5 disclosure); .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none

### SC6 — **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads

- **Verdict**: met
- **Surface**: Persistence
- **Check**: Performed the PLAN Persistence walkthrough: reloaded with state and checked every screen; edited the stored save (lastSave, eventEndTime) via IndexedDB from an inert same-origin page and reloaded; opened a second tab and watched the first; used Export and Import from the storage-unavailable banner with a stubbed localStorage; corrupted both the main and backup saves and reloaded; compared a 48h absence against the 24h cap.
- **Observed**: After several reloads everything restored from the IndexedDB key "terra-dome-save" (schema version 2): buildings and levels (CC Lv.2, Resource Production Lv.2, Resource Storage Lv.1, Energy Reactor Lv.1), resource amounts and rates including the research bonus, completed research states, currency, shop inventory, clan scores, cycle 2 and the absolute event timer (6 days 23h remaining). Offline catch-up applied on boot: a lastSave 1 hour in the past completed a queued 1:07 upgrade instantly and added the AI's flat hourly accrual; a lastSave 48 hours in the past added exactly 24h x rate to the AI score (43,233 = the MAX_OFFLINE_MS clamp). Cross-tab: after opening a second tab, the first tab reloaded itself (newer save wins via BroadcastChannel) and then stayed stable — no reload loop. With localStorage stubbed (storage unavailable), the warning banner appeared with Export save and Import save; Export downloaded terra-dome-save.json (version 2, full state incl. clan scores and event timer); Import of a modified copy (currency 7777) validated and applied instantly. Corrupting both the main and backup keys produced the console error "Failed to load game: Invalid save file" and a clean fresh start — silent fallback, no error toast (recorded: the app has no load-failure toast or "Start fresh" button, and boot renders only after load, so there is no loading spinner either).
- **Reference**: src/core/persistence/persistence.ts (saveGame, loadGame with backup fallback, exportSave, importSave, debounced autosave, BroadcastChannel); src/core/persistence/schema.ts (CURRENT_SAVE_VERSION 2); src/core/time/offlineCatchup.ts (MAX_OFFLINE_MS clamp); src/ui/App.tsx storage banner; .project/review/wave-1.cycle3.md; .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none

### SC7 — **UI:** 4 tabs/screens — Base, Research, Clan Event, Shop — clean, functional, responsive

- **Verdict**: met
- **Check**: Clicked through all four tabs repeatedly during the walkthrough at desktop size and again at a 390x844 mobile viewport; checked the tab bar semantics, toast feedback, timers and the blocking results dialog; counted the visible screens.
- **Observed**: The shell renders exactly 4 tabs (Base, Research, Clan Event, Shop) as a role=tablist with icons and aria-selected, switching instantly with no reload; every action surfaced a toast (role=alert) and every timer rendered readable formats (MM:SS for queues, DAYS:HOURS:MIN:SEC for the event, role=timer); the event results dialog blocked the game until claimed (mandatory acknowledgment, no Escape — documented in wave-4 warnings); at 390px width all 4 tabs stayed visible with no horizontal scroll (CSS grid/flex from styles/global.css, linked in index.html); accessibility roles were present throughout (role=log for the point log, role=status aria-live=polite for the resource counters, aria-pressed on research nodes).
- **Reference**: src/ui/App.tsx; src/ui/components/TabBar.tsx, Toast.tsx; styles/global.css; index.html; .project/review/wave-5.cycle1.md; .project/review/final-gap-1.md
- **Finding**: none
- **Fix direction**: none
