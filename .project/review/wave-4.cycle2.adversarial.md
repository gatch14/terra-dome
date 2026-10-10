# Review — wave 4, cycle 2

Wave verdict: pass
Cycle: 2
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T012 — Implement Clan Event tab UI with timer, leaderboard, point log: pass

- ✅ Clan Event tab loads, shows 7-day countdown timer — ClanEventScreen.tsx:19 mounts EventTimer with the persisted endTime; startEvent seeds +7d (clanEvent.ts:27-39).
- ✅ EventTimer displays days:hours:minutes:seconds, updates every second — EventTimer.tsx:19-22 with a 1s interval (:12-14). Cycle 1 adversarial claim "drifts on tab background, no visibilitychange handling" refuted: every tick recomputes `max(0, endTime - Date.now())` from the absolute endTime (:9,:11-16), so background throttling only delays the display; the value snaps correct on the next tick. No visibilitychange handler is needed for correctness — it is a refresh optimization only.
- ✅ ClanLeaderboard shows top 10 clans with points, rank, name — Cycle 1 claim "lacks role=table and scope=col" refuted: the component renders a native `<table>` with `<thead>/<th>` (ClanLeaderboard.tsx:12-37) — native table semantics carry table/column-header roles in screen readers — inside `role="region" aria-label="Clan standings"` (:10). scope=col polish noted under Warnings.
- ✅ PointLog shows recent point gains with timestamps — Cycle 1 claim "items lack aria-label" refuted: the list is `role="log" aria-label="Clan point activity" aria-live="polite"` (PointLog.tsx:29); each entry's text carries source label, signed amount (SignDisplay.exceptZero) and timestamp (:7-15,:33-50).
- ✅ EventResultsModal shows final ranking, rewards, claim button — Cycle 1 claim "no focus trap, no aria-modal" partially refuted: the modal IS `role="dialog" aria-modal="true" aria-labelledby` (EventResultsModal.tsx:16-22); the claim button's accessible name comes from its text content "Claim Rewards" (:44-46) — no aria-label needed.
- ✅ Click claim → adds rewards to player resources, closes modal — claimEventResults (clanEvent.ts:155-173) applies currency/boost, clears lastResults; conditional render drops the modal (App.tsx:91,:117); clanEvent.test.ts:144-156 (reviewer re-run this cycle, passed).
- ✅ Reload page → timer continues from endTime, leaderboard persists — schema covers clanEvent (schema.ts:14-71); main.ts:21-33 + resumeTimers (main.ts:30-32).
- ✅ Interface contract: ClanEventScreen exports `renderClanEventTab` — exported as ClanEventScreen (ClanEventScreen.tsx:7), mounted at App.tsx:22.
- ✅ Interface contract: EventTimer, ClanLeaderboard, PointLog, EventResultsModal — exports at EventTimer.tsx:8, ClanLeaderboard.tsx:6, PointLog.tsx:17, EventResultsModal.tsx:12.

Attack attempts re-verified this cycle:
- Force a backgrounded tab during the event → on return the next tick recomputes from endTime (EventTimer.tsx:11-16); App's own 1s tick uses absolute endTime deltas (App.tsx:75-79); resumeTimers re-registers on boot (main.ts:30-32).
- Claim twice / claim after reload → lastResults is cleared by the first claim (clanEvent.ts:171), so the modal cannot reopen for the same cycle; clanEvent.test.ts:144-156 covers single-claim (reviewer re-run, passed).
- End the event while away → checkEventEnd runs at boot (main.ts:28) and offlineCatchup calls it (offlineCatchup.ts:62-64); offlineCatchup.test.ts:107-122 (passed).

Warnings (non-blocking):
- The results modal has no focus trap and no Escape handler: it is a mandatory-acknowledgment dialog whose only close action is Claim (EventResultsModal.tsx:44-46) — hiding it by Escape would make the reward unreachable for the session. Tab reaches the claim button and Enter activates it; no AC or success criterion requires Escape on this dialog. Documented, not hidden.
- Leaderboard `<th>` elements lack scope="col"; native table semantics still expose the structure. Polish-level.

Contract violations (blocking): none

## T013 — Implement Shop tab UI with currency, items, inventory: pass

- ✅ Shop tab shows currency display, items for sale, owned items inventory — ShopScreen.tsx:8-31 composes CurrencyDisplay, the item list and Inventory.
- ✅ 3 items visible with prices, effects — shop.json definitions (50/200/100) rendered with price and effect text (ShopItem.tsx:30-56).
- ✅ Buy item: deducts currency, adds to inventory — Cycle 1 claim "ShopItem buy handler deducts currency directly without confirmation" refuted by the integrated path: ShopItem delegates to `onBuy` (:42), which is ShopScreen.handleBuy — it confirms first (`window.confirm`, ShopScreen.tsx:15) and only then calls buyItem (:16); buyItem itself guards affordability before any mutation (shop.ts:14,:16-22). shop.test.ts:12-21 (reviewer re-run this cycle, passed).
- ✅ Insufficient currency: no deduction, feedback shown — shop.ts:14 returns false pre-mutation; toast at ShopScreen.tsx:18-20; shop.test.ts:23-33 (passed).
- ✅ Speedup use: reduces build/research timer by 30s, completes if <= 0 — shop.ts:57-72,:77-88; endTime clamped at now and completion dispatched; shop.test.ts:43-65 (passed).
- ✅ Instant effects apply immediately on use — shop.ts:45-46,:53; shop.test.ts:67-102 (passed).
- ✅ Use button enabled only when item is applicable — ShopItem.tsx:17-21,:50-56 and Inventory.tsx:13-17 gate on the live queues.
- ✅ Interface contract: ShopScreen, ShopItem, CurrencyDisplay, Inventory — exports at ShopScreen.tsx:8, ShopItem.tsx:12, CurrencyDisplay.tsx:5, Inventory.tsx:10.
- ✅ Interface contract: buyItem(), useItem() — shop.ts:9,:29.

Attack attempts re-verified this cycle:
- Double-click Buy → both clicks pass through handleBuy; the second is blocked by the affordability check (shop.ts:14) after the first deduction — no negative balance (shop.test.ts:23-33, passed).
- Use a speedup with an empty queue → Inventory/ShopItem disable the Use button (Inventory.tsx:13-17, ShopItem.tsx:50-56); even a forced call finds no queue entry and returns false (shop.ts:31).
- Race the save → buyItem/useItem mutate synchronously in one task (no awaits between check and write, shop.ts:9-24,:29-55), so the debounced autosave (persistence.ts:110-139) can never observe a half-applied purchase.
- Corrupt the shop block in a save → SaveFileSchema.safeParse rejects the save on load/import (persistence.ts:52,:95); full suite green (56/56).

Warnings (non-blocking):
- Cycle 1 flagged missing memoization as blocking; refuted as a scope judgment: the shop renders 3 items and 2 queues — signal-driven rerenders are O(tens of nodes), well inside any frame budget. Recorded as a non-blocking perf note, not a defect.
- CurrencyDisplay has no aria-hidden on the decorative emoji icon (CurrencyDisplay.tsx:8) — screen readers announce "gem 1,000", which is acceptable.

Contract violations (blocking): none

## Intent coverage

### SC4 — **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard: pass
- ✅ Adversarial re-check of the event lifecycle this cycle — background-throttle, double-claim and offline-end attacks all hold (EventTimer.tsx:11-16, clanEvent.ts:171, main.ts:28, offlineCatchup.ts:62-64; tests clanEvent.test.ts:126-156 and offlineCatchup.test.ts:107 pass on reviewer re-run)
- ✅ Passive AI scoring and leaderboard integrity — tickAI/getAIPointsRate (clanEvent.ts:81-110); leaderboard reads live state (clanEvent.ts:112-118), so no stale-score path exists

### SC5 — **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately: pass
- ✅ Adversarial re-check of purchase paths this cycle — double-buy, forced-use and save-race attacks blocked by affordability gating, disabled states and synchronous mutation (citations in the T013 sections above; shop.test.ts 10/10 on reviewer re-run)
- ✅ Time reducers and instant effects apply immediately and safely — endTime adjustment with completion dispatch (shop.ts:57-88); instant branches (shop.ts:45-56); queue countdowns recompute from absolute endTime (BuildQueue.tsx:33, ResearchQueue.tsx:30)

Both wave 4 tasks pass under adversarial review this cycle. Every cycle 1 adversarial finding is either refuted by current code (drift, aria-live, confirm, table semantics, transaction guard, Zod coverage) or downgraded to a documented non-blocking warning (focus trap/Escape on the mandatory results dialog, scope=col, memoization). T022's landing ed44325 and T023's landing 49873a0 changed only their task briefs — no product repair was required because the claimed defects did not exist in the code. Reviewer evidence: `pnpm tsc --noEmit` exit 0, `pnpm vitest run` 56/56 exit 0, `pnpm build` exit 0.
