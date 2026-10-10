# Archive — 001-terra-dome

Milestone: terra-dome
Shipped: 2026-10-10
Final verdict: all criteria met; project verify passed
Waves: 12  Tasks: 28 done / 28 total  Review cycles used: 3/3/3/2/1/1/1/1/1/1/1/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers | met | .project/plan/PLAN.md Surface contract (Base Tab); src/data/buildings.json; src/core/state/gameState.ts hydrateState; src/ui/components/BuildingSlot.tsx, BuildQueue.tsx; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md (project Verify exit 0 at this HEAD) |
| **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels | met | src/core/state/derived.ts resourceRates; src/core/systems/resources.ts tick; src/data/resources.json; src/data/buildings.json production; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md |
| **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI | met | src/data/research.json (7 entries, cost/time/effect); src/ui/screens/ResearchScreen.tsx (confirm); src/ui/components/ResearchNode.tsx (states, title tooltip, keyboard); src/core/systems/research.ts; .project/review/wave-3.cycle3.contract.md; .project/review/final-gap-1.md |
| **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard | met | src/core/systems/clanEvent.ts (leaderboard, point log, checkEventEnd, claimEventResults); src/ui/components/EventTimer.tsx, ClanLeaderboard.tsx, PointLog.tsx, EventResultsModal.tsx; src/core/time/offlineCatchup.ts (AI accrual, MAX_OFFLINE_MS clamp); .project/review/wave-4.cycle2.contract.md; .project/review/final-gap-1.md |
| **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately | met | src/data/shop.json (4 items at 100/500/150/200); src/core/systems/shop.ts (buyItem, speedups, resourcePack); src/ui/screens/ShopScreen.tsx (confirm, toasts, use); src/ui/components/ShopItem.tsx (affordability gate, tooltip), Inventory.tsx; .project/review/wave-4.cycle2.contract.md (SC5 disclosure); .project/review/final-gap-1.md |
| **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads | met | src/core/persistence/persistence.ts (saveGame, loadGame with backup fallback, exportSave, importSave, debounced autosave, BroadcastChannel); src/core/persistence/schema.ts (CURRENT_SAVE_VERSION 2); src/core/time/offlineCatchup.ts (MAX_OFFLINE_MS clamp); src/ui/App.tsx storage banner; .project/review/wave-1.cycle3.md; .project/review/final-gap-1.md |
| **UI:** 4 tabs/screens — Base, Research, Clan Event, Shop — clean, functional, responsive | met | src/ui/App.tsx; src/ui/components/TabBar.tsx, Toast.tsx; styles/global.css; index.html; .project/review/wave-5.cycle1.md; .project/review/final-gap-1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-domain.md
- research/evidence-pitfalls.md
- research/evidence-similar.md
- research/evidence-stack.md
- research/research-handoff.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-1.cycle3.md
- review/wave-10.cycle1.md
- review/wave-11.cycle1.adversarial.md
- review/wave-11.cycle1.contract.md
- review/wave-12.cycle1.md
- review/wave-2.cycle1.md
- review/wave-2.cycle2.md
- review/wave-2.cycle3.md
- review/wave-3.cycle1.adversarial.md
- review/wave-3.cycle1.contract.md
- review/wave-3.cycle2.adversarial.md
- review/wave-3.cycle2.contract.md
- review/wave-3.cycle3.adversarial.md
- review/wave-3.cycle3.contract.md
- review/wave-4.cycle1.adversarial.md
- review/wave-4.cycle1.contract.md
- review/wave-4.cycle2.adversarial.md
- review/wave-4.cycle2.contract.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.adversarial.md
- review/wave-8.cycle1.contract.md
- review/wave-9.cycle1.adversarial.md
- review/wave-9.cycle1.contract.md
- tasks/T001-scaffold-project.md
- tasks/T002-core-state-signals.md
- tasks/T003-timer-system.md
- tasks/T004-offline-catchup.md
- tasks/T005-persistence.md
- tasks/T006-building-system.md
- tasks/T007-resource-system.md
- tasks/T008-research-system.md
- tasks/T009-clan-event-system.md
- tasks/T010-base-ui.md
- tasks/T011-research-ui.md
- tasks/T012-clan-event-ui.md
- tasks/T013-shop-ui.md
- tasks/T014-integration-polish.md
- tasks/T015-fix-wave-1-cycle-1.md
- tasks/T016-fix-wave-1-cycle-1.md
- tasks/T017-fix-wave-2-cycle-1.md
- tasks/T018-fix-wave-2-cycle-1.md
- tasks/T019-fix-wave-2-cycle-1.md
- tasks/T020-fix-wave-3-cycle-1.md
- tasks/T021-fix-wave-3-cycle-1.md
- tasks/T022-fix-wave-4-cycle-1.md
- tasks/T023-fix-wave-4-cycle-1.md
- tasks/T024-fix-wave-1-cycle-2.md
- tasks/T025-fix-wave-3-cycle-2.md
- tasks/T026-fix-wave-2-cycle-2.md
- tasks/T027-fix-wave-2-cycle-2.md
- tasks/T028-fix-wave-2-cycle-2.md

## Notes

- none
