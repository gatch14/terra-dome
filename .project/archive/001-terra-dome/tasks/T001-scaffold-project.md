---
id: T001
title: Scaffold Vite + TypeScript + Preact Signals project
wave: 1
deps: []
status: done
agent: build_T001
base: 0e5d1e9717676a3922a819b47c3047805b4af0fe
worktree: null
task_branch: null
files:
  - .gitignore
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - tsconfig.json
  - tsconfig.node.json
  - vite.config.ts
  - index.html
  - src/main.ts
  - src/core/state/gameState.ts
  - src/core/state/types.ts
---

# T001 — Scaffold Vite + TypeScript + Preact Signals project

## Context

Initialize a minimal Vite + TypeScript project with Preact Signals for reactivity. Set up the core state structure with gameState signal containing resources, buildings, researchQueue, clanEvent, shop, and lastSave. Create the persistence module using idb-keyval for IndexedDB access. This is the foundation all other tasks build on.

## Approach

- Use `pnpm create vite@latest terra-dome -- --template vanilla-ts` then add `@preact/signals` and `idb-keyval`
- Configure TypeScript strict mode, ESNext target, moduleResolution bundler
- Create `src/core/state/gameState.ts` with the full game state signal structure
- Scaffold `src/main.ts` + `index.html` with 4 tab buttons and content containers; save/load wiring is owned by T005
- Verify: `pnpm install && pnpm run build` succeeds

## Interface contract

- gameState signal
- saveGame()
- loadGame()
- migrateSave()

## Intent coverage

- None

## Acceptance criteria

1. `pnpm install` completes without errors
2. `pnpm run dev` starts Vite dev server on localhost:5173
3. `pnpm run build` produces `dist/` with index.html, assets/
4. `src/core/state/gameState.ts` exports `gameState` signal with all required fields
5. `src/main.ts` bootstraps the scaffold shell from the initial game state (persistence wiring is owned by T005)
6. Index.html has 4 tab buttons (Base, Research, Clan Event, Shop) and matching content divs

## Verify

```bash
pnpm install --frozen-lockfile && pnpm run build && test -f package.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner
- 2026-10-09 — plan defect repair (pre-dispatch): files coverage — added `.gitignore`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.node.json`, `src/core/state/types.ts` (undeclared or compile-required product files; Verify's frozen install needs the lockfile + workspace config). Same-wave overlap forbids T001/T002 sharing paths, so the final typed `gameState.ts` + `types.ts` land here. `persistence.ts` ownership moved to T005 (its ACs depend on the module end-to-end); T001's Approach + AC5 repaired accordingly — `main.ts` lands as a state-only minimal bootstrap and `index.html` with 4 static tab buttons (both upgraded by T014).
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  + preact 10.29.8
  + zod 3.25.76
  
  devDependencies:
  + @types/node 22.20.5
  + jsdom 25.0.1
  + typescript 5.9.3
  + vite 5.4.21
  + vitest 2.1.9
  
  Done in 1s using pnpm v11.4.0
  [36mvite v5.4.21 [32mbuilding for production...[36m[39m
  transforming...
  [32m✓[39m 8 modules transformed.
  rendering chunks...
  computing gzip size...
  [2mdist/[22m[32mindex.html                [39m[1m[2m 1.05 kB[22m[1m[22m[2m │ gzip: 0.41 kB[22m
  [2mdist/[22m[36massets/index-BjM_7t5-.js  [39m[1m[2m10.02 kB[22m[1m[22m[2m │ gzip: 3.99 kB[22m[2m │ map: 43.62 kB[22m
  [32m✓ built in 151ms[39m
  $ tsc && vite build
  ```
