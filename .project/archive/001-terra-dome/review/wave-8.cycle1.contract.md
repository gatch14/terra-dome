# Review — wave 8, cycle 1

Wave verdict: pass
Cycle: 1
Depth: deep
Tasks reviewed: 2
Lens: contract

## T020 — Fix wave 3 cycle 1 review findings in T010: pass

- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — slots expose native buttons so Tab/Enter work natively (add BuildingSlot.tsx:116, upgrade :90, cancel :91); Escape closes the picker via the window keydown listener (:18-25, removes the listener on cleanup :25) and the dialog's own `onKeyDown` (:127); the picker is a real `role="dialog" aria-modal="true"` (:122-127). The wave 3 cycle 1 keyboard finding that spawned this task is refuted by the diff: BuildingSlot.tsx is unchanged since T010's landing c11305a0 and already carried these handlers (refutation recorded in the wave 3 cycle 2 reviews; the file hash is identical at 286c495e's tree).

Warnings (non-blocking):
- T020's own landing 286c495e changed only its task brief; no repair was needed because the cycle 1 finding misread the code. Recorded for provenance; the criterion holds in product code as cited.

Contract violations (blocking): none

## T021 — Fix wave 3 cycle 1 review findings in T011: pass

- ✅ Click available node → confirmation → starts research, adds to queue — ResearchScreen.handleStartResearch confirms before mutating: `window.confirm('Start research <name>?')` (ResearchScreen.tsx:15) gates the `startResearch` call (:16); the queue receives the item through startResearch (research.ts:20-45) and renders in ResearchQueue (ResearchQueue.tsx:25-44); research.test.ts:40-53 (reviewer re-run this cycle, passed). The confirmation gate was added by fix task T025 (commit 6bb42ab6) — see Warnings.

Warnings (non-blocking):
- T021's own landing 227d5524 changed only its task brief (retracted in the wave 3 cycle 2 rewrite, where T011 failed AC4 twice); the actual repair landed with T025 (6bb42ab6). Goal-backward the criterion now holds, evidenced above; provenance documented rather than hidden.

Contract violations (blocking): none

## Summary for orchestrator

- Both wave 8 tasks pass; the wave owns no INTENT success criterion (no Intent coverage section, matching the coverage plan).
- T020's finding was refuted (original T010 code already satisfied it); T021's finding was real and its repair was delivered later by T025 — both provenance notes are recorded in the warnings.
- Reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 56 tests passed, exit 0; `pnpm build` exit 0.
