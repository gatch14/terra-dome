---
id: T025
title: Fix wave 3 cycle 2 review findings in T011
wave: 11
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

# T025 — Fix wave 3 cycle 2 review findings in T011

## Context

Repair task created from the wave 3 cycle 2 review of T011.
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

1. Click available node → confirmation → research starts, node turns blue, queue shows item

## Verify

```bash
set -e
(
pnpm tsc --noEmit
pnpm vitest run
)
```

Heavy: no

## Review findings

### t011_files
Criterion: Click available node → confirmation → research starts, node turns blue, queue shows item
- Click available node → confirmation → research starts, node turns blue, queue shows item — ResearchScreen.handleStartResearch (ResearchScreen.tsx:13-21) calls `startResearch(nodeId)` directly: no confirmation step exists anywhere between click and start (repo-wide, the only confirmation dialog is ShopScreen.tsx:15 for purchases). Node color and queue work; the confirmation is missing. Cycle 1 named this finding verbatim, and fix task T021's landing 227d552 changed only its brief — no product code. fix: add a confirmation before `startResearch` in handleStartResearch (window.confirm matching the ShopScreen pattern), then re-run `pnpm tsc --noEmit` and `pnpm vitest run`.
- Click available node → confirmation → research starts, node turns blue, queue shows item — adversarially confirmed: ResearchScreen.handleStartResearch (ResearchScreen.tsx:13-21) starts research on the first click with no confirmation, so a single misclick irreversibly spends research data and a queue slot. Repo-wide grep: the only confirmation in the app is ShopScreen.tsx:15. Cycle 1 recorded this verbatim; T021's landing 227d552 changed only the brief. fix: confirm before startResearch (window.confirm matching ShopScreen), then re-run `pnpm tsc --noEmit` and `pnpm vitest run`.

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 3 cycle 2
- 2026-10-10 — plan defect repair (wave 3 gate): Verify strengthened from file-existence to `pnpm tsc --noEmit` plus the full `pnpm vitest run` (the fix claim is behavioral — the AC is a confirmation step; both findings name these exact commands).
