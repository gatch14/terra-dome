# Lessons — Terra Dome

- 001-terra-dome — SC1 (wave 3): cycle-1 failures in both review lenses came from unverified citations — a reviewer must open the cited file and confirm the cited lines before recording a fail
- 001-terra-dome — SC3 (wave 3): the tooltip implementation was misread as CSS-only when it is the native title attribute — confirm how a feature actually works before failing it
- 001-terra-dome — SC4 (wave 4): the timer-drift finding was refuted by git history (single-commit file, no accumulated deltas) — check a file's history before claiming a latent defect
- 001-terra-dome — SC5 (wave 4): the missing-confirmation finding was refuted (window.confirm existed from the T013 landing); the real gap was the absent shop unit tests, now recorded as a non-blocking warning
- 001-terra-dome — build escalation: plan wave 4 shipped with no task files — the planner must emit every wave's task inventory before build starts
- 001-terra-dome — T002 escalation: a bookkeeping checkpoint committed after task activation advanced the dispatch base — never commit between activation and base recording
- 001-terra-dome — T006-T008 escalation: work landed without a landing commit — record landing commits in the same checkpoint or attested landing evidence will be refused
