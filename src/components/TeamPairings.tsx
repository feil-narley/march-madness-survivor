import { C, statusColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computePairingMatrix } from '../lib/derive';

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
      <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>
        No pairing data — entries need at least 2 picks each.
      </div>
    );
  }

  let maxVal = 0;
  teams.forEach((a) =>
    teams.forEach((b) => {
      if (a !== b && matrix[a]?.[b]) maxVal = Math.max(maxVal, matrix[a][b]);
    })
  );

  function cellBg(val: number): string {
    if (!val) return C.bg;
    const t = val / maxVal;
    // teal heat: C.bg → C.accent
    const r = Math.round(9  + t * (56  - 9));
    const g = Math.round(13 + t * (189 - 13));
    const b = Math.round(24 + t * (248 - 24));
    return `rgb(${r},${g},${b})`;
  }

  const CELL = 38;

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Team Pairing Heatmap</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            How often two teams appear together in the same entry — hover a cell for details.
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ width: 120, minWidth: 120 }} />
                {teams.map((team) => (
                  <th key={team} style={{
                    width: CELL, minWidth: CELL, padding: 3,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    height: 110, textAlign: 'left',
                    color: statusColor(teamStatus[team] ?? 'unknown'),
                    fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
                  }}>
                    {team}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((rowTeam) => (
                <tr key={rowTeam}>
                  <td style={{
                    padding: '3px 10px 3px 0', whiteSpace: 'nowrap',
                    color: statusColor(teamStatus[rowTeam] ?? 'unknown'),
                    fontWeight: 600, fontSize: 11,
                  }}>
                    {rowTeam}
                  </td>
                  {teams.map((colTeam) => {
                    const isDiag = rowTeam === colTeam;
                    const val = isDiag ? null : (matrix[rowTeam]?.[colTeam] ?? 0);
                    return (
                      <td key={colTeam}
                        title={isDiag ? rowTeam : `${rowTeam} + ${colTeam}: ${val} entries`}
                        style={{
                          width: CELL, height: CELL,
                          background: isDiag ? C.elevated : cellBg(val ?? 0),
                          textAlign: 'center', verticalAlign: 'middle',
                          color: val && val > 0 ? (val / maxVal > 0.5 ? '#000' : '#fff') : C.border,
                          fontWeight: 700,
                          border: `1px solid ${C.bg}`,
                          cursor: 'default',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {isDiag ? '·' : (val || '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textDim }}>Low</span>
          <div style={{
            width: 120, height: 8, borderRadius: 4,
            background: `linear-gradient(to right, ${C.bg}, ${C.accent})`,
          }} />
          <span style={{ fontSize: 11, color: C.textDim }}>High frequency</span>
        </div>
      </div>
    </div>
  );
}
