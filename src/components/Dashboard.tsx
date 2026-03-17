import { C, statusColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computeTeamStats, getEntryStatus } from '../lib/derive';

interface DashboardProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function Dashboard({ entries, matchups, scenario }: DashboardProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);
  const teamStats  = computeTeamStats(entries, teamStatus);
  const survival   = entries.map((e) => getEntryStatus(e, teamStatus));

  const alive     = survival.filter((s) => s === 'alive').length;
  const eliminated= survival.filter((s) => s === 'eliminated').length;
  const uncertain = survival.filter((s) => s === 'uncertain').length;

  const locked  = matchups.filter((m) => m.winner !== null);
  const pending = matchups.filter((m) => m.winner === null);

  const teamCounts = {
    alive: Object.values(teamStatus).filter((s) => s === 'alive').length,
    won:   Object.values(teamStatus).filter((s) => s === 'won').length,
    dead:  Object.values(teamStatus).filter((s) => s === 'dead').length,
  };

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>

        {/* Entry Status */}
        <Card title="Entry Status">
          {[
            { label: 'Surviving',                value: alive,           color: C.alive },
            { label: 'Uncertain (games pending)',  value: uncertain,       color: C.uncertain },
            { label: 'Eliminated',               value: eliminated,      color: C.dead },
            { label: 'Total Entries',            value: entries.length,  color: C.textMid },
          ].map((s) => (
            <StatRow key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </Card>

        {/* Game Status */}
        <Card title="Today's Games">
          {[
            { label: 'Games Final',       value: locked.length,       color: C.alive },
            { label: 'Games Pending',     value: pending.length,      color: C.uncertain },
            { label: 'Teams Still Alive', value: teamCounts.alive,    color: C.alive },
            { label: 'Teams Eliminated',  value: teamCounts.dead,     color: C.dead },
          ].map((s) => (
            <StatRow key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </Card>

        {/* Top Picks */}
        <Card title="Most Popular Picks">
          {teamStats.slice(0, 8).map((t, i) => {
            const color = statusColor(t.status);
            return (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <span style={{ width: 18, fontSize: 11, color: C.textDim, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: C.textMid }}>{t.pickPercent.toFixed(1)}%</span>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 3, height: 4 }}>
                    <div style={{
                      width: `${t.pickPercent}%`, height: '100%',
                      background: color, borderRadius: 3,
                      opacity: t.status === 'dead' ? 0.25 : 1,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Completed games */}
        {locked.length > 0 && (
          <Card title="Completed Games">
            {locked.map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 12,
              }}>
                <span style={{
                  color: m.winner === m.team1 ? C.alive : C.textDim,
                  textDecoration: m.winner === m.team2 ? 'line-through' : 'none',
                  fontWeight: m.winner === m.team1 ? 600 : 400,
                }}>
                  {m.team1}
                </span>
                <span style={{ color: C.textDim, fontSize: 10 }}>vs</span>
                <span style={{
                  color: m.winner === m.team2 ? C.alive : C.textDim,
                  textDecoration: m.winner === m.team1 ? 'line-through' : 'none',
                  fontWeight: m.winner === m.team2 ? 600 : 400,
                }}>
                  {m.team2}
                </span>
                <span style={{ color: C.alive, fontWeight: 700, fontSize: 11, marginLeft: 6 }}>
                  W
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.textDim,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 12, color: C.textMid }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
    </div>
  );
}
