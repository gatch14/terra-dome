# Review — wave 1, cycle 1

Wave verdict: blocked
Cycle: 1
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

Contract violations (blocking):
- none

## T002 — Implement core game state signals and derived state: pass

- ✅ `gameState.value` has all required fields with correct initial values — src/core/state/gameState.ts:22 (500 materials / 300 energy / 0 research data), :26-27 (empty queues), :28 (eventEndTime +7 days), :37 (currency 1000), :39 (version); matches the plan-settled starting state (PLAN.md:172).
- ✅ `resourceRates.value` updates when buildings or research change — src/core/state/derived.ts:7-34: `computed` reads `gameState.value.buildings` and `state.research`, so any signal mutation recomputes rates (building production × level, completed research multipliers).
- ✅ `buildingQueue.value` reflects queued buildings with remaining time — src/core/state/derived.ts:55-64 maps `buildingQueue` ids to `{ id, endTime, position }` (absolute endTime; remaining derived from it).
- ✅ `researchQueue.value` reflects queued research with remaining time — src/core/state/derived.ts:66-75, same pattern over `researchQueue`.
- ✅ `availableResearch.value` shows only nodes with met prerequisites — src/core/state/derived.ts:77-81 filters `state === 'available'`; availability is set at hydration for prereq-free nodes (src/core/state/gameState.ts hydrateState, lines 54-80).
- ✅ TypeScript compiles without errors (`pnpm tsc --noEmit`) — orchestrator recorded Verify (T002 task Log): pass, exit 0 for `pnpm tsc --noEmit && test -f src/core/state/derived.ts` at the isolated base+patch.
- ✅ Interface: gameState signal — src/core/state/derived.ts:5 (re-export of gameState).
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: buildingQueue derived signal — src/core/state/derived.ts:55.
- ✅ Interface: researchQueue derived signal — src/core/state/derived.ts:66.
- ✅ Interface: availableResearch derived signal — src/core/state/derived.ts:77.

Warnings (non-blocking):
- AC5's locked→available transition when a prerequisite completes is not implemented in wave 1 (that logic belongs to the later research system, T008); availableResearch currently reflects hydration-time availability only. Expected wave sequencing, but the criterion wording assumes the later system — tighten when SC3 is judged.

Contract violations (blocking):
- none

## T003 — Implement timer system with absolute endTime pattern: pass

- ✅ TimerManager starts/stops interval on visibility change — src/core/time/timerManager.ts:50-63 (`setupVisibilityHandler`: hidden → `pause()`, visible → `tick(Date.now())` + `start()`); test 'pauses when hidden and catches up on visible' timerManager.test.ts:64-80 passes (reviewer re-run).
- ✅ registerTimer adds timer, calls onComplete when endTime reached — timerManager.ts:38-40 adds to the Map; tick fires `onComplete` and removes at :30-36; test timerManager.test.ts:26-41.
- ✅ tick(now) processes all timers, computes remaining correctly — timerManager.ts:30-36 iterates all timers with injected `now`; `getRemaining` :42-46 returns `max(0, endTime - Date.now())`.
- ✅ Multiple simultaneous timers work independently — test 'keeps multiple timers independent' timerManager.test.ts:43-58 (first fires at +1000 while second survives, fires at +2000).
- ✅ No timer drift: remaining = endTime - Date.now() always accurate — absolute-endTime pattern: remaining is always derived from `endTime - Date.now()` (timerManager.ts:44), never accumulated from interval counts; visible interval only triggers `tick(Date.now())` (:13-16).
- ✅ Unit tests pass for: single timer, multiple timers, pause/resume, visibility change — reviewer re-run `pnpm vitest run src/core/time/timerManager.test.ts` (sidecar at wave HEAD; these files are byte-identical to landing 19d29fe, no later commit touched them): 5 passed, exit 0. The recorded Verify (`test -f ...`) could not check this criterion, so this is reviewer-supplied evidence.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5 exports the `timerManager` singleton carrying all contract methods (matches the task Approach "Export singleton instance").
- ✅ Interface: TimerManager.registerTimer() — timerManager.ts:38.
- ✅ Interface: TimerManager.unregisterTimer() — timerManager.ts:40.
- ✅ Interface: TimerManager.tick() — timerManager.ts:30.
- ✅ Interface: TimerManager.start() — timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — timerManager.ts:22.

Warnings (non-blocking):
- T003's Verify command (`test -f src/core/time/timerManager.ts && test -f src/core/time/types.ts`) cannot fail once the files exist; it could not check AC1-AC6. Reviewer supplied the missing test-run evidence; core-module Verifies should run `pnpm tsc --noEmit` and the module's tests.
- The export is an object-literal singleton `timerManager`, not a `TimerManager` class; every contract capability is present — non-blocking wording drift, tighten if a class is required.

Contract violations (blocking):
- none

## T004 — Implement offline progression catch-up with 24h cap: fail

- ✅ elapsed clamped to 24h max (returns 24h worth of progress even after week) — src/core/time/offlineCatchup.ts:24 `Math.max(0, Math.min(now - state.lastSave, MAX_OFFLINE_MS))`, `MAX_OFFLINE_MS = 24 * 60 * 60 * 1000` at :9; test 'clamps elapsed time to 24h' offlineCatchup.test.ts:33-50 (logic present in diff; module currently unexecutable — see AC6 and the blocking finding below).
- ✅ Negative elapsed (clock skew) → 0 progress, no errors — offlineCatchup.ts:25 early-returns when `elapsed <= 0`; test 'clock skew' offlineCatchup.test.ts:22-30.
- ✅ Resources gain = rate × elapsedSec, capped at storage limits — offlineCatchup.ts:29-34 `min(limits.X, X + rates.X * elapsedSec)` using `storageLimits` (derived.ts:36-53); tests offlineCatchup.test.ts:33-50 and :52-64.
- ✅ Build/research timers reduced by elapsedSec, completed if <= 0 — offlineCatchup.ts:36-44 (buildings) and :46-54 (research): `endTime = max(now, endTime - elapsed)`, completion dispatched when `endTime <= now`; tests offlineCatchup.test.ts:66-88 and :90-102.
- ✅ Clan event AI points increase by AI_POINTS_PER_SEC × elapsedSec — offlineCatchup.ts:57-58 `state.clanEvent.aiPoints += aiRate * elapsedSec`; test :33-50 asserts the 24h-capped value against `AI_POINTS_PER_SEC[profile] * (MAX_OFFLINE_MS / 1000)`.
- ❌ Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence — found: reviewer re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts` (sidecar at wave HEAD): collection error, `Test Files 1 failed`, `no tests`, exit 1 — offlineCatchup.test.ts:6-9 imports `../systems/buildingDefinitions.js`, `../systems/resourceDefinitions.js`, `../systems/researchDefinitions.js`, `../systems/clanEventDefinitions.js`, none of which exist anywhere in the wave product (`git ls-tree` at landing abe05c5 and review HEAD 7a1886f: no `src/core/systems/` directory). Additionally, no zero-elapsed scenario exists in the file (actual cases: clock skew :22, 24h clamp :33, storage full :52, timer reduction :66, completion :90, event end :104). fix: decouple offlineCatchup.ts/resumeTimers.ts from the later-wave `src/core/systems/*` modules (see the blocking finding), register minimal test definitions inline in the test file instead of importing definition modules, and add a `lastSave === now` zero-elapsed test case; then re-run `pnpm vitest run src/core/time/offlineCatchup.test.ts`.
- ✅ Interface: applyOfflineProgress() — exported at offlineCatchup.ts:23 (module currently fails to load — see AC6/blocking finding).
- ✅ Interface: MAX_OFFLINE_MS — exported at offlineCatchup.ts:9.

Warnings (non-blocking):
- T004's Verify command (`test -f src/core/time/offlineCatchup.ts`) cannot fail once the file exists; its recorded pass concealed the broken imports and defeated AC1-AC6 checking entirely.
- AI points use a flat per-profile base rate (offlineCatchup.ts:12-16); this matches the task's own constant naming — no curve was required in wave 1.

Contract violations (blocking):
- ❌ T004 product imports modules outside the wave's delivered surface that do not exist — src/core/time/offlineCatchup.ts:4-7 and src/core/time/resumeTimers.ts:3-5 import `../systems/buildings.js`, `../systems/research.js`, `../systems/clanEvent.js`, `../systems/clanEventDefinitions.js` (`src/core/systems/*` is later-wave T006-T009 territory; `git ls-tree -r abe05c5 -- src/` and `git ls-tree -r 7a1886f -- src/` show no `src/core/systems/` directory). Reviewer re-run `pnpm tsc --noEmit` in the sidecar at wave HEAD: exit 2 with 7× TS2307 for exactly these imports — the wave product does not typecheck, `pnpm run build` (`tsc && vite build`) cannot succeed, and vitest cannot collect T004's suite. fix: invert the dependency — accept completion handlers as a parameter (e.g. `handlers: { completeBuilding, completeResearch, checkEventEnd }` with no-op defaults) and take the AI profile rates as a parameter or local constant instead of importing `CLAN_EVENT_CONFIG`, so the module compiles standalone; the systems wave injects the real implementations. Re-verify with `pnpm tsc --noEmit` and `pnpm vitest run` after the repair.

## T005 — Implement IndexedDB persistence with versioned saves and migration: fail

- ✅ saveGame writes to IndexedDB, loadGame reads back identical state — saveGame writes the versioned SaveFile via idb-keyval (IndexedDB) at persistence.ts:12-27 (SAVE_KEY :21, BACKUP_KEY :22); loadGame reads → migrateSave → Zod validation → returns data at persistence.ts:29-47; SaveFileSchema covers every GameState field (schema.ts:11-71), so the round-trip preserves the declared state (diff-checked; no test exists — see warnings).
- ✅ Version migration: v1 save loads into v2 schema with defaults — migration.ts:12-29 `migrateV1toV2` (slot remap via LEGACY_TO_SLOT, drops legacy `storage`, adds `lastResults: null`), version chain in migrateSave :31-59; `produceAccumulator` gets schema default 0 (schema.ts:52).
- ✅ Backup created on each successful save; corrupted save falls back to backup — backup written after every successful save (persistence.ts:22); invalid/corrupt primary falls back via persistence.ts:37-46 to `loadBackup()` :49-61.
- ❌ Auto-save triggers on state change (debounced 500ms) — found: `setupAutoSave` is a 10-second `setInterval` poll (persistence.ts:91-95) with no subscription to gameState changes and no 500ms debounce; reviewer `git grep setupAutoSave` at 7a1886f matches only its own definition — nothing in the product calls it. fix: replace the interval with `effect()` from @preact/signals watching `gameState.value`, debounce saves 500ms via clearTimeout/setTimeout (keep the pagehide/visibilitychange flush), and call setupAutoSave from the boot path the integration wave owns.
- ❌ Quota exceeded: catches error, shows toast, offers export — found: saveGame's catch logs to console and rethrows (persistence.ts:23-26); no toast and no export offer exists anywhere in the wave product. fix: add an exported persistence-error notification hook (typed callback registry or window CustomEvent) that fires on `QuotaExceededError` with an `exportSave()` payload; the UI wave binds the toast and "Export save" action to it.
- ❌ Private browsing: detects unavailable storage, shows banner, offers export/import — found: `isStorageAvailable()` detection exists (persistence.ts:125-134) but no banner and no export/import offer is emitted or wired (no caller in the product at 7a1886f). fix: same notification-hook pattern — emit a storage-unavailable event from the detection path and bind the banner plus export/import actions in the UI wave.
- ❌ Storage event: second tab save triggers reload in first tab — found: saves are written to IndexedDB via idb-keyval (persistence.ts:1,21-22), while `setupStorageSync` listens to window `storage` events (persistence.ts:113-123); browsers fire `storage` only for localStorage/sessionStorage changes, so an IndexedDB write in a second tab can never trigger the first tab's listener and the reload never happens. fix: replace the storage-event mechanism with a `BroadcastChannel('terra-dome-save')` postMessage after each successful save plus a listener that reloads on a newer `savedAt`, or write a lightweight localStorage marker alongside each idb save and keep the storage listener for that marker.
- ✅ Export/import round-trip preserves all state — `exportSave` serializes the full SaveFile (persistence.ts:63-70); `importSave` parses → migrates → validates → writes both keys (persistence.ts:72-84); the schema's field coverage makes the round-trip lossless for the declared state (diff-checked; untested).
- ✅ Interface: saveGame() — persistence.ts:12.
- ✅ Interface: loadGame() — persistence.ts:29.
- ✅ Interface: migrateSave() — src/core/persistence/migration.ts:31.
- ✅ Interface: applyOfflineProgress() — src/core/time/offlineCatchup.ts:23 (T004's module within this wave; currently fails to compile — see T004 blocking finding).
- ✅ Interface: MAX_OFFLINE_MS — src/core/time/offlineCatchup.ts:9 (same cross-reference).

Warnings (non-blocking):
- T005 ships no unit tests and its Verify command (`test -f src/core/persistence/schema.ts && test -f src/core/persistence/migration.ts`) cannot fail once the files exist; AC1-AC3 and AC8 were judgeable only from the diff. A persistence test file (fake-indexeddb or an idb-keyval mock) should accompany the repair.
- `importSave` is async (`Promise<boolean>`) while the Approach text shows a synchronous boolean; async is necessary for idb — non-blocking wording drift.
- `setupStorageSync` parses `event.newValue` without a guard (persistence.ts:116); malformed values would throw inside the listener — wrap in try/catch during the AC7 repair.

Contract violations (blocking):
- none (changed paths are limited to its three declared files plus its task file; the task-file diff only flips orchestrator-owned fields and appends Log entries)

## Intent coverage

### SC6 — **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads: fail

- ❌ **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads — found (the failure rests on wave-1-owned substrate defects, not the Wave-2-scheduled reload walkthrough, PLAN.md:20): (a) the wave product does not typecheck — reviewer re-run `pnpm tsc --noEmit` at 7a1886f: exit 2, 7× TS2307 from T004's imports — so no buildable app can persist anything; (b) no automatic save path triggers on state change — `setupAutoSave` is a 10s interval poll with no caller (persistence.ts:91-95; reviewer git grep at 7a1886f), so player state is not saved across reloads by the product as delivered; (c) the cross-tab persistence mechanism can never fire (window `storage` listener vs IndexedDB writes, persistence.ts:113-123). Positive evidence: the substrate covers the criterion's data — SaveFileSchema persists player state including clanEvent.playerPoints/aiPoints/eventEndTime (clan scores + event timer) and research (schema.ts:11-71), with versioned migration and backup fallback, and loadGame restores it (persistence.ts:29-47). fix: land the T004 import decoupling and the T005 AC4/AC7 repairs listed above, then re-check SC6 next cycle.
- Conflict report (not a veto): SC6 names "LocalStorage (or SQLite)" while the settled gated decision chose IndexedDB via idb-keyval (`.project/research/SYNTHESIS.md:46`, which binds per authority order). IndexedDB is treated as satisfying "local persistence" for this review; the SC6 wording should be tightened through the legal contract channel.

## Summary for orchestrator

- blocked findings (two disjoint file scopes; one fix task per scope suffices; SC6 re-check follows both):
  - Scope A — `src/core/time/{offlineCatchup.ts, offlineCatchup.test.ts, resumeTimers.ts}` (T004): imports of nonexistent later-wave `src/core/systems/*` modules break typecheck/build/test at wave HEAD (reviewer re-run: `pnpm tsc --noEmit` exit 2 with 7× TS2307; vitest collection failure with 0 tests run); the zero-elapsed test scenario is also missing. Repair: dependency inversion (injected completion handlers with no-op defaults + AI-rate parameter/local constant), add the zero-elapsed test, re-run `pnpm tsc --noEmit` and `pnpm vitest run`.
  - Scope B — `src/core/persistence/persistence.ts` (T005): AC4 (10s interval poll instead of debounced save-on-state-change), AC5 (no quota toast/export offer), AC6 (no private-browsing banner/export-import offer), AC7 (window `storage` listener can never fire for IndexedDB writes). Repair: `effect()`-based 500ms-debounced auto-save, typed persistence-error notification hook carrying `exportSave()`, BroadcastChannel (or localStorage marker) cross-tab sync.
- repeat offenders: none — cycle 1.
- warnings worth a human eye: T003/T004/T005 Verify commands are file-existence checks that cannot fail once files exist — T004's recorded pass concealed a module that breaks the entire build (consider mandating `pnpm tsc --noEmit` + module tests in core-module Verifies); T001's `## Interface contract` still lists saveGame()/loadGame()/migrateSave() after their documented move to T005; SC6's "LocalStorage (or SQLite)" wording diverges from the settled IndexedDB decision (SYNTHESIS.md:46); T002's AC5 depends on the later research system's locked→available transition (T008); T005 ships zero tests.
