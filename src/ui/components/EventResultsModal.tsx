import type { ClanEventResults } from '../../core/state/types.js'

interface EventResultsModalProps {
  results: ClanEventResults
  onClaim: () => void
}

/**
 * Shown when the weekly clan event ends (including when it ended while the
 * player was away). Claiming awards the reward and dismisses the modal.
 */
export function EventResultsModal({ results, onClaim }: EventResultsModalProps) {
  const playerWon = results.winner === 'player'

  return (
    <div class="event-results-overlay" role="presentation">
      <div
        class="event-results-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-results-title"
      >
        <h3 id="event-results-title" class={playerWon ? 'result-title win' : 'result-title loss'}>
          {playerWon ? 'Victory!' : 'Defeat'}
        </h3>

        <div class="result-scores">
          <div class="result-score">
            <span class="result-clan">Your Clan</span>
            <span class="result-points">{results.playerPoints}</span>
          </div>
          <span class="result-vs">vs</span>
          <div class="result-score">
            <span class="result-clan">AI Clan</span>
            <span class="result-points">{Math.round(results.aiPoints)}</span>
          </div>
        </div>

        <div class="result-reward">
          <p class="reward-label">Reward</p>
          <p class="reward-value">💎 {results.reward.currency} · {results.reward.speedups.length} speedups</p>
        </div>

        <button class="btn-claim" onClick={onClaim}>
          Claim Rewards
        </button>
      </div>
    </div>
  )
}
