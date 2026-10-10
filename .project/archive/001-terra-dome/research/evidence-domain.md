# Evidence — domain

Dimension: domain
Questions assigned: Data-driven (JSON) vs code-defined? Schema for unlocks/prereqs?; AI clan behavior: simple fixed schedule or reactive to player?

## Finding: Core loop terminology is standardized across peaceful KvK games

- **Claim**: Peaceful KvK base-builders (Last Z, Whiteout Survival, State of Survival) share identical core loop terminology: Command Center as central building, resource tick per second, serial build/research queues with speedup items, DAG tech trees, 7-day clan events with points from PvE actions
- **Source**: Reddit r/LastZ community guides, YouTube "Last Z mechanics" deconstructions, Whiteout Survival economy spreadsheets, State of Survival wiki
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 1-3 define success criteria around these exact loops; using established terminology reduces player learning curve

## Finding: Tech trees use category branches with linear progression within branch

- **Claim**: Commercial games use 2-3 category branches (Economy/Production, Military/Combat, Defense/Support) with linear node progression within each branch; prerequisites form a DAG across branches; nodes have resource cost + time cost + passive effect (percentage bonus)
- **Source**: Last Z research tree screenshots (Reddit), Whiteout Survival alliance tech tree (wiki), Rise of Kingdoms academy tree (wiki)
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 4 Scope In specifies "5-8 tech nodes" and "data-driven JSON schema" — this pattern informs the schema design

## Finding: AI clan behavior uses fixed schedule with personality profiles

- **Claim**: Asynchronous competition in prototypes uses fixed point-per-hour schedules with configurable "personality" (Rusher: early lead, Grinder: steady, Late Bloomer: end-week surge); no commercial game exposes AI logic but community reverse-engineering confirms simple schedules
- **Source**: Last Z KvK matchmaking analysis (Discord leaks), prototype post-mortems on GitHub (idle-game-engine repos)
- **Confidence**: medium
- **Why it matters here**: INTENT.md Section 7 asks "AI clan behavior: simple fixed schedule or reactive to player?" — fixed schedule + personality is implementable and sufficient for prototype

## Finding: No negative feedback loops in successful peaceful KvK designs

- **Claim**: Falling behind in clan points never locks players out of rewards; participation tiers guarantee baseline rewards; personal milestones decouple from clan rank
- **Source**: Last Z KvK reward structure (wiki), Whiteout Survival alliance war rewards (wiki)
- **Confidence**: high
- **Why it matters here**: INTENT.md Section 9 Non-Functional requires "No negative feedback loops" — confirms this is a deliberate design choice

## Assigned questions — answers

- Data-driven (JSON) vs code-defined? Schema for unlocks/prereqs? → JSON schema with nodes array (id, name, category, prereqs[], cost{}, effect{}) — used by CivClicker, Kittens Game, allows hot-reload
- AI clan behavior: simple fixed schedule or reactive to player? → Fixed schedule + personality profile (configurable points/hour, ramp schedule); reactive adds complexity without player-perceived benefit

## Dead ends

- Commercial game AI reverse-engineering — Discord leaks are incomplete and version-specific; not reliable for prototype
- Complex DAG layout algorithms — overkill for 5-8 nodes; simple topological sort + manual positioning sufficient
ENDOFFILE