import { signal, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { gameState } from '../core/state/gameState.js'
import { tick } from '../core/systems/resources.js'
import { timerManager } from '../core/time/timerManager.js'
import { tickAI, checkEventEnd, claimEventResults } from '../core/systems/clanEvent.js'
import { exportSave, importSave, isStorageAvailable, SAVE_QUOTA_EVENT } from '../core/persistence/persistence.js'
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

function downloadSave(): void {
  const blob = new Blob([exportSave()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'terra-dome-save.json'
  link.click()
  URL.revokeObjectURL(url)
}

function handleImportFile(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  file.text()
    .then(async (text) => {
      if (await importSave(text)) {
        window.location.reload()
      } else {
        showToast('Import failed — the file is not a valid save', 'warning')
      }
    })
    .catch(() => showToast('Import failed — could not read the file', 'warning'))
}

export function App() {
  const lastTick = useSignal(Date.now())
  const storageOk = useSignal(true)
  const fileInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    storageOk.value = isStorageAvailable()

    const onQuota = () => {
      showToast('Storage quota exceeded — export your progress', 'warning')
      if (window.confirm('Storage quota exceeded. Export your save now?')) {
        downloadSave()
      }
    }
    window.addEventListener(SAVE_QUOTA_EVENT, onQuota)
    return () => window.removeEventListener(SAVE_QUOTA_EVENT, onQuota)
  }, [])

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
      {!storageOk.value && (
        <div
          class="storage-banner"
          role="alert"
          style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '8px 12px', background: '#b45309', color: '#ffffff', fontSize: '14px' }}
        >
          <span>Storage unavailable — progress will not save.</span>
          <button type="button" onClick={downloadSave}>Export save</button>
          <button type="button" onClick={() => { fileInput.current?.click() }}>Import save</button>
          <input ref={fileInput} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      )}
      <TabBar activeTab={activeTab} />
      <main class="app-main">
        {getScreen()}
      </main>
      {results && <EventResultsModal results={results} onClaim={handleClaim} />}
      <ToastContainer />
    </div>
  )
}
