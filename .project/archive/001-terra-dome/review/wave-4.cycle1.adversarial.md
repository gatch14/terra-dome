# Review — wave 4, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T012 — Implement Clan Event tab UI with timer, leaderboard, point log: fail

- ✅ Clan Event tab loads, shows 7-day countdown timer
- ✅ EventTimer displays days:hours:minutes:seconds, updates every second
- ✅ ClanLeaderboard shows top 10 clans with points, rank, name
- ✅ PointLog shows recent point gains with timestamps
- ✅ EventResultsModal shows final ranking, rewards, claim button
- ✅ Click claim → adds rewards to player resources, closes modal
- ✅ Reload page → timer continues from endTime, leaderboard persists
- ✅ Interface contract: ClanEventScreen exports `renderClanEventTab`
- ✅ Interface contract: EventTimer, ClanLeaderboard, PointLog, EventResultsModal

Warnings (non-blocking):
- None

Contract violations (blocking):
- ❌ EventTimer displays days:hours:minutes:seconds — timer uses setInterval with local Date.now() delta; drifts on tab background, no visibilitychange handling
- ❌ Reload page → timer continues from endTime — EventTimer doesn't sync with TimerManager on mount; shows stale remaining time
- ❌ ClanLeaderboard shows top 10 clans — ClanLeaderboard table lacks role="table", column headers lack scope="col"; not screen reader accessible
- ❌ PointLog shows recent point gains — PointLog list items lack aria-label with point change context
- ❌ EventResultsModal shows final ranking — Modal doesn't trap focus; Escape doesn't close; no aria-modal="true"
- ❌ Click claim → adds rewards — Claim button lacks aria-label; reward amounts not announced

## T013 — Implement Shop tab UI with currency, items, inventory: fail

- ✅ Shop tab loads, shows currency balance, item grid, inventory panel
- ✅ ShopItem shows name, cost, icon, owned count, buy button
- ✅ Click buy → confirmation modal → deducts currency, adds to inventory
- ✅ Inventory shows owned items with quantity, use/discard buttons
- ✅ CurrencyDisplay shows gold/materials/research data with formatting
- ✅ Shop definitions loaded from shop.json (items, costs, categories)
- ✅ Reload page → currency, inventory, shop state restored
- ✅ Interface contract: ShopScreen exports `renderShopTab`
- ✅ Interface contract: ShopItem, Inventory, CurrencyDisplay, shop.ts, shopDefinitions.ts

Warnings (non-blocking):
- None

Contract violations (blocking):
- ❌ Click buy → confirmation modal → deducts currency — ShopItem buy handler deducts currency directly without confirmation step
- ❌ CurrencyDisplay shows gold/materials/research data — CurrencyDisplay lacks aria-live="polite" for screen reader announcements
- ❌ Shop tab loads — ShopScreen re-renders full item grid on every currency change; no memo on ShopItem
- ❌ Inventory shows owned items — Inventory panel lacks keyboard navigation (Tab/Arrow keys); no focus management
- ❌ Shop definitions loaded from shop.json — shop.ts mutates gameState.shop directly without transaction guard; race with offline catch-up
- ❌ Reload page → currency, inventory, shop state restored — shopDefinitions.ts imports full item objects; Zod may not validate nested structures correctly

## Intent coverage

### SC4 — **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard: fail
- ❌ the EventResultsModal does not trap focus, Escape does not close it, and ClanLeaderboard/PointLog lack accessible table/list semantics — wave 4 cycle 1 adversarial findings for T012.

### SC5 — **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately: fail
- ❌ ShopScreen re-renders the full item grid on every currency change and shop.ts mutates gameState.shop directly without a transaction guard — wave 4 cycle 1 adversarial findings for T013.
