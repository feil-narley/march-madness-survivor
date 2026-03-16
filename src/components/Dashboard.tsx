import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computeTeamStats, getEntryStatus } from '../lib/derive';

const STATUS_COLOR: Record<string, string> = {
  alive: '#22c55e',
  won: '#3b82f6',
  dead: '#ef4444',
  unknown: '#64748b',
};

interface DashboardProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function Dashboard({ entries, matchups, scenario }: DashboardProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);
  const teamStats = computeTeamStats(entries, teamStatus);

  const survival = entries.map((e) => getEntryStatus(e, teamStatus));
  const alive = survival.filter((s) => s === 'alive').length;
  const eliminated = survival.filter((s) => s === 'eliminated').length;
  const uncertain = survival.filter((s) => s === 'uncertain').length;

  const lockedMatchups = matchups.filter((m) => m.winner !== null);
  const pendingMatchups = matchups.filter((m) => m.winner === null);

  const topPicks = teamStats.slice(0, 8);

  const teamCounts = {
    alive: Object.values(teamStatus).filter((s) => s === 'alive').length,
    won: Object.values(teamStatus).filter((s) => s === 'won').length,
    dead: Object.values(teamStatus).filter((s) => s === 'dead').length,
  };

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>

        {/* Entry Status Card */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>Entry Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Entries Surviving', value: alive, color: '#22c55e' },
              { label: 'Uncertain (games pending)', value: uncertain, color: '#f59e0b' },
              { label: 'Eliminated', value: eliminated, color: '#ef4444' },
              { label: 'Total Entries', value: entries.length, color: '#f97316' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Status Card */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>Today's Games</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Games Final', value: lockedMatchups.length, color: '#22c55e' },
              { label: 'Games Pending', value: pendingMatchups.length, color: '#f59e0b' },
              { label: 'Teams Alive', value: teamCounts.alive, color: '#22c55e' },
              { label: 'Teams Eliminated', value: teamCounts.dead, color: '#ef4444' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Picks Card */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>Most Popular Picks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topPicks.map((t, i) => {
              const color = STATUS_COLOR[t.status] ?? STATUS_COLOR.unknown;
              return (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, fontSize: 12, color: '#475569', textAlign: 'right' }}>{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color, fontWeight: 500 }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.pickPercent.toFixed(1)}%</span>
                    </div>
                    <div style={{ background: '#0f172a', borderRadius: 3, height: 5 }}>
                      <div
                        style={{
                          width: `${t.pickPercent}%`,
                          height: '100%',
                          background: color,
                          borderRadius: 3,
                          opacity: t.status === 'dead' ? 0.3 : 1,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent results */}
        {lockedMatchups.length > 0 && (
          <div style={cardStyle}>
            <h3 style={cardTitle}>Completed Games</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lockedMatchups.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155', fontSize: 13 }}>
                  <span style={{ color: m.winner === m.team1 ? '#22c55e' : '#475569', textDecoration: m.winner === m.team2 ? 'line-through' : 'none' }}>
                    {m.team1}
                  </span>
                  <span style={{ color: '#475569', fontSize: 11 }}>vs</span>
                  <span style={{ color: m.winner === m.team2 ? '#22c55e' : '#475569', textDecoration: m.winner === m.team1 ? 'line-through' : 'none' }}>
                    {m.team2}
                  </span>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 11 }}>W: {m.winner}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: 20,
};

const cardTitle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 14,
  fontWeight: 700,
  color: '#f97316',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
