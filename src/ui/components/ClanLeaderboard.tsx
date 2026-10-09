
interface ClanLeaderboardProps {
  leaderboard: { clan: string; score: number }[]
}

export function ClanLeaderboard({ leaderboard }: ClanLeaderboardProps) {
  const maxScore = Math.max(...leaderboard.map(c => c.score), 1)
  
  return (
    <div class="clan-leaderboard" role="region" aria-label="Clan standings">
      <h3>Standings</h3>
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Clan</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((clan, index) => (
            <tr key={clan.clan} class={index === 0 ? 'leader' : ''}>
              <td class="rank">#{index + 1}</td>
              <td class="clan-name">{clan.clan}</td>
              <td class="clan-score">
                <div class="score-bar">
                  <div 
                    class="score-fill" 
                    style={{ width: `${(clan.score / maxScore) * 100}%` }}
                  ></div>
                </div>
                <span class="score-value">{clan.score.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
