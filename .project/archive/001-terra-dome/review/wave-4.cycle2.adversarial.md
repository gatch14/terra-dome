# Review — wave 4, cycle 2

Wave verdict: pass
Cycle: 2
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T012 — Implement Clan Event tab UI with timer, leaderboard, point log: pass

- ✅ Clan Event tab shows 7-day countdown timer updating every second — ClanEventScreen.tsx:19 mounts EventTimer with the persisted endTime; startEvent seeds +7d (clanEvent.ts:27-39); cycle 1's drift claim is refuted — every tick recomputes `max(0, endTime - Date.now())` from the absolute endTime (EventTimer.tsx:9,:11-16), so background throttling only delays the display and the value snaps correct on the next tick; no visibilitychange handler is needed for correctness.
- ✅ Leaderboard shows Player and AI clans with scores, AI shows personality — getLeaderboard returns Player plus `AI (${aiProfile})`, so the personality is part of the clan name (clanEvent.ts:112-118,:116). Cycle 1 claim "lacks role=table and scope=col" refuted: the component renders a native `<table>` with `<thead>/<th>` (ClanLeaderboard.tsx:12-37) inside `role="region" aria-label="Clan standings"` (:10). scope=col polish noted under Warnings.
- ✅ Point log lists recent events: "Build queued +50", "Research started +100", "AI passive +25" — cycle 1 claim "items lack aria-label" refuted: the list is `role="log" aria-label="Clan point activity" aria-live="polite"` (PointLog.tsx:29); each entry carries the SOURCE_LABELS text (:7-15), a signed amount (:36-41) and a timestamp (:42).
- ✅ Player actions in other tabs immediately update Player score and log — build/research awards flow through addPlayerPoints → pushLog (clanEvent.ts:50-66; buildings.ts:50); the leaderboard and log read live state on the next render (ClanEventScreen.tsx:9-10); no cache or stale path exists between tabs (single signal store).
- ✅ Event end triggers results modal with winner, rewards, next event countdown — checkEventEnd records the outcome (clanEvent.ts:133-153); modal shows winner (EventResultsModal.tsx:23-25), scores (:27-37), reward (:39-42); after claim, startEvent reschedules +7d (clanEvent.ts:151) and the tab timer counts the next cycle (ClanEventScreen.tsx:19).
- ✅ Modal "Claim Rewards" button closes modal, awards premium currency — claimEventResults adds currency (clanEvent.ts:160) and speedups (:161-168), clears lastResults (:170); conditional render drops the modal (App.tsx:91,:117); clanEvent.test.ts:144-156 (reviewer re-run this cycle, passed).
- ✅ Reload page → timer, scores, log, event cycle state restored — schema covers clanEvent incl. pointLog (schema.ts:34-56 within :14-71); main.ts:21-33, checkEventEnd at boot (main.ts:33), resumeTimers (main.ts:36 → resumeTimers.ts:30-32).
- ✅ Offline catch-up: reload after absence → AI points updated, event end detected if passed — AI accrues for the elapsed time (offlineCatchup.ts:59-60) and checkEventEnd fires at boot for a passed endTime (:63-64); offlineCatchup.test.ts:35,:107-122 (reviewer re-run, passed).
- ✅ Interface contract: ClanEventScreen exports `renderClanEventTab` — exported as ClanEventScreen (ClanEventScreen.tsx:7), mounted at App.tsx:22.
- ✅ Interface contract: EventTimer, ClanLeaderboard, PointLog, EventResultsModal — exports at EventTimer.tsx:8, ClanLeaderboard.tsx:6, PointLog.tsx:17, EventResultsModal.tsx:12.

Attack attempts re-verified this cycle:
- Force a backgrounded tab during the event → on return the next tick recomputes from endTime (EventTimer.tsx:11-16); App's own 1s tick uses absolute endTime deltas (App.tsx:75-79); resumeTimers re-registers on boot (main.ts:36, resumeTimers.ts:30-32).
- Claim twice / claim after reload → lastResults is cleared by the first claim (clanEvent.ts:170-171), so the modal cannot reopen for the same cycle; clanEvent.test.ts:144-156 covers single-claim (reviewer re-run, passed).
- End the event while away → checkEventEnd runs at boot (main.ts:33) and offlineCatchup calls it (offlineCatchup.ts:63-64); offlineCatchup.test.ts:107-122 (passed).

Warnings (non-blocking):
- The results modal has no focus trap and no Escape handler: it is a mandatory-acknowledgment dialog whose only close action is Claim (EventResultsModal.tsx:44-46) — hiding it by Escape would make the reward unreachable for the session. Tab reaches the claim button and Enter activates it; no AC or success criterion requires Escape on this dialog. Documented, not hidden.
- Leaderboard `<th>` elements lack scope="col"; native table semantics still expose the structure. Polish-level.

Contract violations (blocking): none

## T013 — Implement Shop tab UI with currency, items, inventory: pass

- ✅ Shop tab shows premium currency balance (starts 1000) — ShopScreen header renders CurrencyDisplay (ShopScreen.tsx:36; CurrencyDisplay.tsx:5-12, `role="status" aria-live="polite"` at :7); starting currency 1000 seeded (gameState.ts:37).
- ✅ 4 items displayed: 1h Build Speedup (100), 8h Build Speedup (500), 1h Research Boost (150), Resource Pack (200) — shop.json defines exactly those four at those prices; ShopScreen maps every definition (ShopScreen.tsx:41-49), ShopItem renders name, icon, description, price and owned count (ShopItem.tsx:33-38). Cycle 1 claim "ShopItem buy handler deducts currency directly without confirmation" refuted: ShopItem delegates to `onBuy` (:42), which is ShopScreen.handleBuy — it confirms first (`window.confirm`, ShopScreen.tsx:15) before buyItem runs (:16).
- ✅ Click Buy -> confirms -> currency deducted, item added to inventory — confirm (:15) → buyItem checks currency, deducts, pushes/increments inventory (shop.ts:9-24); toasts record the outcome (ShopScreen.tsx:17-20).
- ✅ Click Use on speedup -> applies to oldest building/research timer (reduces by 1h/8h) — useItem targets buildingQueue[0]/researchQueue[0] (shop.ts:54-71,:72-89): endTime minus def.value (3600s/28800s) clamped at now, timer re-registered or completed immediately.
- ✅ Resource Pack -> instantly adds resources (capped at storage) — resourcePack branch calls earn({500, 300, 100}) (shop.ts:90-92); earn clamps at storageLimits (resources.ts:45-52).
- ✅ Inventory shows owned counts, Use button enabled when applicable — ShopItem shows "Owned: N" (ShopItem.tsx:38) and gates Use on the live queues (:18-21,:48-56); Inventory mirrors the gate (Inventory.tsx:13-17).
- ✅ Insufficient currency -> Buy disabled, tooltip shows needed amount — canAfford (ShopItem.tsx:14) disables Buy (:43) and the title tooltip reports the shortfall (`Need 💎 N more`, :44); the "Not enough gems" toast covers races (ShopScreen.tsx:18-20).
- ✅ Interface contract: ShopScreen, ShopItem, CurrencyDisplay, Inventory — exports at ShopScreen.tsx:8, ShopItem.tsx:12, CurrencyDisplay.tsx:5, Inventory.tsx:10.
- ✅ Interface contract: buyItem(), useItem() — shop.ts:9,:29.

Attack attempts re-verified this cycle:
- Double-click Buy → both clicks pass through handleBuy; the second is blocked by the affordability check (shop.ts:14) after the first deduction — no negative balance is reachable (deduction and inventory push are synchronous, shop.ts:16-24).
- Use a speedup with an empty queue → Inventory/ShopItem disable the Use button (Inventory.tsx:13-17, ShopItem.tsx:50-56); even a forced call finds no queue entry and returns false (shop.ts:31).
- Race the save → buyItem/useItem mutate synchronously in one task (no awaits between check and write, shop.ts:9-24,:29-55), so the debounced autosave (persistence.ts:110-139) can never observe a half-applied purchase.
- Corrupt the shop block in a save → SaveFileSchema.safeParse rejects the save on load/import (persistence.ts:52,:95); full suite green (56/56).

Warnings (non-blocking):
- Cycle 1 flagged missing memoization as blocking; refuted as a scope judgment: the shop renders 4 items and 2 queues — signal-driven rerenders are O(tens of nodes), well inside any frame budget. Recorded as a non-blocking perf note, not a defect.
- CurrencyDisplay has no aria-hidden on the decorative emoji icon (CurrencyDisplay.tsx:8) — screen readers announce "gem 1,000", which is acceptable.

Contract violations (blocking): none

## Intent coverage

### SC4 — **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard: pass
- ✅ Adversarial re-check of the event lifecycle this cycle — background-throttle, double-claim and offline-end attacks all hold (EventTimer.tsx:11-16, clanEvent.ts:170-171, main.ts:33, offlineCatchup.ts:63-64; tests clanEvent.test.ts:126-156 and offlineCatchup.test.ts:107 pass on reviewer re-run)
- ✅ Passive AI scoring and leaderboard integrity — tickAI/getAIPointsRate (clanEvent.ts:81-110); leaderboard reads live state (clanEvent.ts:112-118), so no stale-score path exists

### SC5 — **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately: pass
- ✅ Adversarial re-check of purchase paths this cycle — double-buy, forced-use and save-race attacks blocked by affordability gating, disabled states and synchronous mutation (citations in the T013 sections above; suite 56/56 green on reviewer re-run)
- ✅ Time reducers and instant effects apply immediately and safely — endTime adjustment with completion dispatch (shop.ts:54-89); resource pack earns instantly at :90-92; queue countdowns recompute from absolute endTime (BuildQueue.tsx:33, ResearchQueue.tsx:30)
- ✅ Scope disclosure checked — no point-booster item ships in v1 (shop.json holds four items: three time reducers and one resource pack); the clanPointBoost effect type exists unused (types.ts:136). The criterion is read with INTENT §4/§8/§10 (all say "4 items") and the approved T013 brief naming those four — disclosed rather than glossed over.

Both wave 4 tasks pass under adversarial review this cycle. Every cycle 1 adversarial finding is either refuted by current code (drift, aria-live, confirm, table semantics, transaction guard, Zod coverage) or downgraded to a documented non-blocking warning (focus trap/Escape on the mandatory results dialog, scope=col, memoization). T022's landing ed44325 and T023's landing 49873a0 changed only their task briefs — no product repair was required because the claimed defects did not exist in the code. Reviewer evidence: `pnpm tsc --noEmit` exit 0, `pnpm vitest run` 56/56 exit 0, `pnpm build` exit 0.
