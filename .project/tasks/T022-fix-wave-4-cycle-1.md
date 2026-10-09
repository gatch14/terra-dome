---
id: T022
title: Fix wave 4 cycle 1 review findings in T012
wave: 9
deps: [T012]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/ui/components/ClanLeaderboard.tsx
  - src/ui/components/EventResultsModal.tsx
  - src/ui/components/EventTimer.tsx
  - src/ui/components/PointLog.tsx
  - src/ui/screens/ClanEventScreen.tsx
---

# T022 — Fix wave 4 cycle 1 review findings in T012

## Context

Repair task created from the wave 4 cycle 1 review of T012.
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

1. EventTimer displays days:hours:minutes:seconds

## Verify

```bash
set -e
(
test -f src/ui/screens/ClanEventScreen.tsx && test -f src/ui/components/EventTimer.tsx && test -f src/ui/components/ClanLeaderboard.tsx && test -f src/ui/components/PointLog.tsx && test -f src/ui/components/EventResultsModal.tsx
)
```

Heavy: no

## Review findings

### t012_files
Criterion: EventTimer displays days:hours:minutes:seconds
- EventTimer displays days:hours:minutes:seconds — timer uses setInterval with local Date.now() delta; drifts on tab background, no visibilitychange handling
- Reload page → timer continues from endTime — EventTimer doesn't sync with TimerManager on mount; shows stale remaining time
- ClanLeaderboard shows top 10 clans — ClanLeaderboard table lacks role="table", column headers lack scope="col"; not screen reader accessible
- PointLog shows recent point gains — PointLog list items lack aria-label with point change context
- EventResultsModal shows final ranking — Modal doesn't trap focus; Escape doesn't close; no aria-modal="true"
- Click claim → adds rewards — Claim button lacks aria-label; reward amounts not announced

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 4 cycle 1
