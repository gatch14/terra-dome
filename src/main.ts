import { h, render } from 'preact'
import { gameState, touch, hydrateState } from './core/state/gameState.js'
import { loadGame, setupAutoSave, setupStorageSync, isStorageAvailable } from './core/persistence/persistence.js'
import { applyOfflineProgress } from './core/time/offlineCatchup.js'
import { timerManager } from './core/time/timerManager.js'
import { resumeTimers } from './core/time/resumeTimers.js'
import { checkEventEnd } from './core/systems/clanEvent.js'
import { App } from './ui/App.js'
// Definition modules register themselves with the state registry on import.
import './core/systems/buildingDefinitions.js'
import './core/systems/resourceDefinitions.js'
import './core/systems/researchDefinitions.js'
import './core/systems/clanEventDefinitions.js'
import './core/systems/shopDefinitions.js'

async function init() {
  if (!isStorageAvailable()) {
    console.warn('Storage not available, progress will not persist')
  }

  const savedState = await loadGame()
  if (savedState) {
    gameState.value = savedState
    hydrateState()
    applyOfflineProgress(gameState.value, Date.now())
    touch()
  } else {
    hydrateState()
  }

  // Event ended while away: record the results (modal) and start the next cycle.
  if (Date.now() >= gameState.value.clanEvent.eventEndTime) {
    checkEventEnd(Date.now())
  }

  resumeTimers()
  timerManager.start()
  setupAutoSave()
  setupStorageSync()

  const root = document.getElementById('app')
  if (root) render(h(App, null), root)
}

init().catch(console.error)
