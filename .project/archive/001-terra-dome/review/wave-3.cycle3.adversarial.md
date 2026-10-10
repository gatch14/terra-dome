# Review — wave 3, cycle 3

Wave verdict: pass
Cycle: 3
Depth: deep
Tasks reviewed: 2
Lens: adversarial

## T010 — Implement Base tab UI with building grid, resource counters, build queue: pass

- ✅ Base tab loads, shows Command Center Lv.1, 4 empty resource slots, 1 locked lab slot — hydrateState (gameState.ts:59-80) seeds the layout; the lab slot renders locked behind Command Center Lv.2 (BuildingSlot `isLocked` path).
- ✅ Resource counters display current amounts, animate on change, show +X/s rates — ResourceCounters (ResourceCounters.tsx:23-46) with `role="status" aria-live="polite"` (:28); cycle 1's "aria-live missing" attack refuted by diff: present since the T010 landing c11305a (unchanged since).
- ✅ Click empty resource slot → modal shows Resource Production, Storage → select → queues — picker dialog `role="dialog" aria-modal="true"` (BuildingSlot.tsx:122-127); options disabled until affordable (:102-109).
- ✅ Build queue shows item with progress bar, countdown timer (MM:SS) — BuildQueue countdown from absolute endTime (BuildQueue.tsx:33).
- ✅ Timer reaches 0 → building appears on grid, level increases, rate updates — App tick → timerManager → completeBuilding (buildings.ts:84-94); rates recompute through the derived signal (derived.ts:7-36).
- ✅ Click queued item → cancel button → refunds resources, removes from queue — cancelBuilding refunds and unregisters (buildings.ts:56-78); tested at buildings.test.ts:52-66 (reviewer re-run, passed).
- ✅ Keyboard: Tab navigates slots, Enter opens modal, Escape closes modal — native buttons (BuildingSlot.tsx:90,:91,:116) + Escape via window listener (:18-25) and dialog onKeyDown (:127); cycle 1's keyboard findings are refuted by current code (unchanged since T010's landing).
- ✅ Reload page → all state restored (buildings, queue, resources) — schema coverage (schema.ts:14-71) + main.ts:21-26 + resumeTimers (main.ts:36-37).

Attack attempts re-verified this cycle:
- Queue the same slot twice → blocked by the busy-slot guard (buildings.ts:17) and the single-active-construction cap (buildings.ts:34-35); buildings.test.ts:68-80 (reviewer re-run, passed).
- Cancel after completion → impossible: only active queue entries expose the cancel button (BuildQueue iterates `buildingQueue`), completed buildings are not in it.
- Refund exploit → refund = `calculateCost(slot.level, def)` clamped at storage caps (buildings.ts:64-68); no over-refund path.

Warnings (non-blocking):
- Cancel refund is clamped at storage caps; "100%" holds only below the caps (documented in T006's review too).

Contract violations (blocking): none

## T011 — Implement Research tab UI with tech tree and research queue: pass

- ✅ Research tab shows 3 category columns with 6-8 nodes total — TechTree per-category columns (TechTree.tsx:15-30); 7 nodes in research.json.
- ✅ Nodes colored correctly by state (locked/available/researching/completed) — STATE_COLORS (ResearchNode.tsx:12-17) + getNodeState (research.ts:93-95).
- ✅ Hover available node → tooltip shows cost, time, effect — the tooltip string carries cost, `formatTimeShort(def.time)` and `describeEffect(def)` (ResearchNode.tsx:33-34), attached as the native `title` attribute (:42); describeEffect (:63) formats all four effect types.
- ✅ Click available node → confirmation → research starts, node turns blue, queue shows item — the cycle 2 adversarial finding (first-click start, no confirmation) is closed by T025 (commit 6bb42ab): ResearchScreen.handleStartResearch returns early unless `window.confirm` accepts (ResearchScreen.tsx:15) — the mutation (`startResearch`) sits behind the guard at :16; success toast :17; the researching node turns blue via STATE_COLORS :13-16 and the queue shows the item (ResearchQueue.tsx:25-44).
- ✅ Research queue shows progress bar, remaining time — ResearchQueue rows with `secondsUntil` (ResearchQueue.tsx:25-44, :30).
- ✅ Timer completes → node turns gold, bonus applied — completeResearch (research.ts:71-91) via the timer; gold = STATE_COLORS :15; bonus flows through derived.ts:7-36,:43-67; research.test.ts:70,:99-175 (reviewer re-run 12/12).
- ✅ Cannot start locked/unaffordable nodes — disabled or tooltip — state gate (research.ts:27) and canAfford gate (:28-31); refusal toast (ResearchScreen.tsx:18-19); tests :55,:61.
- ✅ Reload → completed research persist, queue resumes — schema coverage + main.ts:21-33 + resumeTimers re-registration (main.ts:33-37).
- ✅ Keyboard: Tab to nodes, Enter activates, Escape closes tooltip — `role="button"` + tabIndex (ResearchNode.tsx:43-47), Enter/Space handler (:26-31 wired at :41); the tooltip is the native `title` attribute (ResearchNode.tsx:34,:42) with no program-controlled open state, so nothing lingers after focus moves, and Escape cancels the native confirm (browser-level) — see Warnings.

Attack attempts re-verified this cycle:
- Misclick the wrong research → confirmation dialog now intercepts (ResearchScreen.tsx:15); declining leaves state untouched (no mutation before :16).
- Double-click → first click opens confirm (synchronous); the second click lands after the dialog closes; even on a repeat call, the state gate (research.ts:27) refuses a second queue of the same node — research.test.ts:55 (reviewer re-run, passed).
- Start an unaffordable research → `canAfford` gate returns false with no deduction (research.ts:28-31; test :61, passed).
- Cancel-then-refund exploit → cancelResearch refunds exactly `def.cost` clamped at storage caps and unregisters the timer (research.ts:47-69; test :85, passed).

Warnings (non-blocking):
- AC9's literal "Escape closes tooltip" has no program-controlled tooltip to close (the native `title` attribute, ResearchNode.tsx:34,:42, auto-dismisses on pointer/focus change); the confirm dialog cancels with Escape natively — documented, not hidden.

Contract violations (blocking): none

## Intent coverage

### SC1 — **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers: pass
- ✅ Adversarial re-check of the grid/queue/timer/cost paths this cycle — double-queue and cancel-after-complete attacks blocked (buildings.ts:17,:34-35; buildings.test.ts:68-80); refunds clamped (buildings.ts:64-68); completion through timerManager verified (buildings.ts:84-94); the lab stays locked until Command Center Lv.2 (buildings.test.ts:87)

### SC2 — **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels: pass
- ✅ Counters announce per-second changes without spam — `role="status" aria-live="polite"` (ResourceCounters.tsx:28); rates recompute from live building levels (derived.ts:7-36); the clamp prevents over-cap display (resources.ts:11-13)

### SC3 — **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI: pass
- ✅ Misclick/double-click/unaffordable attacks intercepted — confirm gate (ResearchScreen.tsx:15), state gate (research.ts:27), canAfford gate (:28-31); all exercised by research.test.ts:40-68 (reviewer re-run 12/12)
- ✅ Refund integrity — cancelResearch refunds exactly def.cost, clamped (research.ts:47-69); timer unregistered; no double-spend path found

Both wave 3 tasks pass under adversarial review this cycle. The cycle 2 blocking finding (T011 AC4, first-click start without confirmation) was fixed by T025 (6bb42ab) and survives re-attack: the confirmation guard sits before every mutation, and the queue/affordability gates absorb double-click and race attempts. Reviewer evidence: `pnpm tsc --noEmit` exit 0, `pnpm vitest run` 56/56 exit 0.
