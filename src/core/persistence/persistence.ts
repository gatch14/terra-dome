import { set, get, del } from 'idb-keyval'
import { SaveFileSchema, CURRENT_SAVE_VERSION } from './schema.js'
import { migrateSave } from './migration.js'
import type { GameState, SaveFile } from '../state/types.js'
import { gameState } from '../state/gameState.js'

const SAVE_KEY = 'terra-dome-save'
const BACKUP_KEY = 'terra-dome-save-backup'

let saveIntervalId: ReturnType<typeof setInterval> | null = null

export async function saveGame(state?: GameState): Promise<void> {
  const stateToSave = state || gameState.value
  const saveFile: SaveFile = {
    version: CURRENT_SAVE_VERSION,
    data: stateToSave,
    savedAt: Date.now()
  }
  
  try {
    await set(SAVE_KEY, saveFile)
    await set(BACKUP_KEY, saveFile)
  } catch (error) {
    console.error('Failed to save game:', error)
    throw error
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const saveFile = await get<SaveFile>(SAVE_KEY)
    if (!saveFile) return null
    
    const migrated = migrateSave(saveFile)
    const parsed = SaveFileSchema.safeParse(migrated)
    
    if (!parsed.success) {
      console.error('Save validation failed:', parsed.error)
      return await loadBackup()
    }
    
    return parsed.data.data
  } catch (error) {
    console.error('Failed to load game:', error)
    return await loadBackup()
  }
}

async function loadBackup(): Promise<GameState | null> {
  try {
    const backup = await get<SaveFile>(BACKUP_KEY)
    if (!backup) return null
    
    const parsed = SaveFileSchema.safeParse(backup)
    if (!parsed.success) return null
    
    return parsed.data.data
  } catch {
    return null
  }
}

export function exportSave(): string {
  const saveFile: SaveFile = {
    version: CURRENT_SAVE_VERSION,
    data: gameState.value,
    savedAt: Date.now()
  }
  return JSON.stringify(saveFile, null, 2)
}

export async function importSave(json: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(json)
    const migrated = migrateSave(parsed)
    const validated = SaveFileSchema.parse(migrated)
    await set(SAVE_KEY, validated)
    await set(BACKUP_KEY, validated)
    return true
  } catch (error) {
    console.error('Import failed:', error)
    return false
  }
}

export async function clearSave(): Promise<void> {
  await del(SAVE_KEY)
  await del(BACKUP_KEY)
}

export function setupAutoSave(intervalMs: number = 10_000): void {
  if (saveIntervalId !== null) return
  saveIntervalId = setInterval(() => {
    saveGame().catch(console.error)
  }, intervalMs)

  const flush = () => {
    saveGame().catch(console.error)
  }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

export function teardownAutoSave(): void {
  if (saveIntervalId !== null) {
    clearInterval(saveIntervalId)
    saveIntervalId = null
  }
}

export function setupStorageSync(): void {
  window.addEventListener('storage', (event) => {
    if (event.key === SAVE_KEY && event.newValue) {
      const newSave = JSON.parse(event.newValue)
      const currentSave = gameState.value
      if (newSave.savedAt > currentSave.lastSave) {
        window.location.reload()
      }
    }
  })
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}