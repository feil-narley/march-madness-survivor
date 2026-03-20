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

function computeCounts(entries: Entry[], teamStatus: Record<string, import('../lib/types').TeamStatus>) {
  let alive = 0, partial = 0, uncertain = 0, eliminated = 0;
  entries.forEach((e) => {
    const s = getEntryStatus(e, teamStatus);
    if (s === 'alive')           alive++;
    else if (s === 'partial')    partial++;
    else if (s === 'eliminated') eliminated++;
    else                         uncertain++;
  });
  return { alive, partial, uncertain, eliminated };
}

export default function StatsBar({ entries, matchups, scenario }: StatsBarProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);
  const { alive, partial, uncertain, eliminated } = computeCounts(entries, teamStatus);
  const total   = entries.length;
  const locked  = matchups.filter((m) => m.winner !== null).length;
  const pending = matchups.filter((m) => m.winner === null).length;

  const buybackEntries = entries.filter((e) => e.buyback);
  const bb = computeCounts(buybackEntries, teamStatus);
  const bbTotal = buybackEntries.length;

  const mainStats = [
    { label: 'Total Entries', value: total,     pctStr: null,                color: C.text },
    { label: 'Survived',      value: alive,     pctStr: pct(alive, total),   color: C.alive },
    { label: 'Partial',       value: partial,   pctStr: pct(partial, total), color: C.partial },
    { label: 'Uncertain',     value: uncertain, pctStr: pct(uncertain, total), color: C.uncertain },
    { label: 'Eliminated',    value: eliminated,pctStr: pct(eliminated, total), color: C.dead },
    { label: 'Games Final',   value: locked,    pctStr: null,                color: C.won },
    { label: 'Games Pending', value: pending,   pctStr: null,                color: C.textMid },
  ];

  const bbStats = [
    { label: 'BB Total',     value: bbTotal,       pctStr: null,                  color: C.text },
    { label: 'Survived',     value: bb.alive,      pctStr: pct(bb.alive, bbTotal),   color: C.alive },
    { label: 'Partial',      value: bb.partial,    pctStr: pct(bb.partial, bbTotal), color: C.partial },
    { label: 'Uncertain',    value: bb.uncertain,  pctStr: pct(bb.uncertain, bbTotal), color: C.uncertain },
    { label: 'Eliminated',   value: bb.eliminated, pctStr: pct(bb.eliminated, bbTotal), color: C.dead },
  ];

  return (
    <div style={{ padding: '18px 28px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Main row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {mainStats.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </div>

      {/* Buyback row */}
      {bbTotal > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Buybacks Only
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {bbStats.map((s) => (
              <StatTile key={`bb-${s.label}`} {...s} small />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, pctStr, color, small }: {
  label: string; value: number; pctStr: string | null; color: string; small?: boolean;
}) {
  return (
    <div style={{
      flex: '1 1 100px',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: small ? '10px 14px' : '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: small ? 20 : 26, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
        {pctStr && (
          <span style={{ fontSize: small ? 11 : 12, color, opacity: 0.7, fontWeight: 500 }}>
            ({pctStr})
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}
