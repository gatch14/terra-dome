---
id: T004
title: Implement offline progression catch-up with 24h cap
wave: 1
deps: ["T003"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/time/offlineCatchup.ts
---

# T004 — Implement offline progression catch-up with 24h cap

## Context

Implement the offline catch-up algorithm that runs on game load. Calculates elapsed time since lastSave, clamps to 24 hours maximum, applies resource gains (rate × elapsed, capped at storage), reduces build/research timers, advances clan event AI points. Handles clock skew (negative elapsed) gracefully.

## Approach

- Create `applyOfflineProgress(state: GameState, now: number): GameState` function:
  - `elapsed = Math.max(0, Math.min(now - state.lastSave, 24 * 60 * 60 * 1000))`
  - `elapsedSec = elapsed / 1000`
  - Resources: `materials = min(storage, materials + rate.materials * elapsedSec)` (same for energy, researchData)
  - Timers: for each queued building/research, `remaining = max(0, remaining - elapsedSec)`; if remaining <= 0, complete and trigger onComplete
  - Clan event: `aiPoints += AI_POINTS_PER_SEC * elapsedSec`; if `now > eventEndTime`, trigger event end
  - Update `lastSave = now`
- Export `applyOfflineProgress` and `MAX_OFFLINE_MS` constant
- Called by T005 loadGame() after deserializing state

## Interface contract

- applyOfflineProgress()
- MAX_OFFLINE_MS

## Intent coverage

- None

## Acceptance criteria

1. elapsed clamped to 24h max (returns 24h worth of progress even after week)
2. Negative elapsed (clock skew) → 0 progress, no errors
3. Resources gain = rate × elapsedSec, capped at storage limits
4. Build/research timers reduced by elapsedSec, completed if <= 0
5. Clan event AI points increase by AI_POINTS_PER_SEC × elapsedSec
6. Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence

## Verify

```bash
test -f src/core/time/offlineCatchup.ts
```

Heavy: no

## Log

- 2026-10-09 — created by planner