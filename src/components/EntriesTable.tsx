import { useState } from 'react';
import { C, statusColor, entryColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections, TeamStatus } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus, getTodayPicks } from '../lib/derive';

function TeamChip({ team, status }: { team: string; status: TeamStatus }) {
  if (!team) return <span style={{ color: C.textDim, fontSize: 11 }}>—</span>;
  const color = statusColor(status);
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {team}
    </span>
  );
}

interface EntriesTableProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function EntriesTable({ entries, matchups, scenario }: EntriesTableProps) {
  const [filter, setFilter] = useState<'all' | 'alive' | 'partial' | 'uncertain' | 'eliminated'>('all');
  const [search, setSearch] = useState('');

  const teamStatus = buildTeamStatusMap(matchups, scenario);

  const enriched = entries.map((e) => ({
    entry: e,
    status: getEntryStatus(e, teamStatus),
    todayPicks: getTodayPicks(e),
  }));

  const filtered = enriched.filter((e) => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (search && !e.entry.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pickCols: { label: string; key: keyof Entry; today?: boolean }[] = [
    { label: 'Pick 1', key: 'pick1', today: true },
    { label: 'Pick 2', key: 'pick2', today: true },
    { label: 'Pick 3', key: 'pick3', today: true },
    { label: 'Pick 4', key: 'pick4', today: true },
    { label: 'Pick 5', key: 'pick5', today: true },
    { label: 'Pick 6', key: 'pick6', today: true },
    { label: 'Pick 7', key: 'pick7', today: true },
  ];

  const activeCols = pickCols.filter((c) => entries.some((e) => !!(e[c.key] as string)));

  const filterCounts = {
    all:       enriched.length,
    alive:     enriched.filter(e => e.status === 'alive').length,
    partial:   enriched.filter(e => e.status === 'partial').length,
    uncertain: enriched.filter(e => e.status === 'uncertain').length,
    eliminated:enriched.filter(e => e.status === 'eliminated').length,
  };

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: '8px 12px', fontSize: 13, width: 210,
          }}
        />
        {(['all', 'alive', 'partial', 'uncertain', 'eliminated'] as const).map((f) => {
          const active = filter === f;
          const color = { all: C.accent, alive: C.alive, partial: C.partial, uncertain: C.uncertain, eliminated: C.dead }[f];
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: active ? `${color}18` : C.surface,
              color: active ? color : C.textMid,
              border: `1px solid ${active ? `${color}50` : C.border}`,
              borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {f === 'all' ? 'All' : f}
              <span style={{ marginLeft: 6, opacity: 0.7, fontWeight: 400 }}>
                {filterCounts[f]}
              </span>
            </button>
          );
        })}
        <span style={{ color: C.textDim, fontSize: 12, marginLeft: 'auto' }}>
          {filtered.length} of {entries.length} entries
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
              <th style={TH}>Name</th>
              <th style={TH}>Status</th>
              {activeCols.map((c) => (
                <th key={c.key} style={{ ...TH, color: c.today ? C.accent : C.textDim }}>
                  {c.label}
                  {c.today && (
                    <span style={{
                      marginLeft: 5, fontSize: 9, fontWeight: 700,
                      color: C.accent, opacity: 0.7, letterSpacing: '0.05em',
                    }}>
                      TODAY
                    </span>
                  )}
                </th>
              ))}
              <th style={TH}>Buyback</th>
              <th style={TH}>Picks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ entry: e, status }, idx) => {
              const ec = entryColor(status);
              return (
                <tr key={`${e.name}-${idx}`} style={{
                  borderLeft: `3px solid ${ec}`,
                  borderBottom: `1px solid ${C.bg}`,
                  background: idx % 2 === 0 ? `${ec}06` : 'transparent',
                }}>
                  <td style={{ ...TD, fontWeight: 500, color: C.text }}>{e.name}</td>
                  <td style={TD}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: ec,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {status}
                    </span>
                  </td>
                  {activeCols.map((c) => {
                    const pick = e[c.key] as string;
                    return (
                      <td key={c.key} style={TD}>
                        <TeamChip team={pick} status={pick ? (teamStatus[pick] ?? 'unknown') : 'unknown'} />
                      </td>
                    );
                  })}
                  <td style={{ ...TD, color: e.buyback ? C.accent : C.textDim }}>{e.buyback ? '✓' : '—'}</td>
                  <td style={TD}>
                    {e.inconsistentPicks && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: C.uncertain, background: `${C.uncertain}15`,
                        border: `1px solid ${C.uncertain}40`,
                        borderRadius: 4, padding: '2px 7px',
                        whiteSpace: 'nowrap',
                      }}>
                        ⚠ Pick mismatch
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>
            No entries match your filters.
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
        {[['alive', C.alive], ['won', C.won], ['dead', C.dead], ['unknown', C.textDim]].map(([s, color]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textMid }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ textTransform: 'capitalize' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 10,
  fontWeight: 700, color: '#5b7498',
  textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap',
};

const TD: React.CSSProperties = { padding: '9px 14px', whiteSpace: 'nowrap' };
