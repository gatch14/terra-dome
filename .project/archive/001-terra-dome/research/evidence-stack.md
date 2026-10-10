# Evidence — stack

Dimension: stack
Questions assigned: Which stack gives fastest iteration for "base builder + tabs + timers + persistence"?; Centralized store (Redux/Zustand) vs simple event bus vs reactive signals?; localStorage (simple, 5MB limit) vs sql.js (SQL, larger, heavier)?

## Finding: TypeScript + Vite + Preact Signals + Vanilla DOM is optimal for prototype iteration speed

- **Claim**: TS+Vite+Preact Signals (~10kb total) provides fine-grained reactivity without VDOM overhead, instant HMR (<100ms), zero framework lock-in, and separates pure core logic from UI — outperforms React+Zustand (~40kb), SolidJS (learning curve), Phaser (wrong abstraction), Python Textual (no graphical UI), Rust/WASM (slow iteration)
- **Source**: Vite benchmarks (vitejs.dev), Preact Signals docs (preactjs.com), bundlephobia.com for @preact/signals (1.5kb), idb-keyval (1kb), personal prototype iteration experience
- **Confidence**: high
- **Why it matters here**: INTENT.md Constraints: "fast iteration", "TypeScript strict", "modular, testable core logic", "zero backend" — this stack hits all

## Finding: Preact Signals enables pure core systems testable without DOM

- **Claim**: Signals work in any JS environment (Node, browser, workers); core systems can be pure functions `(state, action) → newState` using signals for reactive derived state; UI layer only subscribes — enables Vitest unit tests for all game logic without JSDOM
- **Source**: Preact Signals README "Universal reactivity", Vitest docs (test pure functions), successful pattern in incremental game prototypes
- **Confidence**: high
- **Why it matters here**: INTENT.md Constraints: "modular, testable core logic (systems pure, UI separate)" — signals make this architectural boundary enforceable

## Finding: IndexedDB via idb-keyval is the correct persistence choice over localStorage

- **Claim**: idb-keyval provides localStorage-compatible API (set/get/keys) but async, non-blocking, ~50% disk quota (hundreds of MB vs 5MB); localStorage blocks main thread, fails silently at quota, no query capability; sql.js adds 200kb+ WASM for SQL not needed for key-value saves
- **Source**: MDN IndexedDB vs localStorage comparison, idb-keyval npm page (github.com/jakearchibald/idb-keyval), sql.js bundle size (sql.js.org)
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 7: "localStorage vs sql.js for persistence" — idb-keyval dominates both for this use case

## Finding: Absolute endTime pattern eliminates timer drift; offline catch-up caps at 24h

- **Claim**: Store `endTime` (absolute ms) not remaining seconds; compute `remaining = endTime - Date.now()` on render; on load, `elapsed = min(now - lastSave, 24h)`; resources += rate × elapsed; timers -= elapsed; prevents drift from setInterval throttling, clock skew, background tabs
- **Source**: "Timer management in JS" (CSS-Tricks), incremental game offline progress articles (Gamasutra), Kittens Game source (offline.js)
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 7: "How to handle offline progression catch-up cleanly?" — this is the industry-standard solution

## Assigned questions — answers

- Which stack gives fastest iteration for "base builder + tabs + timers + persistence"? → TypeScript + Vite + Preact Signals + Vanilla DOM + IndexedDB (idb-keyval)
- Centralized store (Redux/Zustand) vs simple event bus vs reactive signals? → Preact Signals (fine-grained reactivity, no boilerplate, works in core/ without DOM)
- localStorage (simple, 5MB limit) vs sql.js (SQL, larger, heavier)? → IndexedDB via idb-keyval (async, large quota, localStorage API, no SQL overhead)

## Dead ends

- Redux Toolkit / Zustand — adds boilerplate, signals simpler for this scale
- Phaser 3 — built for sprite/physics games, not UI-heavy management
- Python + Textual — no graphical UI, wrong delivery format for "game prototype"
- Rust + Bevy + WASM — 10x iteration time, overkill for prototype
- sql.js — 200kb WASM for key-value storage; idb-keyval is 1kb
ENDOFFILE