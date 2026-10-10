---
id: T020
title: Fix wave 3 cycle 1 review findings in T010
wave: 8
deps: [T010]
status: done
agent: task-t020
base: 9daad44ad9e023be15be1592619f7ccab707c2d6
worktree: null
task_branch: null
files:
  - src/ui/components/BuildQueue.tsx
  - src/ui/components/BuildingGrid.tsx
  - src/ui/components/BuildingSlot.tsx
  - src/ui/components/ResourceCounters.tsx
  - src/ui/screens/BaseScreen.tsx
  - src/ui/utils/format.ts
---

# T020 — Fix wave 3 cycle 1 review findings in T010

## Context

Repair task created from the wave 3 cycle 1 review of T010.
The failed criteria and every reviewer observation are recorded verbatim under Review findings.
The source task contracts are unchanged; read them and .project/intent/INTENT.md before editing.

## Approach

- Fix only what the Review findings name, inside the listed files; do not change the source
  tasks' acceptance criteria or interface contracts.
- Re-run the source tasks' Verify commands after the fix and record the result in the Log.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal

## Verify

```bash
set -e
(
test -f src/ui/screens/BaseScreen.tsx && test -f src/ui/components/BuildingGrid.tsx && test -f src/ui/components/ResourceCounters.tsx && test -f src/ui/components/BuildQueue.tsx && test -f src/ui/components/BuildingSlot.tsx
)
```

Heavy: no

## Review findings

### t010_files
Criterion: Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal
- Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — BuildingSlot lacks tabindex/focus management; no keyboard handler in BuildingGrid or BaseScreen
- Timer reaches 0 → building appears on grid, level increases, rate updates — BuildQueue timer uses setInterval with local Date.now() delta; drifts on tab background, no visibilitychange handling
- Reload page → all state restored — BuildingSlot serializes full Building object with non-serializable methods; Zod parse may silently drop
- Resource counters display current amounts — ResourceCounters lacks aria-live="polite" for screen reader announcements
- Build queue shows item with progress bar — BuildQueue tooltip uses innerHTML with unescaped building name (XSS vector)
- Base tab loads — BuildingGrid 25 slots × 4 signal subscriptions = 100 subscriptions; no virtualization, formatNumber creates new Intl.NumberFormat per call

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 3 cycle 1
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t020-verify): pass, exit 0
