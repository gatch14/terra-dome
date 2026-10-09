# INTENT.md — Terra Dome

**Status:** active
**Milestone:** M001
**Created:** 2026-10-09

---

## 1. Problem

**What:** No existing lightweight prototype demonstrates a peaceful "KvK" (Kingdom vs Kingdom) strategy/management game focused on base building, research optimization, and cooperative clan competition without real-time combat.

**Who:** Indie developers wanting a reference architecture for clan-based management games; players who enjoy progression/optimization loops (Last Z / Whiteout Survival style) but without PvP combat pressure.

**Pain level:** High — existing references are either full commercial games (closed source) or combat-focused tutorials. No open prototype isolates the "peaceful KvK + base/research optimization" loop.

---

## 2. Users

- **Primary:** Solo dev / small team building a prototype to validate the core loop
- **Secondary:** Players who enjoy idle/optimization strategy games (mobile/PC)
- **Technical level:** Devs comfortable with JS/TS, Node, or Python; players casual to mid-core
- **Current alternatives:** Whiteout Survival, Last Z, Rise of Kingdoms (all closed, combat-heavy, mobile-first)

---

## 3. Success Criteria (v1 — Prototype "Jouable")

A **single-player local prototype** (no multiplayer backend) that demonstrates:

1. **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers
2. **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels
3. **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI
4. **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard
5. **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately
6. **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads
7. **UI:** 4 tabs/screens — Base, Research, Clan Event, Shop — clean, functional, responsive

**Observable "Done":** Open `index.html` → see base producing resources → queue a build → start research → see clan event points tick → buy a boost → reload page → state restored.

---

## Success criteria

1. **Base screen:** Command Center + 2 resource buildings + Research Lab, each with build queue and timers
2. **Resource system:** 3 resources (Materials, Energy, Research Data) ticking per second based on building levels
3. **Tech tree:** 5–8 researches unlocking production/speed bonuses, visible tree UI
4. **Weekly Clan Event (simulated):** 7-day timer, two "clans" (player + AI), points earned from actions (build, research, produce), live leaderboard
5. **Shop:** Premium currency, 3–4 consumable items (time reducers, point boosters, resource packs), purchase applies effect immediately
6. **Persistence:** LocalStorage (or SQLite) saves player state, clan scores, event timer across reloads
7. **UI:** 4 tabs/screens — Base, Research, Clan Event, Shop — clean, functional, responsive

## 4. Scope In (v1)

- Single-player prototype (no real multiplayer, no auth, no server)
- Local persistence (localStorage or SQLite via better-sqlite3 / sql.js)
- 3 resources, 4–5 building types, 5–8 tech nodes
- Simulated 7-day clan event with AI opponent clan
- Shop with 4 consumable item types
- Vanilla JS / TypeScript + Vite, or Python + textual/rich (terminal UI) — **decide stack in Decide phase**
- Clean module architecture: `state/`, `systems/`, `ui/`, `data/`, `persistence/`

---

## 5. Scope Out (Vetoes)

- ❌ Real-time multiplayer / WebSockets / backend server
- ❌ Real-time combat / unit control / battle calculations
- ❌ User accounts, auth, cloud save
- ❌ Microtransactions / real money / payment integration
- ❌ Fancy animations / 3D / canvas/WebGL rendering (DOM/CSS or terminal UI only)
- ❌ Mobile app wrapper / Capacitor / Expo
- ❌ Analytics, telemetry, ads
- ❌ Clan chat, diplomacy, alliances beyond the 2-clan event

---

## 6. Constraints

- **Stack:** Open — decide in Decide phase (options: TS+Vite+DOM, TS+Phaser, Python+Textual, Rust+Bevy/WASM)
- **Deadline:** Prototype playable in 2–3 weekends
- **Budget:** $0 — free tools only
- **Code quality:** Modular, typed, testable core logic (systems pure, UI separate)
- **Persistence:** Must survive browser reload / process restart
- **No external API dependencies** (self-contained)

---

## 7. Risks / Unknowns (Research Targets)

| Risk | Research Question |
|------|-------------------|
| Stack choice | Which stack gives fastest iteration for "base builder + tabs + timers + persistence"? |
| State management | Centralized store (Redux/Zustand) vs simple event bus vs reactive signals? |
| Time simulation | How to handle offline progression (catch-up on load) cleanly? |
| Tech tree data | Data-driven (JSON) vs code-defined? Schema for unlocks/prereqs? |
| Event simulation | AI clan behavior: simple fixed schedule or reactive to player? |
| Persistence | localStorage (simple, 5MB limit) vs sql.js (SQL, larger, heavier)? |

- [RESEARCH] Which stack gives fastest iteration for "base builder + tabs + timers + persistence"?
- [RESEARCH] Centralized store (Redux/Zustand) vs simple event bus vs reactive signals?
- [RESEARCH] How to handle offline progression (catch-up on load) cleanly?
- [RESEARCH] Data-driven (JSON) vs code-defined? Schema for unlocks/prereqs?
- [RESEARCH] AI clan behavior: simple fixed schedule or reactive to player?
- [RESEARCH] localStorage (simple, 5MB limit) vs sql.js (SQL, larger, heavier)?
- [RESEARCH] What open-source prototypes exist for base-builder + clan event mechanics?

---

Surfaces: Base Tab, Research Tab, Clan Event Tab, Shop Tab, Persistence

## 8. Surfaces

| Surface | Description | Success Criterion |
|---------|-------------|-------------------|
| **Base Tab** | Building grid, resource counters, build queue | Click building → queue → timer counts down → resource rate updates |
| **Research Tab** | Tree view, node states (locked/available/researching/done) | Click available → research starts → timer → unlock applies bonus |
| **Clan Event Tab** | 7-day timer, two clan scores, point breakdown, AI activity log | Points update on player actions; AI points tick; leaderboard reflects |
| **Shop Tab** | Currency balance, 4 items with prices, buy button | Buy → currency deducted → effect applied (instant or queued) |
| **Persistence** | Auto-save on state change, load on init | Reload → all timers, resources, research, event state restored |

---

## 9. Non-Functional

- **Performance:** 60fps idle, <100ms interaction response, <5s cold load
- **Accessibility:** Keyboard navigable, semantic HTML, color contrast AA
- **Maintainability:** Systems pure (no UI deps), single state source, TypeScript strict
- **Extensibility:** New buildings/techs/items via data files, not code changes

---

## 10. Milestone Definition

**M001 — Prototype Jouable (Local, Single-Player)**

Deliverable: A runnable prototype meeting all 7 Success Criteria above, with clean architecture ready for multiplayer layer injection in M002.

**Exit Gate:** Manual playthrough verifying all 7 criteria + `pipeline_state.py` transition to `plan/active`.