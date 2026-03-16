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

  const lockedMatchups = matchups.filter((m) => m.winner !== null).length;
  const pendingMatchups = matchups.filter((m) => m.winner === null).length;

  const stats = [
    { label: 'Total Entries', value: entries.length, color: '#f97316' },
    { label: 'Surviving', value: alive, color: '#22c55e' },
    { label: 'Uncertain', value: uncertain, color: '#f59e0b' },
    { label: 'Eliminated', value: eliminated, color: '#ef4444' },
    { label: 'Games Final', value: lockedMatchups, color: '#3b82f6' },
    { label: 'Games Pending', value: pendingMatchups, color: '#94a3b8' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        padding: '20px 24px',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: '1 1 120px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '14px 18px',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
