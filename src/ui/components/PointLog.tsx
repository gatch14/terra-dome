
interface PointLogProps {
  entries: { timestamp: number; clan: 'player' | 'ai'; source: string; amount: number }[]
}

/** AC3 wording: the log shows human-readable event labels. */
const SOURCE_LABELS: Record<string, string> = {
  build: 'Build queued',
  build_cancel: 'Build cancelled',
  research: 'Research started',
  research_cancel: 'Research cancelled',
  produce: 'Production',
  passive: 'AI passive',
  event_end: 'Event ended'
}

export function PointLog({ entries }: PointLogProps) {
  const recentEntries = [...entries].reverse().slice(0, 20)
  
  if (recentEntries.length === 0) {
    return (
      <div class="point-log empty">
        <p>No clan points earned yet</p>
      </div>
    )
  }
  
  return (
    <div class="point-log" role="log" aria-label="Clan point activity" aria-live="polite">
      <h3>Point Activity</h3>
      <ul class="point-log-list">
        {recentEntries.map((entry, index) => (
          <li key={index} class={`point-entry ${entry.clan}`}>
            <span class="entry-clan">{entry.clan === 'player' ? '👤' : '🤖'}</span>
            <span class="entry-source">{SOURCE_LABELS[entry.source] ?? entry.source}</span>
            <span class="entry-amount">
              {entry.amount.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                signDisplay: 'exceptZero'
              })}
            </span>
            <span class="entry-time">{formatTime(entry.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
