import { C, statusColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computeTeamStats } from '../lib/derive';

const STATUS_LABEL: Record<string, string> = {
  alive: 'Alive', won: 'Won', dead: 'Eliminated', unknown: '—',
};

interface TeamFrequencyProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function TeamFrequency({ entries, matchups, scenario }: TeamFrequencyProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);
  const stats = computeTeamStats(entries, teamStatus);

  if (stats.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>No pick data available.</div>;
  }

  const maxCount = stats[0].pickCount;

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Bar chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Pick Frequency</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Today's picks across all entries</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.map((t) => {
              const color = statusColor(t.status);
              return (
                <div key={t.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: C.textMid }}>
                      {t.pickCount} picks · {t.pickPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 4, height: 7, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(t.pickCount / maxCount) * 100}%`, height: '100%',
                      background: color, borderRadius: 4,
                      opacity: t.status === 'dead' ? 0.3 : 1,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Team Summary</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Color-coded by tournament status</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['#', 'Team', 'Status', 'Picks', '%'].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((t, i) => {
                const color = statusColor(t.status);
                return (
                  <tr key={t.name} style={{
                    borderBottom: `1px solid ${C.bg}`,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    opacity: t.status === 'dead' ? 0.45 : 1,
                  }}>
                    <td style={{ ...TD, color: C.textDim }}>{i + 1}</td>
                    <td style={{ ...TD, color, fontWeight: 600 }}>{t.name}</td>
                    <td style={TD}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td style={{ ...TD, color: C.text, fontWeight: 600 }}>{t.pickCount}</td>
                    <td style={{ ...TD, color: C.textMid }}>{t.pickPercent.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
        {[['Alive', C.alive], ['Won', C.won], ['Eliminated', C.dead], ['Unknown', C.textDim]].map(([s, color]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textMid }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 10,
  fontWeight: 700, color: C.textDim,
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
const TD: React.CSSProperties = { padding: '9px 16px' };
