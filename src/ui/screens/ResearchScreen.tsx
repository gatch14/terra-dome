import { gameState, researchQueue, availableResearch } from '../../core/state/derived.js'
import { startResearch, cancelResearch } from '../../core/systems/research.js'
import { RESEARCH_DEFINITIONS } from '../../core/systems/researchDefinitions.js'
import { TechTree } from '../components/TechTree.js'
import { ResearchQueue } from '../components/ResearchQueue.js'
import { showToast } from '../components/Toast.js'

export function ResearchScreen() {
  const state = gameState.value
  const queue = researchQueue.value
  const available = availableResearch.value
  
  const handleStartResearch = (nodeId: string) => {
    const def = RESEARCH_DEFINITIONS[nodeId]
    if (!window.confirm(`Start research ${def?.name}?`)) return
    if (startResearch(nodeId)) {
      showToast(`Research started: ${def?.name}`, 'success')
    } else {
      showToast(`Cannot start ${def?.name} — check cost or prerequisites`, 'warning')
    }
  }
  
  const handleCancelResearch = (nodeId: string) => {
    if (cancelResearch(nodeId)) {
      showToast('Research cancelled', 'info')
    }
  }
  
  return (
    <div class="screen research-screen" id="research-panel" role="tabpanel">
      <div class="screen-header">
        <h2>Research</h2>
      </div>
      
      <div class="screen-content research-content">
        <TechTree 
          definitions={RESEARCH_DEFINITIONS}
          nodeStates={state.research}
          available={available}
          onStart={handleStartResearch}
        />
        
        <ResearchQueue 
          queue={queue}
          onCancel={handleCancelResearch}
        />
      </div>
    </div>
  )
}
