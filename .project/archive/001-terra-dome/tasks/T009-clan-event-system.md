---
id: T009
title: Implement clan event system with AI opponent and scoring
wave: 2
deps: ["T005", "T003"]
status: done
agent: build_T009
base: 3421ea87da6bffaea3f000e8877681137f45e841
worktree: null
task_branch: null
files:
  - src/core/systems/clanEvent.ts
  - src/core/systems/clanEvent.test.ts
  - src/core/systems/clanEventDefinitions.ts
  - src/data/clanEvent.json
---

# T009 — Implement clan event system with AI opponent and scoring

## Context

Create the clan event system: 7-day weekly event, two clans (Player + AI), point sources from player actions (build, research, produce), AI passive accumulation with personality profiles. Event timer, leaderboard, point breakdown log, end-of-event resolution with rewards.

## Approach

- In clanEventDefinitions.ts: load clanEvent.json, export CLAN_EVENT_CONFIG with duration, AI profiles (Rusher/Grinder/LateBloomer), point values per action
- In clanEvent.ts:
  - `startEvent()`: sets eventEndTime = now + 7 days, resets scores, picks AI profile
  - `addPlayerPoints(source: string, amount: number)`: increments player score, logs source
  - `tickAI(now: number)`: adds AI points based on profile curve (points/sec × elapsed)
  - `getLeaderboard()`: returns [{ clan: 'Player', score }, { clan: 'AI', score }]
  - `getPointLog()`: returns [{ timestamp, clan, source, amount }]
  - `checkEventEnd(now: number)`: if now >= eventEndTime, resolve winner, award rewards, schedule next event
  - `getTimeRemaining()`: eventEndTime - now
- Register event timer with TimerManager (T003) for countdown
- AI profiles: Rusher (high early, tapers), Grinder (steady), LateBloomer (low early, surges late)

## Interface contract

- startEvent()
- addPlayerPoints()
- tickAI()
- getLeaderboard()
- getPointLog()
- checkEventEnd()
- getTimeRemaining()
- CLAN_EVENT_CONFIG
- TimerManager
- TimerManager.registerTimer()
- TimerManager.unregisterTimer()
- TimerManager.start()
- TimerManager.pause()
- gameState signal
- clanEvent state

## Intent coverage

- None

## Acceptance criteria

1. Event starts automatically on first load, runs 7 days
2. Player actions (build, research) award points immediately
3. AI accumulates points passively per profile curve
4. Leaderboard shows Player vs AI scores updating in real-time
5. Point log shows source breakdown (build: +50, research: +100, etc.)
6. Event end triggers results modal with winner and rewards
7. Next event auto-starts after resolution
8. Offline catch-up (T004) advances AI points and checks event end
9. Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up

## Verify

```bash
test -f src/core/systems/clanEvent.ts && test -f src/core/systems/clanEventDefinitions.ts && test -f src/data/clanEvent.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `src/core/systems/clanEvent.test.ts` (task's unit tests were undeclared).
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t009-verify): pass, exit 0
