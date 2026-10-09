---
id: T012
title: Implement Clan Event tab UI with timer, leaderboard, point log
wave: 3
deps: ["T009"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/ui/screens/ClanEventScreen.tsx
  - src/ui/components/EventTimer.tsx
  - src/ui/components/ClanLeaderboard.tsx
  - src/ui/components/PointLog.tsx
  - src/ui/components/EventResultsModal.tsx
---

# T012 — Implement Clan Event tab UI with timer, leaderboard, point log

## Context

Create the Clan Event tab screen: 7-day countdown timer, two-clan leaderboard (Player vs AI), point source breakdown log, event results modal on end. Real-time updates via signals.

## Approach

- ClanEventScreen.tsx: main tab, subscribes to clanEvent state, leaderboard, pointLog
- EventTimer.tsx: large countdown (DD:HH:MM:SS), updates every second via derived signal
- ClanLeaderboard.tsx: two rows (Player, AI) with clan name, score, animated score changes
- PointLog.tsx: scrollable list of recent point events: timestamp, clan icon, source, amount
- EventResultsModal.tsx: shows on event end — winner, final scores, rewards, "Next event in 7 days"
- AI clan shows profile name (Rusher/Grinder/Late Bloomer) and avatar

## Interface contract

- clanEvent state
- getLeaderboard()
- getPointLog()
- getTimeRemaining()
- checkEventEnd()
- startEvent()
- addPlayerPoints()
- tickAI()
- CLAN_EVENT_CONFIG
- ClanEventScreen component
- EventTimer component
- ClanLeaderboard component
- PointLog component
- EventResultsModal component

## Intent coverage

- SC4

## Acceptance criteria

1. Clan Event tab shows 7-day countdown timer updating every second
2. Leaderboard shows Player and AI clans with scores, AI shows personality
3. Point log lists recent events: "Build queued +50", "Research started +100", "AI passive +25"
4. Player actions in other tabs immediately update Player score and log
5. Event end triggers results modal with winner, rewards, next event countdown
6. Modal "Claim Rewards" button closes modal, awards premium currency
7. Reload page → timer, scores, log, event cycle state restored
8. Offline catch-up: reload after absence → AI points updated, event end detected if passed

## Verify

```bash
test -f src/ui/screens/ClanEventScreen.tsx && test -f src/ui/components/EventTimer.tsx && test -f src/ui/components/ClanLeaderboard.tsx && test -f src/ui/components/PointLog.tsx && test -f src/ui/components/EventResultsModal.tsx
```

Heavy: no

## Log

- 2026-10-09 — created by planner