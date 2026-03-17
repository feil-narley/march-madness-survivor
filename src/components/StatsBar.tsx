import { C } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus } from '../lib/derive';

interface StatsBarProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function StatsBar({ entries, matchups, scenario }: StatsBarProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);

  let alive = 0, eliminated = 0, uncertain = 0;
  entries.forEach((e) => {
    const s = getEntryStatus(e, teamStatus);
    if (s === 'alive') alive++;
    else if (s === 'eliminated') eliminated++;
    else uncertain++;
  });

  const locked  = matchups.filter((m) => m.winner !== null).length;
  const pending = matchups.filter((m) => m.winner === null).length;

  const stats = [
    { label: 'Total Entries',  value: entries.length, color: C.text },
    { label: 'Surviving',      value: alive,           color: C.alive },
    { label: 'Uncertain',      value: uncertain,       color: C.uncertain },
    { label: 'Eliminated',     value: eliminated,      color: C.dead },
    { label: 'Games Final',    value: locked,          color: C.won },
    { label: 'Games Pending',  value: pending,         color: C.textMid },
  ];

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 10,
      padding: '18px 28px', maxWidth: 1440, margin: '0 auto',
    }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: '1 1 110px',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
