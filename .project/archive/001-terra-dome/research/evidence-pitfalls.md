# Evidence — pitfalls

Dimension: pitfalls
Questions assigned: How to handle offline progression (catch-up on load) cleanly?

## Finding: Offline catch-up must clamp elapsed time and validate clock direction

- **Claim**: Algorithm: `elapsed = Math.max(0, Math.min(now - lastSave, MAX_OFFLINE_MS))` where MAX_OFFLINE_MS = 24h; resources = min(capacity, current + rate × elapsed); timers = max(0, endTime - now); prevents negative gains from clock skew, caps runaway accumulation from long absence
- **Source**: Kittens Game offline.js, Antimatter Dimensions offline calculation, incremental game design articles (Gamasutra "Idle Game Offline Progress")
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 7 explicitly asks this; prototype must survive clock changes and week-long absences

## Finding: Background tab throttling requires visibilitychange + catch-up, not setInterval

- **Claim**: Browsers throttle setInterval to 1/min in background tabs; solution: single `setInterval(1000)` when `document.visibilityState === 'visible'`, pause on `hidden`, on `visibilitychange` to `visible` → run `applyOfflineProgress()` with real elapsed; timers use absolute `endTime` so visual countdown is accurate
- **Source**: MDN "Page Visibility API", Chrome tab throttling docs (developers.google.com), Preact Signals reactivity handles render updates
- **Confidence**: high
- **Why it matters here**: Pitfalls Section 3 "Timer drift in JS" — this pattern is the only reliable fix

## Finding: Save corruption mitigated by versioned schema + backup + Zod validation

- **Claim**: Save format: `{ version: 2, data: {...}, savedAt: 1234567890 }`; on load: validate with Zod schema → if valid, migrate if version < current → keep previous valid save as `backup` key; on quota exceeded: catch, alert, offer export JSON
- **Source**: idb-keyval error handling docs, Zod schema validation pattern, localForage migration strategy
- **Confidence**: high
- **Why it matters here**: Pitfalls Section 2 "Save corruption", "Schema migration", "Quota exceeded" — all addressed

## Finding: Concurrent tabs handled by storage event + version check

- **Claim**: `window.addEventListener('storage', e => { if (e.key === 'save' && e.newValue) reload(); })`; each save increments `version`; on load, if `version < localVersion` → reload; simple last-write-wins acceptable for single-player prototype
- **Source**: MDN StorageEvent, localForage multi-tab pattern
- **Confidence**: medium
- **Why it matters here**: Pitfalls Section 2 "Concurrent tabs" — low risk for prototype but good hygiene

## Finding: UX dead clicks prevented by disabled-state tooltips + loading indicators

- **Claim**: Buttons show `disabled` with `title="Requires Lab Lv.2"` when unavailable; async actions (save, purchase) show spinner + disable; toast notifications for all state changes ("+50 Clan Points", "Research completed: Efficient Smelting")
- **Source**: Nielsen Norman Group "Disabled Buttons UX", Material Design disabled state guidelines
- **Confidence**: high
- **Why it matters here**: Pitfalls Section 4 "Dead clicks", "Invisible progress" — direct UX mitigations

## Finding: Event end while offline handled by results modal on next load

- **Claim**: On `applyOfflineProgress()`: if `now > eventEndTime` and event not yet resolved → compute final scores, award rewards, show modal "Clan Event Ended: Your clan won! Rewards: 500 Gems, 10x 1h Speedup"; auto-start next cycle
- **Source**: Last Z KvK end-of-event flow (wiki), Whiteout Survival event resolution
- **Confidence**: medium
- **Why it matters here**: Pitfalls Section 4 "Event ends while offline" — ensures player never misses resolution

## Assigned questions — answers

- How to handle offline progression (catch-up on load) cleanly? → Clamped elapsed (max 24h), absolute endTime for timers, resource gain = rate × elapsed (capped at storage), IndexedDB async save, visibilitychange-triggered catch-up, versioned Zod-validated saves with backup

## Dead ends

- Service Workers for background sync — overkill, no server, adds complexity
- Web Workers for timer precision — main thread `endTime` pattern sufficient; workers add messaging overhead
- CRDTs for multi-tab sync — single-player prototype, last-write-wins acceptable
ENDOFFILE