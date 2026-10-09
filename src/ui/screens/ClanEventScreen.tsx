import { getLeaderboard, getPointLog } from '../../core/systems/clanEvent.js'
import { gameState } from '../../core/state/gameState.js'
import { EventTimer } from '../components/EventTimer.js'
import { ClanLeaderboard } from '../components/ClanLeaderboard.js'
import { PointLog } from '../components/PointLog.js'

export function ClanEventScreen() {
  const endTime = gameState.value.clanEvent.eventEndTime
  const leaderboard = getLeaderboard()
  const pointLog = getPointLog()

  return (
    <div class="screen clan-event-screen" id="clan-panel" role="tabpanel">
      <div class="screen-header">
        <h2>Clan Event</h2>
      </div>

      <div class="screen-content clan-content">
        <EventTimer endTime={endTime} />
        <ClanLeaderboard leaderboard={leaderboard} />
        <PointLog entries={pointLog} />
      </div>
    </div>
  )
}
