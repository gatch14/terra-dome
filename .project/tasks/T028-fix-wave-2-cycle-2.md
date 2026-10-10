---
id: T028
title: Fix wave 2 cycle 2 review findings in T009
wave: 12
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/systems/clanEvent.test.ts
  - src/core/systems/clanEvent.ts
  - src/core/systems/clanEventDefinitions.ts
  - src/data/clanEvent.json
---

# T028 — Fix wave 2 cycle 2 review findings in T009

## Context

Repair task created from the wave 2 cycle 2 review of T009.
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

1. Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up

## Verify

```bash
set -e
(
test -f src/core/systems/clanEvent.ts && test -f src/core/systems/clanEventDefinitions.ts && test -f src/data/clanEvent.json
)
```

Heavy: no

## Review findings

### t009_ac9
Criterion: Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up
- Unit tests for: event start, point sources, AI profiles, event end, rewards, offline catch-up — reviewer re-run this cycle (clanEvent 10 tests, full suite 49/49, exit 0): coverage exists for event start (:21,:29), point sources (:43,:121), event end (:83,:89), rewards (:107) and offline catch-up (offlineCatchup.test.ts:107-122), but AI profiles are still not exercised: the test at clanEvent.test.ts:62-71 ("tickAI accrues points for every profile (fractional accumulation)") runs only the default profile that createInitialState sets (grinder) and never varies `aiProfile`; repo grep for `rusher|lateBloomer|aiProfile` across `*.test.ts` matches only offlineCatchup.test.ts:49 (the same default profile), so the distinct curve math in clanEvent.ts:96-104 has zero assertions; `git log -- src/core/systems/clanEvent.test.ts` shows the file last changed at T009's landing b77da43, so fix task T019's landing 65df5cd (brief-only) added nothing. fix: parametrize the AI tests over rusher/grinder/lateBloomer asserting early-event accrual order (rusher > grinder > lateBloomer) and that lateBloomer's late accrual exceeds its early accrual while rusher's tapers, then re-run `pnpm vitest run src/core/systems/clanEvent.test.ts`.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 2 cycle 2
