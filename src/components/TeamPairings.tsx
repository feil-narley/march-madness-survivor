import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computePairingMatrix } from '../lib/derive';

const STATUS_COLOR: Record<string, string> = {
  alive: '#22c55e',
  won: '#3b82f6',
  dead: '#ef4444',
  unknown: '#64748b',
};

interface TeamPairingsProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function TeamPairings({ entries, matchups, scenario }: TeamPairingsProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);
  const matrix = computePairingMatrix(entries);
  const teams = Object.keys(matrix).sort();

  if (teams.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
        No pairing data — entries need at least 2 picks.
      </div>
    );
  }

  // Find max value for heat scaling
  let maxVal = 0;
  teams.forEach((a) =>
    teams.forEach((b) => {
      if (a !== b && matrix[a]?.[b]) maxVal = Math.max(maxVal, matrix[a][b]);
    })
  );

  function cellColor(val: number): string {
    if (!val) return '#0f172a';
    const intensity = val / maxVal;
    // Orange heat: from dark to bright orange
    const r = Math.round(15 + intensity * (249 - 15));
    const g = Math.round(23 + intensity * (115 - 23));
    const b = Math.round(42 + intensity * (22 - 42));
    return `rgb(${r},${g},${b})`;
  }

  const CELL = 36;

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
          Team Pairing Heatmap
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#64748b' }}>
          How often teams are picked together in the same entry (today's picks only).
          Darker orange = more frequent pairing.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {/* Top-left empty corner */}
                <th style={{ width: 110, minWidth: 110 }} />
                {teams.map((team) => {
                  const color = STATUS_COLOR[teamStatus[team] ?? 'unknown'] ?? '#64748b';
                  return (
                    <th
                      key={team}
                      style={{
                        width: CELL,
                        minWidth: CELL,
                        padding: 4,
                        writingMode: 'vertical-rl',
                        textAlign: 'left',
                        transform: 'rotate(180deg)',
                        height: 110,
                        color,
                        fontWeight: 600,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {team}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {teams.map((rowTeam) => {
                const rowColor = STATUS_COLOR[teamStatus[rowTeam] ?? 'unknown'] ?? '#64748b';
                return (
                  <tr key={rowTeam}>
                    <td
                      style={{
                        padding: '4px 10px 4px 0',
                        color: rowColor,
                        fontWeight: 600,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rowTeam}
                    </td>
                    {teams.map((colTeam) => {
                      const val = rowTeam === colTeam ? null : (matrix[rowTeam]?.[colTeam] ?? 0);
                      return (
                        <td
                          key={colTeam}
                          title={
                            rowTeam === colTeam
                              ? rowTeam
                              : `${rowTeam} + ${colTeam}: ${val} entries`
                          }
                          style={{
                            width: CELL,
                            height: CELL,
                            background: rowTeam === colTeam ? '#334155' : cellColor(val ?? 0),
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            color: val && val > 0 ? '#fff' : '#334155',
                            fontWeight: 600,
                            cursor: 'default',
                            border: '1px solid #0f172a',
                          }}
                        >
                          {rowTeam === colTeam ? '—' : (val || '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
