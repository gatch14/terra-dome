# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — dispatched → `.project/research/evidence-domain.md` — INTENT.md Section 7: tech tree patterns, AI clan behavior, domain terminology
- `stack` — dispatched → `.project/research/evidence-stack.md` — INTENT.md Section 7: stack choice, state management, persistence (localStorage vs sql.js)
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — INTENT.md Section 7: offline progression catch-up, timer drift, save corruption, UX failures
- `similar` — dispatched → `.project/research/evidence-similar.md` — INTENT.md Section 7: comparable products, open-source references, lessons from failed prototypes

## Question assignments

- `[RESEARCH] Which stack gives fastest iteration for base builder + tabs + timers + persistence?` → `stack`
- `[RESEARCH] Centralized store vs simple event bus vs reactive signals?` → `stack`
- `[RESEARCH] How to handle offline progression catch-up cleanly?` → `pitfalls`
- `[RESEARCH] Data-driven (JSON) vs code-defined tech tree? Schema for unlocks/prereqs?` → `domain`
- `[RESEARCH] AI clan behavior: simple fixed schedule or reactive to player?` → `domain`
- `[RESEARCH] localStorage vs sql.js for persistence?` → `stack`