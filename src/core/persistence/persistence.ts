import { set, get, del } from 'idb-keyval'
import { effect } from '@preact/signals'
import { SaveFileSchema, CURRENT_SAVE_VERSION } from './schema.js'
import { migrateSave } from './migration.js'
import type { GameState, SaveFile } from '../state/types.js'
import { gameState } from '../state/gameState.js'

const SAVE_KEY = 'terra-dome-save'
const BACKUP_KEY = 'terra-dome-save-backup'

/** Window event: a save failed because storage is full (the shell shows a toast and offers an export). */
export const SAVE_QUOTA_EVENT = 'persistence:quota-exceeded'

let autoSaveDispose: (() => void) | null = null
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null
let lastSeenSavedAt = 0
let storageChannel: BroadcastChannel | null = null

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.code === 22)
}

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
    lastSeenSavedAt = saveFile.savedAt
    storageChannel?.postMessage({ savedAt: saveFile.savedAt })
  } catch (error) {
    if (isQuotaError(error)) {
      window.dispatchEvent(new CustomEvent(SAVE_QUOTA_EVENT))
    }
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
    
    lastSeenSavedAt = parsed.data.savedAt
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
    
    lastSeenSavedAt = parsed.data.savedAt
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

export function setupAutoSave(debounceMs: number = 500): void {
  if (autoSaveDispose !== null) return

  const schedule = () => {
    if (autoSaveTimeout !== null) clearTimeout(autoSaveTimeout)
    autoSaveTimeout = setTimeout(() => {
      autoSaveTimeout = null
      saveGame().catch(console.error)
    }, debounceMs)
  }

  // effect() re-runs whenever gameState is reassigned (touch()), so auto-save
  // triggers on state change with a debounce instead of a fixed interval.
  autoSaveDispose = effect(() => {
    void gameState.value
    schedule()
  })

  const flush = () => {
    if (autoSaveTimeout !== null) {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = null
    }
    saveGame().catch(console.error)
  }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

export function teardownAutoSave(): void {
  if (autoSaveDispose !== null) {
    autoSaveDispose()
    autoSaveDispose = null
  }
  if (autoSaveTimeout !== null) {
    clearTimeout(autoSaveTimeout)
    autoSaveTimeout = null
  }
}

export function setupStorageSync(): void {
  // IndexedDB writes never fire window 'storage' events (those are for localStorage),
  // so cross-tab sync goes through BroadcastChannel: a save in one tab reloads the others.
  window.addEventListener('storage', (event) => {
    if (event.key === SAVE_KEY && event.newValue) {
      try {
        const newSave = JSON.parse(event.newValue)
        if (newSave.savedAt > lastSeenSavedAt) {
          lastSeenSavedAt = newSave.savedAt
          window.location.reload()
        }
      } catch {
        // Malformed payload: ignore, the current tab keeps its state.
      }
    }
  })
  if (storageChannel === null && 'BroadcastChannel' in window) {
    storageChannel = new BroadcastChannel('terra-dome-save')
    storageChannel.onmessage = (event: MessageEvent) => {
      const data = event.data as { savedAt?: number } | null
      if (data && typeof data.savedAt === 'number' && data.savedAt > lastSeenSavedAt) {
        lastSeenSavedAt = data.savedAt
        window.location.reload()
      }
    }
  }
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