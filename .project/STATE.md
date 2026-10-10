---
pipeline: gsd-path/v2
project: terra-dome
milestone: terra-dome # set by define; names the archive directory at ship
phase: shipped
                    # inspect only for brownfield; greenfield starts at define
                    # roadmap only in program flow (CHARTER.md exists)
status: done
branch: gsd-path/M001
                    # the router rebinds before any next-milestone file change
                    # the bound branch is never main; ship integrates it there
archive: .project/archive/001-terra-dome
integration_default: direct # direct | pull-request; project setting
integration: direct # current milestone; may override the default before build
integration_source: default # default | milestone; preserves override provenance
---

# Project State

One file, always current. The router reads this first; every phase updates
it on completion. If this file and the artifacts disagree, the artifacts win
— fix this file.

## Log

<!-- append one line per transition: date, phase, event -->
- 2026-10-08 — define — project initialized
- 2026-10-09 — define — router bound initial milestone
- 2026-10-09 — define — intent approved via interview
- 2026-10-09 — research — research started
- 2026-10-09 — research — research complete
- 2026-10-09 — decide — decide started
- 2026-10-09 — decide — synthesis complete
- 2026-10-09 — plan — planning started
- 2026-10-09 — plan — plan approved
- 2026-10-09 — build — build started
- 2026-10-09 — build — build blocked: plan wave inventory defect (wave 4 has no task files)
- 2026-10-09 — plan — build plan repair requested
- 2026-10-09 — plan — build recovery: {"base": "b22482d43abaee5d37743cb5a045fa26559ed850", "branch": "gsd-path/M001", "kind": "plan"}
- 2026-10-09 — plan — plan approved
- 2026-10-09 — build — build started
- 2026-10-09 — build — build blocked: serial task T002 dispatch record advanced past its base (bookkeeping checkpoint committed after activation)
- 2026-10-09 — build — build resumed after T002 dispatch record reset (user ruling 2026-10-09)
- 2026-10-09 — build — build blocked: T006, T007, T008 done but no landing commit proves it (attest refuses rejected landing evidence; restored landing bytes fail the wave-2 handoff on repeated numbered item)
- 2026-10-09 — build — build resumed after user ruling 2026-10-09 option 1: T006-T008 task files restored to landing bytes (checkpoint 294e410); wave-2 cycle-2 structural defect remains recorded and will escalate again after remaining waves
- 2026-10-10 — ship — build done; final review pending
- 2026-10-10 — ship — final gate passed; shipping approval pending
- 2026-10-10 — ship — shipping approval granted (user ruling 2026-10-10); archive transaction started
- 2026-10-10 — ship — render-manifest and preflight passed (carried_forward 0) at Reviewed-HEAD 2860f92f4fb450bb2d212d447d942454e520f134 after two GSD Path 1.4.0 defects were reported and locally tolerated: frozen duplicate acceptance numbering in T006/T007/T008 crashed review validation, and define never set STATE.milestone so status and the archive chain demanded opposite values (game code uninvolved)
- 2026-10-10 — ship — owner ruling verbatim: "Rapport + patch local, ship (Recommended)"
- 2026-10-10 — ship — owner rulings verbatim: "c est un bug du code ou de gsd path ?" (answered: GSD Path only) and "et sur leur github il y a une remonte de se bug ? si non ouvrir un rapport d erreur ?"; "Publier sur GitHub (Recommended)" → issue https://github.com/open-gsd/gsd-path/issues/374 published covering both defects (neither had been reported; official 1.5.0 still raises the first)
- 2026-10-10 — ship — owner ruling verbatim: "ouvrir une pr aussi avec le correctif proposé ?" → read as: keep the local tolerances and also open the upstream PR with both fixes plus regression tests (URL appended below when opened)
- 2026-10-10 — ship — hotfix runtime sequencing: .gsd-path/runtime.json stays at its committed be5a45e54aceb02b95ac1d23d52a19a56bcd981f5980ddc6445e5c5797930c67 pin for the whole git transaction (render-manifest, preflight, record-shipment, ship commit, validate, integrate, validate-integrated invoke hotfix runtime 058cd393d2d1e3dcd8995156db408de5af1b831d3b6cfd1cb49590d1b10b6304 = 1.4.0 + both issue-374 tolerances, by absolute path; original runtime dir retained untouched), then re-pin to 058cd393 after validate-integrated so status and the router run patched; provenance field in .gsd-path/runtime.json; commit the pin at the next milestone or drop it once the official #374 fix installs
- 2026-10-10 — shipped — archive preflight passed; shipment recorded
- 2026-10-10 -- ship -- owner ruling applied: upstream PR https://github.com/open-gsd/gsd-path/pull/375 opened (branch fix/issue-374-archive-ship-blockers, one commit, fixes #374, 7 regression tests green; local tolerances kept in parallel)
