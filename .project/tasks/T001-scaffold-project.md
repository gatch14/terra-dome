---
id: T001
title: Scaffold Vite + TypeScript + Preact Signals project
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - package.json
  - tsconfig.json
  - vite.config.ts
  - index.html
  - src/main.ts
  - src/core/state/gameState.ts
  - src/core/persistence/persistence.ts
---

# T001 — Scaffold Vite + TypeScript + Preact Signals project

## Context

Initialize a minimal Vite + TypeScript project with Preact Signals for reactivity. Set up the core state structure with gameState signal containing resources, buildings, researchQueue, clanEvent, shop, and lastSave. Create the persistence module using idb-keyval for IndexedDB access. This is the foundation all other tasks build on.

## Approach

- Use `pnpm create vite@latest terra-dome -- --template vanilla-ts` then add `@preact/signals` and `idb-keyval`
- Configure TypeScript strict mode, ESNext target, moduleResolution bundler
- Create `src/core/state/gameState.ts` with the full game state signal structure
- Create `src/core/persistence/persistence.ts` with save/load/migrate functions using idb-keyval
- Create minimal `index.html` with 4 tab buttons and content containers
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
5. `src/core/persistence/persistence.ts` exports `saveGame()`, `loadGame()`, `migrateSave()` functions
6. Index.html has 4 tab buttons (Base, Research, Clan Event, Shop) and matching content divs

## Verify

```bash
pnpm install --frozen-lockfile && pnpm run build && test -f package.json
```

Heavy: no

## Log

- 2026-10-09 — created by planner