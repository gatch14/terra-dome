---
id: T003
title: Implement timer system with absolute endTime pattern
wave: 1
deps: ["T002"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/time/timerManager.ts
  - src/core/time/timerManager.test.ts
  - src/core/time/types.ts
---

# T003 — Implement timer system with absolute endTime pattern

## Context

Create a centralized timer manager that handles all countdowns (building queue, research queue, clan event) using absolute endTime timestamps. This avoids timer drift from setInterval throttling in background tabs. The manager runs a single 1-second interval when tab is visible, pauses on hidden, and exposes a `tick()` function for manual advancement (testing).

## Approach

- Create `TimerManager` class with:
  - `start()`: begins 1s interval (using `setInterval`) when `document.visibilityState === 'visible'`
  - `pause()`: clears interval
  - `tick(now: number)`: processes all active timers, computes remaining = endTime - now, completes expired
  - `registerTimer(id, endTime, onComplete)`: adds timer to tracking map
  - `unregisterTimer(id)`: removes timer
- Listen to `visibilitychange` event: resume → call `tick(Date.now())` for catch-up
- Store timers in a Map with id, endTime, onComplete callback
- Export singleton instance for use by building/research/clan systems

## Interface contract

- TimerManager
- TimerManager.registerTimer()
- TimerManager.unregisterTimer()
- TimerManager.tick()
- TimerManager.start()
- TimerManager.pause()

## Intent coverage

- None

## Acceptance criteria

1. TimerManager starts/stops interval on visibility change
2. registerTimer adds timer, calls onComplete when endTime reached
3. tick(now) processes all timers, computes remaining correctly
4. Multiple simultaneous timers work independently
5. No timer drift: remaining = endTime - Date.now() always accurate
6. Unit tests pass for: single timer, multiple timers, pause/resume, visibility change

## Verify

```bash
test -f src/core/time/timerManager.ts && test -f src/core/time/types.ts
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `src/core/time/timerManager.test.ts` (task's unit tests were undeclared).