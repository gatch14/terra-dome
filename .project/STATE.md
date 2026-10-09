---
pipeline: gsd-path/v2
project: terra-dome
milestone: null     # set by define; names the archive directory at ship
phase: build
                    # inspect only for brownfield; greenfield starts at define
                    # roadmap only in program flow (CHARTER.md exists)
status: active
branch: gsd-path/M001
                    # the router rebinds before any next-milestone file change
                    # the bound branch is never main; ship integrates it there
archive: null       # persisted archive transaction path; never recomputed
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
