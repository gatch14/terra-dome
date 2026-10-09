---
id: T008
title: Implement research system with tech tree and bonuses
wave: 2
deps: ["T005", "T007"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/systems/research.ts
  - src/core/systems/researchDefinitions.ts
  - src/data/research.json
---

# T008 — Implement research system with tech tree and bonuses

## Context

Create the research system: data-driven tech tree (JSON), research queue, prerequisite checking, bonus application. Research nodes have: id, name, category, prereqs[], cost (resources + time), effect (bonus type + value). Categories: Production, Research, Clan. Queue processes one at a time.

## Approach

- In researchDefinitions.ts: load research.json, export RESEARCH_DEFINITIONS, topological sort for display order, prerequisite validation
- In research.ts:
  - `startResearch(nodeId: string)`: validates prereqs met, not started, can afford; deducts cost; adds to queue with endTime
  - `completeResearch(queueItem)`: marks node completed, applies bonus to gameState (resourceRates, clanPointsMultiplier, etc.)
  - `cancelResearch(queueItem)`: refunds resources, removes from queue
  - `getNodeState(nodeId)`: 'locked' | 'available' | 'researching' | 'completed'
  - `getAvailableNodes()`: nodes with met prereqs, not started
- Register research timers with TimerManager (T003)
- Bonuses: percentage modifiers to resource rates, build speed, research speed, clan points

## Interface contract

- startResearch()
- cancelResearch()
- completeResearch()
- getNodeState()
- getAvailableNodes()
- RESEARCH_DEFINITIONS
- TimerManager
- TimerManager.registerTimer()
- TimerManager.unregisterTimer()
- TimerManager.start()
- TimerManager.pause()
- resourceRates derived signal
- tick()
- spend()
- earn()
- getRate()
- getStorage()
- getStored()
- RESOURCE_DEFINITIONS
- gameState signal

## Intent coverage

- None

## Acceptance criteria

1. research.json defines 6-8 nodes across 3 categories with prereqs, costs, effects
2. startResearch validates prereqs, affordability, adds to queue with endTime
3. TimerManager completes research, applies bonus to derived rates
3. Completed research unlocks dependent nodes (available state)
4. Cancel research refunds 100% resources
5. Bonuses correctly modify resourceRates, buildSpeed, researchSpeed, clanPointsMultiplier
6. Unit tests for: prereq validation, queue, complete, cancel, bonus application, unlock chain

## Verify

```bash
test -f src/core/systems/research.ts && test -f src/core/systems/researchDefinitions.ts && test -f src/data/research.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner