import { useState } from 'react';
import type { Entry, Matchup, ScenarioSelections, TeamStatus } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus, getTodayPicks } from '../lib/derive';

const STATUS_COLOR: Record<string, string> = {
  alive: '#22c55e',
  won: '#3b82f6',
  dead: '#ef4444',
  unknown: '#64748b',
};

const STATUS_BG: Record<string, string> = {
  alive: 'rgba(34,197,94,0.12)',
  won: 'rgba(59,130,246,0.12)',
  dead: 'rgba(239,68,68,0.12)',
  unknown: 'rgba(100,116,139,0.12)',
};

const ENTRY_BG: Record<string, string> = {
  alive: 'rgba(34,197,94,0.06)',
  eliminated: 'rgba(239,68,68,0.06)',
  uncertain: 'rgba(245,158,11,0.06)',
};

const ENTRY_BORDER: Record<string, string> = {
  alive: '#22c55e',
  eliminated: '#ef4444',
  uncertain: '#f59e0b',
};

function TeamBadge({ team, status }: { team: string; status: TeamStatus }) {
  if (!team) return <span style={{ color: '#475569', fontSize: 12 }}>—</span>;
  return (
    <span
      style={{
        display: 'inline-block',
        background: STATUS_BG[status] ?? STATUS_BG.unknown,
        color: STATUS_COLOR[status] ?? STATUS_COLOR.unknown,
        border: `1px solid ${STATUS_COLOR[status] ?? STATUS_COLOR.unknown}`,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
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
  const [filter, setFilter] = useState<'all' | 'alive' | 'eliminated' | 'uncertain'>('all');
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

  const pickCols: { label: string; key: keyof Entry }[] = [
    { label: 'Pick 1', key: 'pick1' },
    { label: 'Pick 2', key: 'pick2' },
    { label: 'Pick 3', key: 'pick3' },
    { label: 'Pick 4', key: 'pick4' },
    { label: 'Pick 5', key: 'pick5' },
    { label: 'Pick 6', key: 'pick6' },
    { label: 'Pick 7', key: 'pick7' },
  ];

  // Only show pick columns that have any data
  const activeCols = pickCols.filter((c) =>
    entries.some((e) => !!e[c.key])
  );

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#f1f5f9',
            padding: '8px 12px',
            fontSize: 13,
            width: 220,
          }}
        />
        {(['all', 'alive', 'uncertain', 'eliminated'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#f97316' : '#1e293b',
              color: filter === f ? '#fff' : '#94a3b8',
              border: '1px solid',
              borderColor: filter === f ? '#f97316' : '#334155',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? `All (${entries.length})` : f}
          </button>
        ))}
        <span style={{ color: '#64748b', fontSize: 12, marginLeft: 'auto' }}>
          Showing {filtered.length} of {entries.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Status</th>
              {activeCols.map((c) => (
                <th key={c.key} style={{ ...thStyle, color: ['pick3', 'pick4', 'pick5', 'pick6', 'pick7'].includes(c.key) ? '#f97316' : '#94a3b8' }}>
                  {c.label}
                  {['pick3', 'pick4', 'pick5', 'pick6', 'pick7'].includes(c.key) && (
                    <span style={{ fontSize: 9, marginLeft: 4, color: '#f97316' }}>TODAY</span>
                  )}
                </th>
              ))}
              <th style={thStyle}>Paid</th>
              <th style={thStyle}>Buyback</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ entry: e, status }, idx) => (
              <tr
                key={`${e.name}-${idx}`}
                style={{
                  background: idx % 2 === 0
                    ? ENTRY_BG[status]
                    : 'transparent',
                  borderLeft: `3px solid ${ENTRY_BORDER[status]}`,
                  borderBottom: '1px solid #1e293b',
                  transition: 'background 0.15s',
                }}
              >
                <td style={tdStyle}>{e.name}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      color: ENTRY_BORDER[status],
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {status}
                  </span>
                </td>
                {activeCols.map((c) => {
                  const pick = e[c.key] as string;
                  const ts = pick ? (teamStatus[pick] ?? 'unknown') : 'unknown';
                  return (
                    <td key={c.key} style={{ ...tdStyle }}>
                      <TeamBadge team={pick} status={ts} />
                    </td>
                  );
                })}
                <td style={{ ...tdStyle, color: e.paid ? '#22c55e' : '#ef4444' }}>
                  {e.paid ? '✓' : '✗'}
                </td>
                <td style={{ ...tdStyle, color: e.buyback ? '#f97316' : '#475569' }}>
                  {e.buyback ? '✓' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
            No entries match your filters.
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([s, color]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ textTransform: 'capitalize' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '9px 14px',
  whiteSpace: 'nowrap',
};
