import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computeTeamStats } from '../lib/derive';

const STATUS_COLOR: Record<string, string> = {
  alive: '#22c55e',
  won: '#3b82f6',
  dead: '#ef4444',
  unknown: '#64748b',
};

const STATUS_LABEL: Record<string, string> = {
  alive: 'Alive',
  won: 'Won',
  dead: 'Eliminated',
  unknown: 'Unknown',
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
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
        No team pick data available.
      </div>
    );
  }

  const maxCount = stats[0].pickCount;

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Bar chart */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#f1f5f9', fontWeight: 600 }}>
            Pick Frequency — Today's Picks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.map((t) => {
              const color = STATUS_COLOR[t.status] ?? STATUS_COLOR.unknown;
              const barWidth = (t.pickCount / maxCount) * 100;
              return (
                <div key={t.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, color, fontWeight: 500 }}>{t.name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {t.pickCount} ({t.pickPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ background: '#0f172a', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: color,
                        borderRadius: 4,
                        transition: 'width 0.4s ease',
                        opacity: t.status === 'dead' ? 0.4 : 1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
          <h3 style={{ margin: 0, padding: '16px 20px', fontSize: 15, color: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #334155' }}>
            Team Summary Table
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Team</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Picks</th>
                <th style={thStyle}>%</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((t, i) => {
                const color = STATUS_COLOR[t.status] ?? STATUS_COLOR.unknown;
                return (
                  <tr
                    key={t.name}
                    style={{
                      borderBottom: '1px solid #0f172a',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      opacity: t.status === 'dead' ? 0.5 : 1,
                    }}
                  >
                    <td style={{ ...tdStyle, color: '#475569' }}>{i + 1}</td>
                    <td style={{ ...tdStyle, color, fontWeight: 500 }}>{t.name}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 11,
                          color,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#f1f5f9', fontWeight: 600 }}>{t.pickCount}</td>
                    <td style={{ ...tdStyle, color: '#94a3b8' }}>{t.pickPercent.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([s, color]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            {STATUS_LABEL[s] ?? s}
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '9px 16px',
};
