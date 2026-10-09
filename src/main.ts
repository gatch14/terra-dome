import { gameState } from './core/state/gameState.js'

// T001 scaffold bootstrap: render a status shell from the initial game state.
// Save/load wiring lands with T005; tab screens land with the UI waves.
function renderScaffold(): void {
  const root = document.getElementById('app')
  if (!root) return
  const { materials, energy, researchData } = gameState.value.resources
  const shell = document.createElement('div')
  shell.className = 'scaffold-status'
  shell.textContent = `Terra Dome — materials ${materials} / energy ${energy} / research data ${researchData}`
  root.appendChild(shell)
}

renderScaffold()
