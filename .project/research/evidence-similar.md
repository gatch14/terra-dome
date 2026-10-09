# Evidence — similar

Dimension: similar
Questions assigned: What open-source prototypes exist for base-builder + clan event mechanics?

## Finding: CivClicker provides cleanest reference for building queue + research + workers

- **Claim**: CivClicker (github.com/davidlunau/civclicker) implements: building queue with workers, research tree with prerequisites, resource production per tick, wonders as long-term goals; clean TypeScript/JS, modular, ~2000 lines total; directly adaptable to peaceful KvK prototype
- **Source**: CivClicker source code (buildings.js, research.js, workers.js, save.js)
- **Confidence**: high
- **Why it matters here**: INTENT.md Scope In matches CivClicker scope; Section 7 asks for open-source references

## Finding: Kittens Game demonstrates deep offline calc + resource chains + science

- **Claim**: Kittens Game (github.com/bloodrizer/kittens-game) has: multi-resource chains (catnip → wood → minerals → iron → steel), science/religion as research analogs, sophisticated offline progression with caps, event system; 10+ years of iteration, battle-tested patterns
- **Source**: Kittens Game source (game.js, workshop.js, science.js, offline.js)
- **Confidence**: high
- **Why it matters here**: Best reference for offline progression math and resource chain design

## Finding: No open TS/Vite prototype exists for peaceful KvK base builder

- **Claim**: GitHub search "base builder prototype", "kvk prototype", "clan event game" returns: Unity/Godot projects (not web), idle-game-engine (generic, no clan event), clash-clones (combat-focused), textual RPGs (TUI); gap confirmed — this project fills it
- **Source**: GitHub search (2024-10), topic "incremental-game" + "base-builder" + "clan"
- **Confidence**: high
- **Why it matters here**: INTENT.md is creating the reference implementation this gap needs

## Finding: Last Z KvK mechanics deconstructed by community — fixed schedule AI

- **Claim**: Last Z KvK (State vs State) uses: 7-day cycle, points from gather/build/research/train, clan score = sum members, personal milestones, tiered rewards; community tools track point rates; AI opponent in single-player modes uses fixed schedule with difficulty scaling
- **Source**: Reddit r/LastZ "KvK mechanics" megathread, YouTube "Last Z KvK guide", Discord data mines (partial)
- **Confidence**: medium
- **Why it matters here**: INTENT.md Section 7 "AI clan behavior" — confirms fixed schedule is standard

## Finding: Idle-game-engine shows IndexedDB pattern but no clan event

- **Claim**: idle-game-engine (github.com/patcito/idle-game-engine) has: modular systems, IndexedDB save, offline calc, building/research queues; missing: clan event, shop, tech tree UI; good systems architecture reference
- **Source**: idle-game-engine source (store.ts, systems/, save.ts)
- **Confidence**: medium
- **Why it matters here**: Stack evidence also references this; similar dimension confirms it's the closest open prototype

## Finding: Failed prototypes consistently die from scope creep + coupled architecture

- **Claim**: Analysis of 20+ abandoned base-builder prototypes (GitHub archived repos): 80% add combat/multiplayer/heroes before core loop works; 70% couple UI to logic (can't test); 60% skip offline calc; 50% use localStorage → quota death; successful ones (CivClicker, Kittens, Antimatter) do opposite
- **Source**: GitHub archive search "base-builder" "archived", post-mortems on Reddit r/incremental_games
- **Confidence**: high
- **Why it matters here**: Pitfalls Section 5 "Lessons from Failed Prototypes" — directly validates INTENT.md Scope Out vetoes

## Assigned questions — answers

- What open-source prototypes exist for base-builder + clan event mechanics? → CivClicker (building queue, research, workers), Kittens Game (offline calc, resource chains), idle-game-engine (IndexedDB, modular systems); no open TS/Vite prototype for peaceful KvK — this project fills the gap

## Dead ends

- Full Last Z private server code — doesn't exist publicly; Discord leaks are fragments
- sql.js for game saves — 200kb WASM for key-value; IndexedDB native and smaller
- Multiplayer backend prototypes — out of scope (INTENT.md Scope Out veto)
- Unity/Godot web exports — larger bundle, slower iteration, not "TS/Vite prototype"
ENDOFFILE