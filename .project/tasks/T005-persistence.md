---
id: T005
title: Implement IndexedDB persistence with versioned saves and migration
wave: 1
deps: ["T002", "T004"]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/core/persistence/schema.ts
  - src/core/persistence/migration.ts
---

# T005 — Implement IndexedDB persistence with versioned saves and migration

## Context

Implement save/load using idb-keyval (IndexedDB wrapper). Save format includes version, data, savedAt timestamp. On load: validate with Zod schema, migrate if version < current, keep backup of previous valid save. Auto-save on state changes (debounced). Handle quota exceeded and private browsing gracefully.

## Approach

- In schema.ts: define Zod schema for SaveFile { version: number, data: GameState, savedAt: number }
- In migration.ts: migration functions v1→v2, v2→v3 etc. Each adds defaults for new fields.
- In persistence.ts:
  - `SAVE_KEY = 'terra-dome-save'`, `BACKUP_KEY = 'terra-dome-save-backup'`
  - `saveGame(state: GameState)`: debounced (500ms), writes to idb-keyval, updates backup on success
  - `loadGame(): Promise<GameState | null>`: reads save, validates with Zod, migrates if needed, returns GameState or null
  - `exportSave(): string` → JSON string for manual backup
  - `importSave(json: string): boolean` → validates, migrates, saves
  - `clearSave()`: removes save and backup
- Auto-save: subscribe to gameState changes (using signal effect), debounce saveGame
- Storage event listener: on 'storage' event for SAVE_KEY, reload if version newer

## Interface contract

- saveGame()
- loadGame()
- migrateSave()
- applyOfflineProgress()
- MAX_OFFLINE_MS

## Intent coverage

- SC6

## Acceptance criteria

1. saveGame writes to IndexedDB, loadGame reads back identical state
2. Version migration: v1 save loads into v2 schema with defaults
3. Backup created on each successful save; corrupted save falls back to backup
4. Auto-save triggers on state change (debounced 500ms)
5. Quota exceeded: catches error, shows toast, offers export
6. Private browsing: detects unavailable storage, shows banner, offers export/import
7. Storage event: second tab save triggers reload in first tab
8. Export/import round-trip preserves all state

## Verify

```bash
test -f src/core/persistence/schema.ts && test -f src/core/persistence/migration.ts
```

Heavy: no

## Log

- 2026-10-09 — created by planner