import { signal, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { gameState } from '../core/state/gameState.js'
import { tick } from '../core/systems/resources.js'
import { timerManager } from '../core/time/timerManager.js'
import { tickAI, checkEventEnd, claimEventResults } from '../core/systems/clanEvent.js'
import { TabBar } from './components/TabBar.js'
import { BaseScreen } from './screens/BaseScreen.js'
import { ResearchScreen } from './screens/ResearchScreen.js'
import { ClanEventScreen } from './screens/ClanEventScreen.js'
import { ShopScreen } from './screens/ShopScreen.js'
import { ToastContainer, showToast } from './components/Toast.js'
import { EventResultsModal } from './components/EventResultsModal.js'

const activeTab = signal<'base' | 'research' | 'clan' | 'shop'>('base')

function getScreen() {
  switch (activeTab.value) {
    case 'base': return <BaseScreen />
    case 'research': return <ResearchScreen />
    case 'clan': return <ClanEventScreen />
    case 'shop': return <ShopScreen />
  }
}

export function App() {
  const lastTick = useSignal(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const deltaSec = (now - lastTick.value) / 1000
      lastTick.value = now

      tick(deltaSec)
      timerManager.tick(now)
      tickAI(now)
      checkEventEnd(now)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleClaim = () => {
    if (claimEventResults()) {
      showToast('Event rewards claimed — rewards added to your inventory', 'success')
    }
  }

  const results = gameState.value.clanEvent.lastResults

  return (
    <div class="app">
      <header class="app-header">
        <h1>Terra Dome</h1>
        <div class="header-info">
          <span class="currency">💎 {gameState.value.shop.currency}</span>
        </div>
      </header>
      <TabBar activeTab={activeTab} />
      <main class="app-main">
        {getScreen()}
      </main>
      {results && <EventResultsModal results={results} onClaim={handleClaim} />}
      <ToastContainer />
    </div>
  )
}
