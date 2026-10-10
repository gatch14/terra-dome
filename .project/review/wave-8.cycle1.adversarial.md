# Review — wave 8, cycle 1

Wave verdict: pass
Cycle: 1
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T020 — Fix wave 3 cycle 1 review findings in T010: pass

- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — adversarial re-verification of the keyboard paths: every slot action is a native `<button>` (BuildingSlot.tsx:90,:91,:116) so Tab order and Enter activation come from the platform; Escape closes the picker from anywhere inside the slot (window keydown listener :18-25, cleanup :25) and from the dialog itself (:127); the dialog is `role="dialog" aria-modal="true"` (:122-127). Attack attempts this cycle: Escape with focus outside the slot — the window listener is scoped to the slot's open-picker state and removes itself on close, so it cannot leak; Enter on a disabled option — disabled buttons are skipped by the platform; double-Enter — the picker is idempotent (setShowPicker(true) twice is a no-op).

Warnings (non-blocking):
- T020's landing 286c495e changed only its task brief; git shows BuildingSlot.tsx has exactly one commit in history (c11305a, the T010 landing), so the cycle 1 finding this task was created for is refuted by the file's own history — no repair was ever needed. Recorded for provenance.

Contract violations (blocking): none

## T021 — Fix wave 3 cycle 1 review findings in T011: pass

- ✅ Click available node → confirmation → starts research, adds to queue — adversarial re-verification of the repaired flow (T025, 6bb42ab6): the confirmation guard sits before every mutation (ResearchScreen.tsx:15 returns early unless accepted; startResearch runs at :16); the state gate refuses a second queue of the same node (research.ts:27) and the affordability gate refuses without deduction (:28-31); cancel refunds exactly def.cost and unregisters the timer (research.ts:47-69). Attack attempts this cycle: misclick-then-decline (no mutation path before :16), double-click race (confirm is synchronous; the post-dialog repeat call is absorbed by the state gate — research.test.ts:55, :61), queue overflow (queue push happens only after both gates — research.test.ts:40-53). Reviewer re-run this cycle: research 12/12, full suite 56/56, exit 0.

Warnings (non-blocking):
- T021's landing 227d5524 changed only its task brief; git shows ResearchScreen.tsx has two commits (378e727 T011, 6bb42ab6 T025) — the repair this task promised arrived with T025 two waves later. Goal-backward the criterion holds now; provenance documented rather than hidden.

Contract violations (blocking): none

## Summary for orchestrator

- Both wave 8 tasks pass under adversarial review; the wave owns no INTENT success criterion (no Intent coverage section, matching the coverage plan).
- T020's finding is refuted by BuildingSlot.tsx's single-commit history; T021's finding was real and fixed by T025 — both survive re-attack this cycle (keyboard scoping, confirm-before-mutation, state/affordability gates).
- Reviewer-supplied evidence this cycle: `pnpm tsc --noEmit` exit 0; `pnpm vitest run` → 6 files, 56 tests passed, exit 0; `pnpm build` exit 0.
