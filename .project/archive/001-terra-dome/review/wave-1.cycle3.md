# Review — wave 1, cycle 3

Wave verdict: pass
Cycle: 3
Depth: full
Tasks reviewed: 5

## T001 — Scaffold Vite + TypeScript + Preact Signals project: pass
- ✅ `pnpm install` completes without errors — orchestrator recorded Verify (T001 task Log): pass, exit 0; output tail shows `Done in 1s using pnpm v11.4.0` after resolving preact/zod/idb-keyval + dev deps.
- ✅ `pnpm run dev` starts Vite dev server on localhost:5173 — vite.config.ts:20-22 sets `server: { port: 5173, open: true }`; package.json:6 maps `"dev": "vite"` (diff-checked; recorded Verify build proves the vite toolchain works).
- ✅ `pnpm run build` produces `dist/` with index.html, assets/ — reviewer re-run this cycle: `pnpm build` exit 0 (`dist/index.html 0.39 kB`, `dist/assets/index-*.css 13.28 kB`, `dist/assets/index-*.js 120.61 kB`, `✓ built in 448ms`).
- ✅ `src/core/state/gameState.ts` exports `gameState` signal with all required fields — src/core/state/gameState.ts:43 `export const gameState = signal<GameState>(createInitialState())`; required fields present at gameState.ts:22-39 (resources, buildings, research, buildingQueue, researchQueue, clanEvent, shop, version).
- ✅ `src/main.ts` bootstraps the scaffold shell from the initial game state (persistence wiring is owned by T005) — src/main.ts:16-43 `init()` loads the save, hydrates, runs offline catch-up and renders `<App/>` into `#app` (persistence wiring now lands with T005 per the documented ownership move).
- ✅ Index.html has 4 tab buttons (Base, Research, Clan Event, Shop) and matching content divs — index.html:11-14 (four `tab-button` buttons) and index.html:17-20 (four `tab-content` sections); the live app additionally renders the 4-tab `TabBar` (TabBar.tsx:18-29, role=tablist/tab/aria-selected).
- ✅ Interface: gameState signal — src/core/state/gameState.ts:43.
- ✅ Interface: saveGame() — src/core/persistence/persistence.ts:24 (ownership documented in T001 Log and PLAN.md:165,169).
- ✅ Interface: loadGame() — src/core/persistence/persistence.ts:46 (same ownership move).
- ✅ Interface: migrateSave() — src/core/persistence/migration.ts:34 (same ownership move).

Warnings (non-blocking):
- T001's `## Interface contract` section still lists saveGame()/loadGame()/migrateSave() although ownership moved to T005 (documented in T001 Log and PLAN.md:165,169); tighten in a legal contract edit to avoid misattribution.
- AC2 evidence is configuration-level (port 5173 + dev script); the dev server was not started during review because vite.config.ts sets `open: true`, which would launch a browser on the reviewer host.
- T001's Verify was the `pnpm install --frozen-lockfile && pnpm run build` sidecar run (recorded pass); reviewer supplied the fresh build evidence above.

Contract violations (blocking): none

## T002 — Implement core game state signals and derived state: pass
- ✅ `gameState.value` has all required fields with correct initial values — src/core/state/gameState.ts:22 (500 materials / 300 energy / 0 research data), :26-27 (empty queues), :28 (eventEndTime +7 days), :37 (currency 1000), :39 (version); matches the plan-settled starting state (PLAN.md:172).
- ✅ `resourceRates.value` updates when buildings or research change — src/core/state/derived.ts:7-36: `computed` reads `gameState.value.buildings` and `state.research`, so any signal mutation recomputes rates (building production × level, completed research multipliers).
- ✅ `buildingQueue.value` reflects queued buildings with remaining time — src/core/state/derived.ts:92-101 maps `buildingQueue` ids to `{ id, endTime, position }` (absolute endTime; remaining derived from it).
- ✅ `researchQueue.value` reflects queued research with remaining time — src/core/state/derived.ts:103-112, same pattern over `researchQueue`.
- ✅ `availableResearch.value` shows only nodes with met prerequisites — src/core/state/derived.ts:114-119 filters `state === 'available'`; availability is set at hydration for prereq-free nodes (gameState.ts:59 `hydrateState`).
- ✅ TypeScript compiles without errors (`pnpm tsc --noEmit`) — orchestrator recorded Verify (T002 task Log): pass, exit 0; reviewer re-ran this cycle: exit 0.
- ✅ Interface: gameState signal — src/core/state/derived.ts:5 (re-export of gameState).
- ✅ Interface: resourceRates derived signal — src/core/state/derived.ts:7.
- ✅ Interface: buildingQueue derived signal — src/core/state/derived.ts:92.
- ✅ Interface: researchQueue derived signal — src/core/state/derived.ts:103.
- ✅ Interface: availableResearch derived signal — src/core/state/derived.ts:114.

Warnings (non-blocking):
- AC5's locked→available transition when a prerequisite completes belongs to the research system (T008) and is implemented there (research.ts:71-91 flips prereq-met nodes; research.test.ts covers dependent unlocks — 12/12 this cycle).

Contract violations (blocking): none

## T003 — Implement timer system with absolute endTime pattern: pass
- ✅ TimerManager starts/stops interval on visibility change — src/core/time/timerManager.ts:50-63 (`setupVisibilityHandler`: hidden → `pause()`, visible → `tick(Date.now())` + `start()`); test 'pauses when hidden and catches up on visible' timerManager.test.ts:79 passes (reviewer re-run this cycle).
- ✅ registerTimer adds timer, calls onComplete when endTime reached — timerManager.ts:38-40 adds to the Map; tick fires `onComplete` and removes at :30-36; test timerManager.test.ts:25.
- ✅ tick(now) processes all timers, computes remaining correctly — timerManager.ts:30-36 iterates all timers with injected `now`; `getRemaining` :42-46 returns `max(0, endTime - Date.now())`.
- ✅ Multiple simultaneous timers work independently — test 'keeps multiple timers independent' timerManager.test.ts:40 (first fires at +1000 while second survives, fires at +2000).
- ✅ No timer drift: remaining = endTime - Date.now() always accurate — absolute-endTime pattern: remaining is always derived from `endTime - Date.now()` (timerManager.ts:44), never accumulated from interval counts; visible interval only triggers `tick(Date.now())` (:13-16).
- ✅ Unit tests pass for: single timer, multiple timers, pause/resume, visibility change — reviewer re-run this cycle: `pnpm vitest run` → timerManager 5/5 (tests at timerManager.test.ts:25,40,54,63,79), full suite 56/56, exit 0. The recorded Verify (`test -f ...`) could not check this criterion, so this is reviewer-supplied evidence.
- ✅ Interface: TimerManager — src/core/time/timerManager.ts:5 exports the `timerManager` singleton carrying all contract methods.
- ✅ Interface: TimerManager.registerTimer() — timerManager.ts:38.
- ✅ Interface: TimerManager.unregisterTimer() — timerManager.ts:40.
- ✅ Interface: TimerManager.tick() — timerManager.ts:30.
- ✅ Interface: TimerManager.start() — timerManager.ts:10.
- ✅ Interface: TimerManager.pause() — timerManager.ts:22.

Warnings (non-blocking):
- T003's Verify command (`test -f src/core/time/timerManager.ts && test -f src/core/time/types.ts`) cannot fail once the files exist; reviewer supplied the test-run evidence (carried from cycle 2).
- The export is an object-literal singleton `timerManager`, not a `TimerManager` class; every contract capability is present — non-blocking wording drift.

Contract violations (blocking): none

## T004 — Implement offline progression catch-up with 24h cap: pass
- ✅ elapsed clamped to 24h max (returns 24h worth of progress even after week) — src/core/time/offlineCatchup.ts:24 `Math.max(0, Math.min(now - state.lastSave, MAX_OFFLINE_MS))`, `MAX_OFFLINE_MS = 24 * 60 * 60 * 1000` at :9; test 'clamps elapsed time to 24h and applies the same cap to AI points' offlineCatchup.test.ts:35 passes (reviewer re-run this cycle).
- ✅ Negative elapsed (clock skew) → 0 progress, no errors — offlineCatchup.ts:25 early-returns when `elapsed <= 0`; test 'clock skew (lastSave in the future) yields zero progress' offlineCatchup.test.ts:23 passes.
- ✅ Resources gain = rate × elapsedSec, capped at storage limits — offlineCatchup.ts:29-34 `min(limits.X, X + rates.X * elapsedSec)` using `storageLimits` (derived.ts:70-90); tests offlineCatchup.test.ts:54 (storage full) and :138 (normal absence asserts `materials += rate * elapsed` under the caps) pass.
- ✅ Build/research timers reduced by elapsedSec, completed if <= 0 — offlineCatchup.ts:36-44 (buildings) and :46-54 (research): `endTime = max(now, endTime - elapsed)`, completion dispatched when `endTime <= now`; tests offlineCatchup.test.ts:65 and :86 pass.
- ✅ Clan event AI points increase by AI_POINTS_PER_SEC × elapsedSec — offlineCatchup.ts:57-58 `state.clanEvent.aiPoints += aiRate * elapsedSec`; test :35 asserts the 24h-capped value against `AI_POINTS_PER_SEC[profile] * (MAX_OFFLINE_MS / 1000)` and passes.
- ✅ Unit tests cover: normal absence, long absence (>24h), clock skew, zero elapsed, event end during absence — reviewer re-run this cycle (`pnpm vitest run`: offlineCatchup 8 tests, full suite 56/56, exit 0): normal absence (:138), long absence >24h clamp (:35), clock skew (:23), zero elapsed (:124, `lastSave === now` → no change), event end during absence (:107). The two cases the cycle 2 review found missing (zero-elapsed, plain normal absence) were added by fix task T024's landing 3e1d104, closing this wave's only blocking finding.
- ✅ TypeScript compiles (`pnpm tsc --noEmit`) — reviewer re-run this cycle: exit 0; the imports of `../systems/*` resolve in the integrated product (modules landed with T006-T009).
- ✅ Interface: applyOfflineProgress() — exported at offlineCatchup.ts:23.
- ✅ Interface: MAX_OFFLINE_MS — exported at offlineCatchup.ts:9.

Warnings (non-blocking):
- The cycle 1 dependency-inversion instruction (parameter-inject completions instead of importing `../systems/*`) was not applied; at final integration the wave-surface constraint that motivated it is void — the direct imports are the correct module graph of the shipped product (tsc exit 0, build green).
- AI points use a flat per-profile base rate (offlineCatchup.ts:12-16); no curve was required in wave 1.

Contract violations (blocking): none

## T005 — Implement IndexedDB persistence with versioned saves and migration: pass
- ✅ saveGame writes to IndexedDB, loadGame reads back identical state — saveGame writes the versioned SaveFile via idb-keyval (persistence.ts:24-44, SAVE_KEY :8, BACKUP_KEY :9); loadGame reads → migrateSave → Zod validation → returns data (persistence.ts:46-65); SaveFileSchema covers every GameState field (schema.ts:14-71), so the round-trip preserves the declared state.
- ✅ Version migration: v1 save loads into v2 schema with defaults — migration.ts:16-29 `migrateV1toV2` (slot remap via LEGACY_TO_SLOT, drops legacy `storage`, adds `lastResults: null`), version chain in migrateSave migration.ts:34-62; `produceAccumulator` gets schema default 0 (schema.ts).
- ✅ Backup created on each successful save; corrupted save falls back to backup — backup written after every successful save (persistence.ts:34); invalid/corrupt primary falls back via persistence.ts:56/:63 to `loadBackup()` :67-80.
- ✅ Auto-save triggers on state change (debounced 500ms) — `setupAutoSave(debounceMs = 500)` (persistence.ts:110-139): an `effect()` on `gameState.value` (:123-126) re-schedules a 500ms debounce timer on every `touch()` (:113-119), plus a flush on `pagehide`/`visibilitychange` (:128-138); `teardownAutoSave` :141-150. Landed by fix task T024 (commit 3e1d104), closing this wave's cycle 2 finding.
- ✅ Quota exceeded: catches error, shows toast, offers export — `SAVE_QUOTA_EVENT` (persistence.ts:12), `isQuotaError` :19-22, dispatch on failed save :37-40; App.tsx:60-66 listens, shows a warning toast and offers `window.confirm` → `downloadSave()` (App.tsx:27-35). Landed by T024.
- ✅ Private browsing: detects unavailable storage, shows banner, offers export/import — `isStorageAvailable()` (persistence.ts:180-189) read at App.tsx:58; when false, App.tsx:101-112 renders `role="alert"` banner "Storage unavailable — progress will not save." with Export save / Import save buttons wired to downloadSave (App.tsx:27) and handleImportFile (App.tsx:37-50). Landed by T024.
- ✅ Storage event: second tab save triggers reload in first tab — saveGame posts `{ savedAt }` on a BroadcastChannel (persistence.ts:36); setupStorageSync opens channel `terra-dome-save` (:168-177) and reloads when the incoming savedAt is newer than `lastSeenSavedAt` (:170-176); the legacy window `storage` listener remains at :155-167. IndexedDB writes never fire window storage events, so the BroadcastChannel is the correct mechanism — landed by T024.
- ✅ Export/import round-trip preserves all state — `exportSave` serializes full SaveFile (persistence.ts:82-89); `importSave` parses → migrates → validates → writes both keys (persistence.ts:91-103); UI wiring at App.tsx:27-50; schema field coverage makes round-trip lossless.
- ✅ TypeScript compiles (`pnpm tsc --noEmit`) — reviewer re-run this cycle: exit 0.
- ✅ Interface: saveGame() — persistence.ts:24.
- ✅ Interface: loadGame() — persistence.ts:46.
- ✅ Interface: migrateSave() — src/core/persistence/migration.ts:34.

Warnings (non-blocking):
- Fix task T016's landing b414b0d changed only its task brief (documented in cycle 2); the AC4-AC7 repair landed later with T024 (3e1d104). Goal-backward, every criterion now holds in product code — recorded here so the provenance stays visible.
- Quota/banner/cross-tab paths are covered by code inspection; no dedicated persistence test file exists (the auto-save and offline suites exercise the surrounding flows). Judged non-blocking at prototype scope.

Contract violations (blocking): none

## Intent coverage

### SC6 — **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads: pass
- ✅ saveGame writes to IndexedDB, loadGame reads back identical state — persistence.ts:24-65 with Zod validation (schema.ts:14-71); SaveFileSchema covers every GameState field including clanEvent and shop
- ✅ Version migration: v1 save loads into v2 schema with defaults — migration.ts:16-29 and version chain at migration.ts:34-62
- ✅ Backup created on each successful save; corrupted save falls back to backup — persistence.ts:34 (backup write), :56/:63 (fallback), :67-80 (loadBackup)
- ✅ Saves stay fresh across reloads — effect-based debounced auto-save (persistence.ts:110-139) plus flush on pagehide/visibilitychange; main.ts:21-39 loads the save on boot, runs offline catch-up (main.ts:25) and resumes timers (main.ts:36-37), so player state, clan scores and the event timer restore across reloads
- ✅ Export/import round-trip preserves all state — exportSave (persistence.ts:82-89) / importSave (persistence.ts:91-103), UI wired at App.tsx:27-50 and the storage-unavailable banner (App.tsx:101-112)
- ✅ Cross-tab freshness — BroadcastChannel post on save (persistence.ts:36) and reload-on-newer-save (persistence.ts:168-177)

All 5 wave 1 tasks re-reviewed this cycle and pass. The cycle 2 blocking findings (T004 AC6 missing test cases; T005 AC4-AC7 auto-save debounce, quota toast, private-browsing banner, cross-tab storage event) were fixed by T024's landing 3e1d104 with product code and tests; reviewer evidence this cycle: `pnpm tsc --noEmit` exit 0, `pnpm vitest run` 56/56 exit 0, `pnpm build` exit 0.
