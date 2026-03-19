import { C } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus } from '../lib/derive';

interface StatsBarProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

function pct(n: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((n / total) * 100).toFixed(1)}%`;
}

export default function StatsBar({ entries, matchups, scenario }: StatsBarProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);

  let alive = 0, partial = 0, uncertain = 0, eliminated = 0;
  entries.forEach((e) => {
    const s = getEntryStatus(e, teamStatus);
    if (s === 'alive')      alive++;
    else if (s === 'partial')    partial++;
    else if (s === 'eliminated') eliminated++;
    else                         uncertain++;
  });

  const total   = entries.length;
  const locked  = matchups.filter((m) => m.winner !== null).length;
  const pending = matchups.filter((m) => m.winner === null).length;

  const stats = [
    { label: 'Total Entries', value: total,     pctStr: null,              color: C.text },
    { label: 'Survived',      value: alive,     pctStr: pct(alive, total), color: C.alive },
    { label: 'Partial',       value: partial,   pctStr: pct(partial, total), color: C.partial },
    { label: 'Uncertain',     value: uncertain, pctStr: pct(uncertain, total), color: C.uncertain },
    { label: 'Eliminated',    value: eliminated,pctStr: pct(eliminated, total), color: C.dead },
    { label: 'Games Final',   value: locked,    pctStr: null,              color: C.won },
    { label: 'Games Pending', value: pending,   pctStr: null,              color: C.textMid },
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </span>
            {s.pctStr && (
              <span style={{ fontSize: 12, color: s.color, opacity: 0.7, fontWeight: 500 }}>
                ({s.pctStr})
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
