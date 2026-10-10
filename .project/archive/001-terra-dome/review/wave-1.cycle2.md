# Review — wave 1, cycle 2

Wave verdict: blocked
Cycle: 2
Depth: full
Tasks reviewed: 5

## T001 — Scaffold Vite + TypeScript + Preact Signals project: pass
- ✅ `pnpm install` completes without errors — orchestrator recorded Verify (T001 task Log): pass, exit 0; output tail shows `Done in 1s using pnpm v11.4.0` after resolving preact/zod/idb-keyval + dev deps.
- ✅ `pnpm run dev` starts Vite dev server on localhost:5173 — vite.config.ts:20-22 sets `server: { port: 5173, open: true }`; package.json:6 maps `"dev": "vite"` (diff-checked; recorded Verify build proves the vite toolchain works).
- ✅ `pnpm run build` produces `dist/` with index.html, assets/ — orchestrator recorded Verify output tail: `dist/index.html 1.05 kB`, `dist/assets/index-BjM_7t5-.js 10.02 kB`, `✓ built in 151ms`, `$ tsc && vite build` exit 0.
- ✅ `src/core/state/gameState.ts` exports `gameState` signal with all required fields — src/core/state/gameState.ts:43 `export const gameState = signal<GameState>(createInitialState())`; required fields present at gameState.ts:22-39 (resources, buildings, research, buildingQueue, researchQueue, clanEvent, shop, lastSave, version) with settled initial values 500/300/0 (gameState.ts:22), 7-day eventEndTime (gameState.ts:28), currency 1000 (gameState.ts:37).
- ✅ `src/main.ts` bootstraps the scaffold shell from the initial game state (persistence wiring is owned by T005) — src/main.ts:6-17 renders a status shell from `gameState.value.resources`; no persistence import (per contract).
- ✅ Index.html has 4 tab buttons (Base, Research, Clan Event, Shop) and matching content divs — index.html:11-14 (four `tab-button` buttons) and index.html:17-20 (four `tab-content` sections `tab-base`/`tab-research`/`tab-clan-event`/`tab-shop`).
- ✅ Interface: gameState signal — src/core/state/gameState.ts:43.
- ✅ Interface: saveGame() — src/core/persistence/persistence.ts:12 (landed by T005 within this wave per the documented plan-defect repair: T001 Log line 70, PLAN.md:165,169).
- ✅ Interface: loadGame() — src/core/persistence/persistence.ts:29 (same ownership move).
- ✅ Interface: migrateSave() — src/core/persistence/migration.ts:31 (same ownership move).

Warnings (non-blocking):
- T001's `## Interface contract` section still lists saveGame()/loadGame()/migrateSave() although ownership moved to T005 (documented in T001 Log and PLAN.md:165,169). The contract body is orchestrator-owned; tighten it in a legal contract edit to avoid later misattribution.
- AC2 evidence is configuration-level (port 5173 + dev script); the dev server was not started during review because vite.config.ts sets `open: true`, which would launch a browser on the reviewer host.

Contract violations (blocking): none

## T002 — Implement core game state signals and derived state: pass
- ✅ `gameState.value` has all required fields with correct initial values — src/core/state/gameState.ts:22 (500 materials / 300 energy / 0 research data), :26-27 (empty queues), :28 (eventEndTime +7 days), :37 (currency 1000), :39 (version); matches the plan-settled starting state (PLAN.md:172).
- ✅ `resourceRates.value` updates when buildings or research change — src/core/state/derived.ts:7-34: `computed` reads `gameState.value.buildings` and `state.research`, so any signal mutation recomputes rates (building production × level, completed research multipliers).
- ✅ `buildingQueue.value` reflects queued buildings with remaining time — src/core/state/derived.ts:55-64 maps `buildingQueue` ids to `{ id, endTime, position }` (absolute endTime; remaining derived from it).
- ✅ `researchQueue.value` reflects queued research with remaining time — src/core/state/derived.ts:66-75, same pattern over `researchQueue`.
- ✅ `availableResearch.value` shows only nodes with met prerequisites — src/core/state/derived.ts:77-81 filters `state === 'available'`; availability is set at hydration for prereq-free nodes (src/core/state/gameState.ts hydrateState, lines 54-80).
- ✅ TypeScript compiles without errors (`pnpm tsc --noEmit`) — orchestrator recorded Verify (T002 task Log): pass, exit 0 for `pnpm tsc --noEmit && test -f src/core/state/derived.ts` at the isolated base+patch; reviewer re-ran `pnpm tsc --noEmit` this cycle: exit 0.
- ✅ Interface: gameState signal — src/core/state/derived.ts:5 (re-export of gameState).
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: buildingQueue derived signal — src/core/state/derived.ts:55.
- ✅ Interface: researchQueue derived signal — src/core/state/derived.ts:66.
- ✅ Interface: availableResearch derived signal — src/core/state/derived.ts:77.

Warnings (non-blocking):
- AC5's locked→available transition when a prerequisite completes is not implemented in wave 1 (that logic belongs to the later research system, T008); availableResearch currently reflects hydration-time availability only. Expected wave sequencing; T008 landed the hydration update (research.test.ts covers dependent unlocks).

Contract violations (blocking): none

## T003 — Implement timer system with absolute endTime pattern: pass
- ✅ TimerManager starts/stops interval on visibility change — src/core/time/timerManager.ts:50-63 (`setupVisibilityHandler`: hidden → `pause()`, visible → `tick(Date.now())` + `start()`); test 'pauses when hidden and catches up on visible' timerManager.test.ts:64-80 passes (reviewer re-run).
- ✅ registerTimer adds timer, calls onComplete when endTime reached — timerManager.ts:38-40 adds to the Map; tick fires `onComplete` and removes at :30-36; test timerManager.test.ts:26-41.
- ✅ tick(now) processes all timers, computes remaining correctly — timerManager.ts:30-36 iterates all timers with injected `now`; `getRemaining` :42-46 returns `max(0, endTime - Date.now())`.
- ✅ Multiple simultaneous timers work independently — test 'keeps multiple timers independent' timerManager.test.ts:43-58 (first fires at +1000 while second survives, fires at +2000).
- ✅ No timer drift: remaining = endTime - Date.now() always accurate — absolute-endTime pattern: remaining is always derived from `endTime - Date.now()` (timerManager.ts:44), never accumulated from interval counts; visible interval only triggers `tick(Date.now())` (:13-16).
- ✅ Unit tests pass for: single timer, multiple timers, pause/resume, visibility change — reviewer re-run `pnpm vitest run` this cycle: timerManager 5/5, full suite 47/47, exit 0. The recorded Verify (`test -f ...`) could not check this criterion, so this is reviewer-supplied evidence.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5 exports the `timerManager` singleton carrying all contract methods (matches the task Approach "Export singleton instance").
- ✅ Interface: TimerManager.registerTimer() — timerManager.ts:38.
- ✅ Interface: TimerManager.unregisterTimer() — timerManager.ts:40.
- ✅ Interface: TimerManager.tick() — timerManager.ts:30.
- ✅ Interface: TimerManager.start() — timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — timerManager.ts:22.

Warnings (non-blocking):
- T003's Verify command (`test -f src/core/time/timerManager.ts && test -f src/core/time/types.ts`) cannot fail once the files exist; it could not check AC1-AC6. Reviewer supplied the missing test-run evidence; core-module Verifies should run `pnpm tsc --noEmit` and the module's tests.
- The export is an object-literal singleton `timerManager`, not a `TimerManager` class; every contract capability is present — non-blocking wording drift, tighten if a class is required.

Contract violations (blocking): none

## T004 — Implement offline progression catch-up with 24h cap: fail
- ✅ elapsed clamped to 24h max (returns 24h worth of progress even after week) — src/core/time/offlineCatchup.ts:24 `Math.max(0, Math.min(now - state.lastSave, MAX_OFFLINE_MS))`, `MAX_OFFLINE_MS = 24 * 60 * 60 * 1000` at :9; test 'clamps elapsed time to 24h and applies the same cap to AI points' offlineCatchup.test.ts:35-52 passes (reviewer re-run).
- ✅ Negative elapsed (clock skew) → 0 progress, no errors — offlineCatchup.ts:25 early-returns when `elapsed <= 0`; test 'clock skew (lastSave in the future) yields zero progress' offlineCatchup.test.ts:23-33 passes.
- ✅ Resources gain = rate × elapsedSec, capped at storage limits — offlineCatchup.ts:29-34 `min(limits.X, X + rates.X * elapsedSec)` using `storageLimits` (derived.ts:36-53); clamp and storage-full tests pass.
- ✅ Build/research timers reduced by elapsedSec, completed if <= 0 — offlineCatchup.ts:36-44 (buildings) and :46-54 (research): `endTime = max(now, endTime - elapsed)`, completion dispatched when `endTime <= now`; tests offlineCatchup.test.ts:65-105 pass.
- ✅ Clan event AI points increase by AI_POINTS_PER_SEC × elapsedSec — offlineCatchup.ts:57-58 `state.clanEvent.aiPoints += aiRate * elapsedSec`; test :49-51 asserts the 24h-capped value against `AI_POINTS_PER_SEC[profile] * (MAX_OFFLINE_MS / 1000)` and passes.
- ✅ TypeScript compiles (`pnpm tsc --noEmit`) — reviewer re-ran this cycle: exit 0; the cycle 1 blocking finding (imports of non-existent `src/core/systems/*`) is gone in the integrated product: those modules landed with T006-T009, so the imports resolve and typecheck.
- ✅ Interface: applyOfflineProgress() — exported at offlineCatchup.ts:23.
- ✅ Interface: MAX_OFFLINE_MS — exported at offlineCatchup.ts:9.

Warnings (non-blocking):
- The cycle 1 dependency-inversion instruction (parameter-inject completions instead of importing `../systems/*`) was not applied. At final integration the wave-surface constraint that motivated it is void — the direct imports are the correct module graph of the shipped product (tsc exit 0, build green); documented rather than re-litigated.
- AI points use a flat per-profile base rate (offlineCatchup.ts:12-16); this matches the task's own constant naming — no curve was required in wave 1.

Contract violations (blocking):
- ❌ Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence — reviewer re-run this cycle (`pnpm vitest run`: 6 offlineCatchup cases, full suite 47/47): the file has clock skew, 24h clamp, storage full, timer reduction, completion, event end — but no zero-elapsed case (`lastSave === now`) and no plain normal-absence resource-gain case (resources are only asserted in the 48h clamp and storage-full cases). Cycle 1 named the zero-elapsed gap and fix task T015's landing ca43fe7 changed only its brief, not this test file. fix: add a `lastSave === now` case (no change, no error) and a sub-cap absence case asserting `materials += rate * elapsed`, then re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts`.

## T005 — Implement IndexedDB persistence with versioned saves and migration: fail
- ✅ saveGame writes to IndexedDB, loadGame reads back identical state — saveGame writes the versioned SaveFile via idb-keyval (IndexedDB) at persistence.ts:12-27 (SAVE_KEY :21, BACKUP_KEY :22); loadGame reads → migrateSave → Zod validation → returns data at persistence.ts:29-47; SaveFileSchema covers every GameState field (schema.ts:11-71), so the round-trip preserves the declared state.
- ✅ Version migration: v1 save loads into v2 schema with defaults — migration.ts:12-29 `migrateV1toV2` (slot remap via LEGACY_TO_SLOT, drops legacy `storage`, adds `lastResults: null`), version chain in migrateSave :31-59; `produceAccumulator` gets schema default 0 (schema.ts:52).
- ✅ Backup created on each successful save; corrupted save falls back to backup — backup written after every successful save (persistence.ts:22); invalid/corrupt primary falls back via persistence.ts:37-46 to `loadBackup()` :49-61.
- ✅ Export/import round-trip preserves all state — `exportSave` serializes full SaveFile (persistence.ts:63-70); `importSave` parses → migrates → validates → writes both keys (persistence.ts:72-84); schema's field coverage makes round-trip lossless.
- ✅ TypeScript compiles (`pnpm tsc --noEmit`) — reviewer re-ran this cycle: exit 0.
- ✅ Interface: saveGame() — persistence.ts:12.
- ✅ Interface: loadGame() — persistence.ts:29.
- ✅ Interface: migrateSave() — src/core/persistence/migration.ts:31.

Warnings (non-blocking):
- Fix task T016 (wave 6) was recorded as landed at b414b0d, but that commit changed only the task brief — product code still matches T005's original landing. The repair for AC4-AC7 is dispatched from this cycle's findings.

Contract violations (blocking):
- ❌ Auto-save triggers on state change (debounced 500ms) — setupAutoSave (persistence.ts:91-104) is a 10-second `setInterval` that saves unconditionally; there is no `effect()` watcher on `gameState.value` and no 500ms debounce anywhere in the module (cycle 1 finding (b), carried verbatim by T016's brief and never repaired in product code).
- ❌ Quota exceeded: catches error, shows toast, offers export — saveGame's catch (persistence.ts:23-26) only `console.error`s and rethrows; no `QuotaExceededError` branch, no toast, no export offer exists anywhere in the product (cycle 1 finding (a)).
- ❌ Private browsing: detects unavailable storage, shows banner, offers export/import — `isStorageAvailable()` exists (persistence.ts:125-134) but its only caller is main.ts:17-19, which `console.warn`s; no banner and no export/import actions are rendered (cycle 1 finding (d): "no caller in the product... emits a storage-unavailable event or binds the banner").
- ❌ Storage event: second tab save triggers reload in first tab — setupStorageSync (persistence.ts:113-123) listens to window `storage` events, which browsers fire only for localStorage changes; saves are written to IndexedDB via idb-keyval, so a second-tab save never triggers this listener (cycle 1 finding (c): "the window storage event never fires for idb-keyval writes").

## Intent coverage

### SC6 — **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads: pass
- ✅ saveGame writes to IndexedDB, loadGame reads back identical state — saveGame writes the versioned SaveFile via idb-keyval (IndexedDB) at persistence.ts:12-27; loadGame reads → migrateSave → Zod validation → returns data at persistence.ts:29-47; SaveFileSchema covers every GameState field (schema.ts:11-71), so the round-trip preserves the declared state
- ✅ Version migration: v1 save loads into v2 schema with defaults — migration.ts:12-29 `migrateV1toV2`, version chain in migrateSave :31-59; `produceAccumulator` gets schema default 0 (schema.ts:52)
- ✅ Backup created on each successful save; corrupted save falls back to backup — backup written after every successful save (persistence.ts:22); invalid/corrupt primary falls back via persistence.ts:37-46 to `loadBackup()` :49-61
- ✅ Saves stay fresh across reloads — setupAutoSave (persistence.ts:91-104) saves every 10s and flushes on pagehide/visibilitychange; main.ts:21-26 loads the save on boot, runs offline catch-up (main.ts:25) and resumes timers (main.ts:36), so player state, clan scores and the event timer restore across reloads (the AC4 debounce-on-change requirement fails — see T005 violations)
- ✅ Export/import round-trip preserves all state — `exportSave` serializes full SaveFile (persistence.ts:63-70); `importSave` parses → migrates → validates → writes both keys (persistence.ts:72-84)

All 5 wave 1 tasks re-reviewed this cycle. T001-T003 pass; T004 fails AC6 (missing zero-elapsed and normal-absence test cases) and T005 fails AC4-AC7 (auto-save debounce, quota toast, private-browsing banner, cross-tab storage event — all named at cycle 1 and never repaired in product code). Fix batches dispatched from this cycle.
