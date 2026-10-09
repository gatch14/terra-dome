# Synthesis

## Settled

- Single-player local prototype (no multiplayer, no backend) — INTENT.md Scope In
- TypeScript strict, modular architecture (core/ systems pure, UI separate) — INTENT.md Constraints
- Zero external API dependencies — INTENT.md Constraints
- 4-tab UI: Base, Research, Clan Event, Shop — INTENT.md Success Criteria
- Offline progression with catch-up (max 24h clamp) — evidence-pitfalls.md Finding: Offline catch-up must clamp elapsed time
- Timer management via absolute endTime pattern — evidence-pitfalls.md Finding: Background tab throttling requires visibilitychange + catch-up
- IndexedDB via idb-keyval for persistence — evidence-stack.md Finding: IndexedDB via idb-keyval is the correct persistence choice
- Versioned saves with Zod validation + backup — evidence-pitfalls.md Finding: Save corruption mitigated by versioned schema

## Decisions

### Stack

- **Decision**: TypeScript + Vite + Preact Signals + Vanilla DOM + IndexedDB (idb-keyval)
- **Runner-up**: React + Zustand (adds ~40kb, boilerplate, VDOM overhead); SolidJS (learning curve, smaller ecosystem); Phaser 3 (wrong abstraction for UI-heavy game); Python Textual (no graphical UI); Rust/WASM (10x iteration time)
- **Evidence**: evidence-stack.md § Finding: TypeScript + Vite + Preact Signals + Vanilla DOM is optimal; evidence-stack.md § Finding: Preact Signals enables pure core systems testable without DOM; evidence-stack.md § Finding: IndexedDB via idb-keyval is the correct persistence choice
- **Confidence**: high

### State Management

- **Decision**: Preact Signals for fine-grained reactivity in core/ and UI; pure functions `(state, action) → newState` for systems
- **Runner-up**: Redux Toolkit (boilerplate, overkill for this scale); Zustand (simpler but signals more ergonomic for derived state); simple event bus (no derived state, manual subscription management)
- **Evidence**: evidence-stack.md § Finding: Preact Signals enables pure core systems testable without DOM; evidence-stack.md § Finding: TypeScript + Vite + Preact Signals + Vanilla DOM is optimal
- **Confidence**: high

### Tech Tree Data Format

- **Decision**: JSON schema with nodes array (id, name, category, prereqs[], cost{}, effect{}); data-driven, hot-reloadable
- **Runner-up**: Code-defined TypeScript constants (requires rebuild, less designer-friendly); YAML (adds parser dependency)
- **Evidence**: evidence-domain.md § Finding: Tech trees use category branches with linear progression within branch; evidence-similar.md § Finding: CivClicker provides cleanest reference for research tree
- **Confidence**: high

### AI Clan Behavior

- **Decision**: Fixed schedule + personality profile (configurable points/hour, ramp curve); Rusher/Grinder/Late Bloomer presets
- **Runner-up**: Reactive AI mirroring player actions (adds complexity, no perceived benefit); Dynamic difficulty adjusting to player (over-engineered for prototype)
- **Evidence**: evidence-domain.md § Finding: AI clan behavior uses fixed schedule with personality profiles; evidence-similar.md § Finding: Last Z KvK mechanics deconstructed by community — fixed schedule AI
- **Confidence**: medium

### Persistence Backend

- **Decision**: IndexedDB via idb-keyval (async, ~50% disk quota, localStorage-compatible API)
- **Runner-up**: localStorage (5MB quota, sync blocking, silent failure at quota); sql.js (200kb WASM, SQL overhead for key-value)
- **Evidence**: evidence-stack.md § Finding: IndexedDB via idb-keyval is the correct persistence choice; evidence-pitfalls.md § Finding: Save corruption mitigated by versioned schema
- **Confidence**: high

### Architecture Shape

- **Decision**: `core/` (pure systems: resources, buildings, research, clan, shop, time, persistence), `ui/` (Preact Signals components, 4 screens), `data/` (JSON definitions), `main.ts` bootstrap
- **Runner-up**: Monolithic single-file (untestable); Framework-heavy (Next.js, React) for static prototype
- **Evidence**: evidence-stack.md § Finding: Preact Signals enables pure core systems testable without DOM; evidence-pitfalls.md § Finding: UI couples to core logic — can't test systems in isolation
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: Offline catch-up algorithm correctness (clock skew, DST, long absence); Timer precision across background tabs; Save migration v1→v2 without data loss
- **Walking skeleton**: index.html loads → Vite dev server → Preact Signals store initializes → IndexedDB save/load works → Resource tick updates UI → Build queue timer counts down → Research starts → Clan event timer runs → Shop purchase applies effect → Reload restores state
- **Pitfalls → tasks**:
  - Timer drift in background tabs → Task: Implement visibilitychange catch-up + absolute endTime rendering
  - Save corruption / quota exceeded → Task: Versioned Zod schema + backup key + export/import fallback
  - Clock skew negative elapsed → Task: Clamp elapsed = max(0, now - lastSave) in catch-up
  - Concurrent tab writes → Task: storage event listener + version check on load
  - Event ends while offline → Task: On load, detect ended event → show results modal → auto-start next cycle

## User rulings

- None required at this checkpoint

## Still unknown

- Exact JSON schema for building definitions (costs, times, production rates) — plan: define in wave-1 data task
- Exact tech tree node list (5-8 nodes, categories, effects) — plan: design in wave-1 data task
- AI clan personality point curves (points/hour per profile) — plan: tune in wave-1 clan event task
- Shop item pricing (premium currency costs) — plan: balance in wave-1 shop task