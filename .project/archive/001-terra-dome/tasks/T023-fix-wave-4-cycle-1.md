---
id: T023
title: Fix wave 4 cycle 1 review findings in T013
wave: 9
deps: [T013]
status: done
agent: task-t023
base: 3f73656d1449343a3eed576cdf3e8a66e15ee500
worktree: null
task_branch: null
files:
  - src/core/systems/shop.ts
  - src/core/systems/shopDefinitions.ts
  - src/data/shop.json
  - src/ui/components/CurrencyDisplay.tsx
  - src/ui/components/Inventory.tsx
  - src/ui/components/ShopItem.tsx
  - src/ui/screens/ShopScreen.tsx
---

# T023 — Fix wave 4 cycle 1 review findings in T013

## Context

Repair task created from the wave 4 cycle 1 review of T013.
The failed criteria and every reviewer observation are recorded verbatim under Review findings.
The source task contracts are unchanged; read them and .project/intent/INTENT.md before editing.

## Approach

- Fix only what the Review findings name, inside the listed files; do not change the source
  tasks' acceptance criteria or interface contracts.
- Re-run the source tasks' Verify commands after the fix and record the result in the Log.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. Click buy → confirmation modal → deducts currency

## Verify

```bash
set -e
(
test -f src/ui/screens/ShopScreen.tsx && test -f src/ui/components/ShopItem.tsx && test -f src/ui/components/Inventory.tsx && test -f src/ui/components/CurrencyDisplay.tsx && test -f src/core/systems/shop.ts && test -f src/data/shop.json
)
```

Heavy: no

## Review findings

### t013_files
Criterion: Click buy → confirmation modal → deducts currency
- Click buy → confirmation modal → deducts currency — ShopItem buy handler deducts currency directly without confirmation step
- CurrencyDisplay shows gold/materials/research data — CurrencyDisplay lacks aria-live="polite" for screen reader announcements
- Shop tab loads — ShopScreen re-renders full item grid on every currency change; no memo on ShopItem
- Inventory shows owned items — Inventory panel lacks keyboard navigation (Tab/Arrow keys); no focus management
- Shop definitions loaded from shop.json — shop.ts mutates gameState.shop directly without transaction guard; race with offline catch-up
- Reload page → currency, inventory, shop state restored — shopDefinitions.ts imports full item objects; Zod may not validate nested structures correctly

## Log

- 2026-10-09 — created by dispatch_driver.py fix-tasks from wave 4 cycle 1
- 2026-10-09 — orchestrator Verify (sidecar gsd-path-verify/task-t023-verify): pass, exit 0
