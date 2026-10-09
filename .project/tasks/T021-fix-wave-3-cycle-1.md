---
id: T021
title: Fix wave 3 cycle 1 review findings in T011
wave: 8
deps: [T011]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/ui/components/ResearchCategory.tsx
  - src/ui/components/ResearchNode.tsx
  - src/ui/components/ResearchQueue.tsx
  - src/ui/components/TechTree.tsx
  - src/ui/screens/ResearchScreen.tsx
---

# T021 — Fix wave 3 cycle 1 review findings in T011

## Context

Repair task created from the wave 3 cycle 1 review of T011.
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

1. Click available node → confirmation → starts research, adds to queue

## Verify

```bash
set -e
(
test -f src/ui/screens/ResearchScreen.tsx && test -f src/ui/components/TechTree.tsx && test -f src/ui/components/ResearchNode.tsx && test -f src/ui/components/ResearchQueue.tsx && test -f src/ui/components/ResearchCategory.tsx
)
```

Heavy: no

## Review findings

### t011_files
Criterion: Click available node → confirmation → starts research, adds to queue
- Click available node → confirmation → starts research, adds to queue — implementation starts research directly without confirmation step
- Keyboard: Arrow keys navigate nodes, Enter confirms, Escape closes — no keyboard navigation between ResearchNode elements implemented
- Timer reaches 0 → research marked complete — ResearchQueue uses setInterval drift pattern; no visibilitychange handling
- ResearchNode shows name, cost, prerequisites — ResearchNode clickable div without role="button", tabindex, aria-pressed for queued state
- Research tab loads — TechTree re-renders full SVG on every researchData change; no memo on ResearchNode; ResearchCategory creates new Map per render
- Reload page → all research state restored — TechTree researchData signal and completedResearch derived signal race on concurrent queue start/complete; ResearchNode mutates gameState.research.queue directly without transaction guard

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 3 cycle 1
