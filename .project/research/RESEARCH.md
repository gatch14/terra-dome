# RESEARCH.md — M001 Research Dispatch Manifest

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

---

## Standard Dimensions

| Dimension | Dispatched | Output File | Assigned Questions |
|-----------|------------|-------------|-------------------|
| **domain** | yes | `evidence-domain.md` | • What are the core loops & terminology of peaceful KvK base-builders (Last Z, Whiteout Survival, etc.)?<br>• How do tech trees typically structure prerequisites, costs, effects?<br>• What AI clan behavior patterns exist for asynchronous competition? |
| **stack** | yes | `evidence-stack.md` | • Which stack (TS+Vite+DOM, TS+Phaser, Python+Textual, Rust+Bevy/WASM) best fits: fast iteration, timers, tabs, local persistence, zero backend?<br>• localStorage vs sql.js for persistence: capacity, query ability, bundle size?<br>• State management: signals (Preact/signals), Zustand, Redux Toolkit, or simple event bus? |
| **pitfalls** | yes | `evidence-pitfalls.md` | • Offline progression catch-up: common algorithms, edge cases (clock skew, background tabs)?<br>• Timer drift in JS (setTimeout vs requestAnimationFrame vs Web Workers)?<br>• Save corruption / migration strategy for local-first prototype?<br>• UX: tab switching during active timers, background tab throttling? |
| **similar** | yes | `evidence-similar.md` | • Open-source / deconstructed references: Last Z mechanics, Whiteout Survival loops<br>• Existing prototypes / tutorials for base-builder + clan event (GitHub, itch.io)<br>• Lessons from failed/abandoned similar prototypes |

---

## Custom Dimensions

None for this milestone.

---

## Dispatch

- `domain` — dispatched → `.project/research/evidence-domain.md` — INTENT.md Section 7: tech tree patterns, AI clan behavior, domain terminology
- `stack` — dispatched → `.project/research/evidence-stack.md` — INTENT.md Section 7: stack choice, state management, persistence (localStorage vs sql.js)
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — INTENT.md Section 7: offline progression catch-up, timer drift, save corruption, UX failures
- `similar` — dispatched → `.project/research/evidence-similar.md` — INTENT.md Section 7: comparable products, open-source references, lessons from failed prototypes

## Question assignments

- `[RESEARCH] Which stack gives fastest iteration for "base builder + tabs + timers + persistence"?` → `stack`
- `[RESEARCH] Centralized store (Redux/Zustand) vs simple event bus vs reactive signals?` → `stack`
- `[RESEARCH] How to handle offline progression (catch-up on load) cleanly?` → `pitfalls`
- `[RESEARCH] Data-driven (JSON) vs code-defined? Schema for unlocks/prereqs?` → `domain`
- `[RESEARCH] AI clan behavior: simple fixed schedule or reactive to player?` → `domain`
- `[RESEARCH] localStorage (simple, 5MB limit) vs sql.js (SQL, larger, heavier)?` → `stack`
- `[RESEARCH] What open-source prototypes exist for base-builder + clan event mechanics?` → `similar`