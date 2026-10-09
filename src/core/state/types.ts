export interface ResourceAmount {
  materials: number
  energy: number
  researchData: number
}

export type ResourceCost = ResourceAmount

export interface ResourceRate {
  materials: number
  energy: number
  researchData: number
}

export interface Building {
  id: string
  /** Definition id of the building placed in this slot, or null when the slot is empty. */
  buildingType: string | null
  level: number
  maxLevel: number
  queuePosition: number | null
  endTime: number | null
}

export interface ResearchNode {
  id: string
  state: 'locked' | 'available' | 'researching' | 'completed'
  queuePosition: number | null
  endTime: number | null
}

export interface ClanEventResults {
  winner: 'player' | 'ai'
  playerPoints: number
  aiPoints: number
  reward: { currency: number; speedups: string[] }
  endedAt: number
}

export interface ClanEvent {
  eventEndTime: number
  playerPoints: number
  aiPoints: number
  aiProfile: 'rusher' | 'grinder' | 'lateBloomer'
  pointLog: PointLogEntry[]
  cycle: number
  /** Fractional production points not yet granted (persisted across reloads). */
  produceAccumulator: number
  /** Results of the last finished event, shown in the results modal until claimed. */
  lastResults: ClanEventResults | null
}

export interface PointLogEntry {
  timestamp: number
  clan: 'player' | 'ai'
  source: string
  amount: number
}

export interface ShopItem {
  id: string
  count: number
}

export interface ShopState {
  currency: number
  inventory: ShopItem[]
}

export interface GameState {
  resources: ResourceAmount
  buildings: Record<string, Building>
  research: Record<string, ResearchNode>
  buildingQueue: string[]
  researchQueue: string[]
  clanEvent: ClanEvent
  shop: ShopState
  lastSave: number
  version: number
}

export type SlotType = 'command' | 'resource' | 'research'

export interface SlotDef {
  id: string
  type: SlotType
  label: string
  /** Fixed building type for slots that cannot choose (command center, research lab). */
  buildingType?: string
  /** Unlock requirement, e.g. research lab needs Command Center Lv.2. */
  requires?: { building: string; level: number }
}

export interface BuildingDef {
  id: string
  name: string
  category: 'command' | 'resource' | 'research' | 'storage'
  slotType: SlotType
  maxLevel: number
  initialLevel: number
  baseCost: ResourceAmount
  costMultiplier: number
  baseBuildTime: number
  timeMultiplier: number
  production: Partial<ResourceRate>
  storageBonus: Partial<ResourceAmount>
}

export interface ResourceDef {
  id: string
  name: string
  baseStorage: number
  baseRate: number
}

export interface ResearchDef {
  id: string
  name: string
  category: 'production' | 'research' | 'clan'
  prereqs: string[]
  cost: ResourceAmount
  time: number
  effect: {
    type: 'resourceRate' | 'buildSpeed' | 'researchSpeed' | 'clanPointsMultiplier'
    target: string
    value: number
  }
}

export interface ShopDef {
  id: string
  name: string
  description: string
  price: number
  effect: {
    type: 'buildSpeedup' | 'researchSpeedup' | 'resourcePack' | 'clanPointBoost'
    value: number
    duration?: number
  }
}

/**
 * Runtime definition registry. Populated by each definitions module when it
 * is imported; read by derived signals so they never import later-wave files.
 */
export interface GameDefinitions {
  slots: SlotDef[]
  buildings: Record<string, BuildingDef>
  resources: Record<string, ResourceDef>
  research: Record<string, ResearchDef>
}

export interface SaveFile {
  version: number
  data: GameState
  savedAt: number
}
