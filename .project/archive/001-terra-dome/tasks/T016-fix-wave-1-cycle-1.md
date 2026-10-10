---
id: T016
title: Fix wave 1 cycle 1 review findings in T005
wave: 6
deps: [T005]
status: done
agent: task-t016
base: df811d040e5f49bb024aef2822e4af13593d770d
worktree: null
task_branch: null
files:
  - src/core/persistence/migration.ts
  - src/core/persistence/persistence.ts
  - src/core/persistence/schema.ts
---

# T016 — Fix wave 1 cycle 1 review findings in T005

## Context

Repair task created from the wave 1 cycle 1 review of T005.
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

1. **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads
2. Auto-save triggers on state change (debounced 500ms)
3. Quota exceeded: catches error, shows toast, offers export
4. Private browsing: detects unavailable storage, shows banner, offers export/import
5. Storage event: second tab save triggers reload in first tab

## Verify

```bash
set -e
(
pnpm tsc --noEmit && test -f src/core/persistence/persistence.ts
)
```

Heavy: no

## Review findings

### sc6
Criterion: **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads
- **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads — found (the failure rests on wave-1-owned substrate defects, not the Wave-2-scheduled reload walkthrough, PLAN.md:20): (a) the wave product does not typecheck — reviewer re-run `pnpm tsc --noEmit` at 7a1886f: exit 2, 7× TS2307 from T004's imports — so no buildable app can persist anything; (b) no automatic save path triggers on state change — `setupAutoSave` is a 10s interval poll with no caller (persistence.ts:91-95; reviewer git grep at 7a1886f), so player state is not saved across reloads by the product as delivered; (c) the cross-tab persistence mechanism can never fire (window `storage` listener vs IndexedDB writes, persistence.ts:113-123). Positive evidence: the substrate covers the criterion's data — SaveFileSchema persists player state including clanEvent.playerPoints/aiPoints/eventEndTime (clan scores + event timer) and research (schema.ts:11-71), with versioned migration and backup fallback, and loadGame restores it (persistence.ts:29-47). fix: land the T004 import decoupling and the T005 AC4/AC7 repairs listed above, then re-check SC6 next cycle.

### t005_ac4
Criterion: Auto-save triggers on state change (debounced 500ms)
- Auto-save triggers on state change (debounced 500ms) — found: `setupAutoSave` is a 10-second `setInterval` poll (persistence.ts:91-95) with no subscription to gameState changes and no 500ms debounce; reviewer `git grep setupAutoSave` at 7a1886f matches only its own definition — nothing in the product calls it. fix: replace the interval with `effect()` from @preact/signals watching `gameState.value`, debounce saves 500ms via clearTimeout/setTimeout (keep the pagehide/visibilitychange flush), and call setupAutoSave from the boot path the integration wave owns.

### t005_ac5
Criterion: Quota exceeded: catches error, shows toast, offers export
- Quota exceeded: catches error, shows toast, offers export — found: saveGame's catch logs to console and rethrows (persistence.ts:23-26); no toast and no export offer exists anywhere in the wave product. fix: add an exported persistence-error notification hook (typed callback registry or window CustomEvent) that fires on `QuotaExceededError` with an `exportSave()` payload; the UI wave binds the toast and "Export save" action to it.

### t005_ac6
Criterion: Private browsing: detects unavailable storage, shows banner, offers export/import
- Private browsing: detects unavailable storage, shows banner, offers export/import — found: `isStorageAvailable()` detection exists (persistence.ts:125-134) but no banner and no export/import offer is emitted or wired (no caller in the product at 7a1886f). fix: same notification-hook pattern — emit a storage-unavailable event from the detection path and bind the banner plus export/import actions in the UI wave.

### t005_ac7
Criterion: Storage event: second tab save triggers reload in first tab
- Storage event: second tab save triggers reload in first tab — found: saves are written to IndexedDB via idb-keyval (persistence.ts:1,21-22), while `setupStorageSync` listens to window `storage` events (persistence.ts:113-123); browsers fire `storage` only for localStorage/sessionStorage changes, so an IndexedDB write in a second tab can never trigger the first tab's listener and the reload never happens. fix: replace the storage-event mechanism with a `BroadcastChannel('terra-dome-save')` postMessage after each successful save plus a listener that reloads on a newer `savedAt`, or write a lightweight localStorage marker alongside each idb save and keep the storage listener for that marker.

## Log

- 2026-10-09 - created by dispatch_driver.py fix-tasks from wave 1 cycle 1
- 2026-10-09 - plan defect repair (wave 1 gate): Verify strengthened from file-existence to `pnpm tsc --noEmit` plus persistence.ts presence (AC/SC6 claims are behavioral).
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t016-verify): pass, exit 0; output tail:
  ```
  Lockfile is up to date, resolution step is skipped
  Progress: resolved 1, reused 0, downloaded 0, added 0
  Packages: +110
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Progress: resolved 110, reused 110, downloaded 0, added 110, done
  
  dependencies:
  + @preact/signals 1.3.4
  + idb-keyval 6.3.0
  + preact 10.29.8
  + zod 3.25.76
  
  devDependencies:
  + @types/node 22.20.5
  + jsdom 25.0.1
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 890ms using pnpm v11.4.0
  ```
