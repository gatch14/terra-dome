---
id: T011
title: Implement Research tab UI with tech tree and research queue
wave: 3
deps: ["T008"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/ui/screens/ResearchScreen.tsx
  - src/ui/components/TechTree.tsx
  - src/ui/components/ResearchNode.tsx
  - src/ui/components/ResearchQueue.tsx
  - src/ui/components/ResearchCategory.tsx
---

# T011 — Implement Research tab UI with tech tree and research queue

## Context

Create the Research tab screen: tech tree with 3 categories (Production, Research, Clan), nodes colored by state (locked/available/researching/completed), research queue with timers. Click available node → confirm → starts research. Shows bonus preview on hover.

## Approach

- ResearchScreen.tsx: main tab, subscribes to research definitions, node states, researchQueue
- TechTree.tsx: renders 3 category columns, positions nodes by prereq DAG (simple top-down)
- ResearchNode.tsx: individual node, shows name, cost, time, effect preview; click → start research
- ResearchQueue.tsx: list of researching items with progress, remaining time
- ResearchCategory.tsx: category header with icon, node container
- State colors: locked (gray), available (green), researching (blue, pulsing), completed (gold)

## Interface contract

- RESEARCH_DEFINITIONS
- getNodeState()
- getAvailableNodes()
- startResearch()
- cancelResearch()
- completeResearch()
- researchQueue derived signal
- availableResearch derived signal
- useItem()
- buyItem()
- getInventory()
- SHOP_DEFINITIONS
- ResearchScreen component
- TechTree component
- ResearchNode component
- ResearchQueue component
- ResearchCategory component

## Intent coverage

- SC3

## Acceptance criteria

1. Research tab shows 3 category columns with 6-8 nodes total
2. Nodes colored correctly by state (locked/available/researching/completed)
3. Hover available node → tooltip shows cost, time, effect
4. Click available node → confirmation → research starts, node turns blue, queue shows item
5. Research queue shows progress bar, remaining time
6. Timer completes → node turns gold, bonus applied, dependent nodes unlock (turn green)
7. Click researching node in queue → cancel → refunds, node returns to available
8. Keyboard: Tab navigates nodes, Enter starts research, Escape closes tooltip
9. Reload page → research progress, completed nodes, queue restored

## Verify

```bash
test -f src/ui/screens/ResearchScreen.tsx && test -f src/ui/components/TechTree.tsx && test -f src/ui/components/ResearchNode.tsx && test -f src/ui/components/ResearchQueue.tsx && test -f src/ui/components/ResearchCategory.tsx
```

Heavy: no

## Log

- 2026-10-09 — created by planner