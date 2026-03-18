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

  // Rows: alphabetical A → Z
  const rowTeams = Object.keys(matrix).sort();
  // Columns: reverse alphabetical Z → A
  const colTeams = [...rowTeams].reverse();

  const N = rowTeams.length;

  if (N === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>
        No pairing data — entries need at least 2 picks each.
      </div>
    );
  }

  // Find max value across the upper triangle only
  let maxVal = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // Only upper triangle: i + j < N - 1 (and not diagonal i + j === N - 1)
      if (i + j < N - 1) {
        const val = matrix[rowTeams[i]]?.[colTeams[j]] ?? 0;
        maxVal = Math.max(maxVal, val);
      }
    }
  }

  // Blue heat: dark bg → blue
  function cellBg(val: number): string {
    if (!val || maxVal === 0) return C.bg;
    const t = val / maxVal;
    const r = Math.round(9  + t * (59  - 9));
    const g = Math.round(13 + t * (130 - 13));
    const b = Math.round(24 + t * (246 - 24));
    return `rgb(${r},${g},${b})`;
  }

  const CELL = 38;

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Team Pairing Matrix</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            How often two teams appear in the same entry. Rows A→Z, columns Z→A. Each unique pair shown once.
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {/* Corner spacer */}
                <th style={{ width: 120, minWidth: 120 }} />
                {colTeams.map((team, j) => {
                  // Only render header for columns that will have at least one filled cell
                  // A column j has cells when i + j < N-1, i.e. i < N-1-j, so i can be 0..N-2-j
                  // That's valid as long as N-2-j >= 0, i.e. j <= N-2, i.e. always except last col
                  const hasAnyCells = j <= N - 2;
                  return (
                    <th key={team} style={{
                      width: CELL, minWidth: CELL, padding: 3,
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      height: 110, textAlign: 'left',
                      color: hasAnyCells ? statusColor(teamStatus[team] ?? 'unknown') : C.textDim,
                      fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
                      opacity: hasAnyCells ? 1 : 0.3,
                    }}>
                      {team}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rowTeams.map((rowTeam, i) => {
                // Skip rows that have no filled cells (i >= N-1 means i+0 >= N-1, no cells)
                if (i >= N - 1) return null;
                return (
                  <tr key={rowTeam}>
                    <td style={{
                      padding: '3px 10px 3px 0', whiteSpace: 'nowrap',
                      color: statusColor(teamStatus[rowTeam] ?? 'unknown'),
                      fontWeight: 600, fontSize: 11,
                    }}>
                      {rowTeam}
                    </td>
                    {colTeams.map((colTeam, j) => {
                      const isUpperTriangle = i + j < N - 1;
                      const isDiagonal      = i + j === N - 1;

                      if (!isUpperTriangle && !isDiagonal) {
                        // Empty — below the triangle
                        return <td key={colTeam} style={{ width: CELL, height: CELL, border: `1px solid ${C.bg}` }} />;
                      }
                      if (isDiagonal) {
                        // Same team — show separator dot
                        return (
                          <td key={colTeam} style={{
                            width: CELL, height: CELL,
                            background: C.elevated,
                            textAlign: 'center', verticalAlign: 'middle',
                            color: C.border, fontWeight: 700,
                            border: `1px solid ${C.bg}`,
                          }}>
                            ·
                          </td>
                        );
                      }

                      const val = matrix[rowTeam]?.[colTeam] ?? 0;
                      return (
                        <td key={colTeam}
                          title={`${rowTeam} + ${colTeam}: ${val} entries`}
                          style={{
                            width: CELL, height: CELL,
                            background: cellBg(val),
                            textAlign: 'center', verticalAlign: 'middle',
                            color: val > 0 ? (val / maxVal > 0.55 ? '#fff' : '#a0b4d0') : C.border,
                            fontWeight: 700,
                            border: `1px solid ${C.bg}`,
                            cursor: 'default',
                          }}
                        >
                          {val || ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textDim }}>Fewer</span>
          <div style={{
            width: 120, height: 8, borderRadius: 4,
            background: `linear-gradient(to right, ${C.bg}, ${C.alive})`,
          }} />
          <span style={{ fontSize: 11, color: C.textDim }}>More pairings</span>
        </div>
      </div>
    </div>
  );
}
