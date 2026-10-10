import { Signal } from '@preact/signals'

const tabs = [
  { id: 'base', label: 'Base', icon: '🏗️' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'clan', label: 'Clan Event', icon: '⚔️' },
  { id: 'shop', label: 'Shop', icon: '🛒' }
] as const

type TabId = typeof tabs[number]['id']

interface TabBarProps {
  activeTab: Signal<TabId>
}

export function TabBar({ activeTab }: TabBarProps) {
  return (
    <nav class="tab-bar" role="tablist" aria-label="Main navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab.value === tab.id}
          aria-controls={`${tab.id}-panel`}
          class={`tab-btn ${activeTab.value === tab.id ? 'active' : ''}`}
          onClick={() => { activeTab.value = tab.id }}
        >
          <span class="tab-icon">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
