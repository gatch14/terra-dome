---
id: T014
title: Integration, polish, and full success criteria verification
wave: 5
deps: ["T010", "T011", "T012", "T013"]
status: done
agent: task-t014
base: 96ac22f1bad6fec38095064051c82a46d7a67c12
worktree: null
task_branch: null
files:
  - src/ui/App.tsx
  - src/ui/components/TabBar.tsx
  - src/ui/components/Toast.tsx
  - src/ui/styles/global.css
  - src/main.ts
  - index.html
---

# T014 — Integration, polish, and full success criteria verification

## Context

Wire all screens into main App with tab navigation, add global toast notifications, polish styling, verify all 7 INTENT.md success criteria manually, fix edge cases, ensure accessibility (keyboard, contrast, semantics).

## Approach

- App.tsx: renders TabBar + active screen (Base/Research/ClanEvent/Shop), subscribes to gameState for global toasts
- TabBar.tsx: 4 tabs, keyboard navigation (arrow keys), active indicator, persistent across reloads
- Toast.tsx: portal for notifications ("Build queued +50 Clan Points", "Research completed", "Purchase successful", "Save failed")
- global.css: CSS variables for colors, spacing, animations; responsive (mobile: stacked tabs, desktop: horizontal); reduced motion support
- main.ts: bootstraps Vite, initializes gameState, loads save, applies offline catch-up, starts TimerManager, registers auto-save
- index.html: meta tags, viewport, title "Terra Dome", links to styles
- Manual playthrough checklist covering all 7 success criteria

## Interface contract

- gameState signal
- TimerManager
- TimerManager.registerTimer()
- TimerManager.unregisterTimer()
- TimerManager.tick()
- TimerManager.start()
- TimerManager.pause()
- saveGame()
- loadGame()
- migrateSave()
- applyOfflineProgress()
- MAX_OFFLINE_MS
- BaseScreen component
- ResearchScreen component
- ClanEventScreen component
- ShopScreen component
- BuildingGrid component
- ResourceCounters component
- BuildQueue component
- BuildingSlot component
- TechTree component
- ResearchNode component
- ResearchQueue component
- ResearchCategory component
- EventTimer component
- ClanLeaderboard component
- PointLog component
- EventResultsModal component
- ShopItem component
- Inventory component
- CurrencyDisplay component

## Intent coverage

- SC7

## Acceptance criteria

1. Open index.html -> Base tab active, Command Center visible, resources at starting values (500 materials, 300 energy, 0 research data) and ticking up
2. Queue Resource Production building -> timer counts down -> completes -> resource rate increases
3. Resources tick up per second, counters animate
4. Click Research tab -> tree visible -> start research -> timer -> completes -> bonus applied
5. Click Clan Event tab -> 7-day timer -> Player actions award points -> AI passive points
6. Click Shop tab -> currency 1000 -> buy 1h speedup -> use on building -> timer reduced
7. Reload page -> ALL state restored (buildings, queue, research, clan event, shop, resources)
8. Wait 5 min, reload -> offline catch-up applied (resources gained, timers reduced)
9. Keyboard: Tab navigates all interactive elements, Enter activates, Escape closes modals
10. Color contrast AA, semantic HTML, screen reader labels on all controls
11. No console errors, 60fps idle, <100ms interaction response
12. pnpm run build produces working dist/ deployable to static hosting

## Verify

```bash
test -f src/ui/App.tsx && test -f src/ui/components/TabBar.tsx && test -f src/ui/components/Toast.tsx && test -f src/ui/styles/global.css && test -f src/main.ts && test -f index.html
```

Heavy: yes

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): ambiguous AC repaired — AC1 "resources at 0" contradicted the approved Base-tab walkthrough (first build must be queueable immediately, cost 200/100); restated as starting values 500 materials / 300 energy / 0 research data, per T002 Approach and the settled decision.
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t014-verify): pass, exit 0
