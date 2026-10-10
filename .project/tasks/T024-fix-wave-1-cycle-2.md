---
id: T024
title: Fix wave 1 cycle 2 review findings in T005
wave: 10
deps: [T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/persistence/migration.ts
  - src/core/persistence/persistence.ts
  - src/core/persistence/schema.ts
  - src/core/time/offlineCatchup.test.ts
  - src/ui/App.tsx
---

# T024 — Fix wave 1 cycle 2 review findings in T005

## Context

Repair task created from the wave 1 cycle 2 review of T005.
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

1. Auto-save triggers on state change (debounced 500ms)
2. Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence

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

### t004_files
Criterion: Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence
- Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence — reviewer re-run this cycle (`pnpm vitest run`: 6 offlineCatchup cases, full suite 47/47): the file has clock skew, 24h clamp, storage full, timer reduction, completion, event end — but no zero-elapsed case (`lastSave === now`) and no plain normal-absence resource-gain case (resources are only asserted in the 48h clamp and storage-full cases). Cycle 1 named the zero-elapsed gap and fix task T015's landing ca43fe7 changed only its brief, not this test file. fix: add a `lastSave === now` case (no change, no error) and a sub-cap absence case asserting `materials += rate * elapsed`, then re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts`.

### t005_files
Criterion: Auto-save triggers on state change (debounced 500ms)
- Auto-save triggers on state change (debounced 500ms) — setupAutoSave (persistence.ts:91-104) is a 10-second `setInterval` that saves unconditionally; there is no `effect()` watcher on `gameState.value` and no 500ms debounce anywhere in the module (cycle 1 finding (b), carried verbatim by T016's brief and never repaired in product code).
- Quota exceeded: catches error, shows toast, offers export — saveGame's catch (persistence.ts:23-26) only `console.error`s and rethrows; no `QuotaExceededError` branch, no toast, no export offer exists anywhere in the product (cycle 1 finding (a)).
- Private browsing: detects unavailable storage, shows banner, offers export/import — `isStorageAvailable()` exists (persistence.ts:125-134) but its only caller is main.ts:17-19, which `console.warn`s; no banner and no export/import actions are rendered (cycle 1 finding (d): "no caller in the product... emits a storage-unavailable event or binds the banner").
- Storage event: second tab save triggers reload in first tab — setupStorageSync (persistence.ts:113-123) listens to window `storage` events, which browsers fire only for localStorage changes; saves are written to IndexedDB via idb-keyval, so a second-tab save never triggers this listener (cycle 1 finding (c): "the window storage event never fires for idb-keyval writes").

## Log

- 2026-10-10 — created by dispatch_driver.py fix-tasks from wave 1 cycle 2
- 2026-10-10 — plan defect repair (wave 1 gate): fix-tasks reported the t004_files batch as carried by T015, but T015's landing ca43fe7 changed only its brief and the named test cases are still absent from offlineCatchup.test.ts; scope, files and the verbatim t004 finding extended to this task so the repair actually lands (AC 2, Review findings).
- 2026-10-10 — plan defect repair (wave 1 gate): Verify strengthened from file-existence (`test -f schema.ts && test -f migration.ts`) to `pnpm tsc --noEmit && pnpm vitest run` (fix claims are behavioral). AC6 also requires a UI binding for the storage banner and quota toast, which persistence.ts alone cannot render; the App shell binding lands with this fix inside the listed files plus src/ui/App.tsx (see files).
