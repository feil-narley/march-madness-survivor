import { useState } from 'react';
import { C, statusColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, computeTeamStats } from '../lib/derive';

const STATUS_LABEL: Record<string, string> = {
  alive: 'Alive', won: 'Won', dead: 'Eliminated', unknown: '—',
};

// Color for buyback picks — yellow so it contrasts clearly with the blue regular picks
const BB_COLOR = C.partial;

type Filter = 'all' | 'regular' | 'buyback';

interface TeamFrequencyProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
}

export default function TeamFrequency({ entries, matchups, scenario }: TeamFrequencyProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const teamStatus = buildTeamStatusMap(matchups, scenario);

  const regularEntries = entries.filter((e) => !e.buyback);
  const buybackEntries = entries.filter((e) => e.buyback);

  // Stats for whatever is currently selected
  const activeEntries = filter === 'regular' ? regularEntries : filter === 'buyback' ? buybackEntries : entries;
  const stats = computeTeamStats(activeEntries, teamStatus);

  // For "all" mode, also compute per-subset stats for split display
  const regularStats = computeTeamStats(regularEntries, teamStatus);
  const buybackStats = computeTeamStats(buybackEntries, teamStatus);
  const regularMap = new Map(regularStats.map((s) => [s.name, s]));
  const buybackMap = new Map(buybackStats.map((s) => [s.name, s]));

  if (stats.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>No pick data available.</div>;
  }

  const maxCount = stats[0].pickCount;

  const filterButtons: { id: Filter; label: string; count: number }[] = [
    { id: 'all',     label: 'All Entries',  count: entries.length },
    { id: 'regular', label: 'Regular Only', count: regularEntries.length },
    { id: 'buyback', label: 'Buyback Only', count: buybackEntries.length },
  ];

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {filterButtons.map(({ id, label, count }) => {
          const active = filter === id;
          const color = id === 'buyback' ? BB_COLOR : C.accent;
          return (
            <button key={id} onClick={() => setFilter(id)} style={{
              background: active ? `${color}18` : C.surface,
              color: active ? color : C.textMid,
              border: `1px solid ${active ? `${color}50` : C.border}`,
              borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {label}
              <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>{count}</span>
            </button>
          );
        })}
        {filter === 'all' && buybackEntries.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8, fontSize: 11, color: C.textDim }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.accent, display: 'inline-block' }} />
              Regular picks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: BB_COLOR, display: 'inline-block' }} />
              Buyback picks
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Bar chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Pick Frequency</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
              Today's picks · {filter === 'all' ? 'all entries' : filter === 'buyback' ? 'buyback entries only' : 'regular entries only'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.map((t) => {
              const color = statusColor(t.status);
              const reg = regularMap.get(t.name);
              const bb  = buybackMap.get(t.name);

              return (
                <div key={t.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{t.name}</span>
                    {filter === 'all' ? (
                      <span style={{ display: 'flex', gap: 10, fontSize: 11, flexShrink: 0 }}>
                        <span style={{ color: C.accent }}>
                          {reg?.pickCount ?? 0} ({reg?.pickPercent.toFixed(1) ?? '0.0'}%)
                        </span>
                        {bb && bb.pickCount > 0 && (
                          <span style={{ color: BB_COLOR }}>
                            +{bb.pickCount} BB ({bb.pickPercent.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: C.textMid }}>
                        {t.pickCount} picks · {t.pickPercent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {/* Bar */}
                  <div style={{ background: C.bg, borderRadius: 4, height: 7, overflow: 'hidden', display: 'flex' }}>
                    {filter === 'all' ? (
                      <>
                        <div style={{
                          width: `${((reg?.pickCount ?? 0) / maxCount) * 100}%`, height: '100%',
                          background: C.accent, opacity: t.status === 'dead' ? 0.3 : 1,
                          transition: 'width 0.4s ease',
                        }} />
                        {bb && bb.pickCount > 0 && (
                          <div style={{
                            width: `${(bb.pickCount / maxCount) * 100}%`, height: '100%',
                            background: BB_COLOR, opacity: t.status === 'dead' ? 0.3 : 0.85,
                            transition: 'width 0.4s ease',
                          }} />
                        )}
                      </>
                    ) : (
                      <div style={{
                        width: `${(t.pickCount / maxCount) * 100}%`, height: '100%',
                        background: filter === 'buyback' ? BB_COLOR : color,
                        opacity: t.status === 'dead' ? 0.3 : 1,
                        transition: 'width 0.4s ease',
                      }} />
                    )}
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
                {filter === 'all'
                  ? ['#', 'Team', 'Status', 'Regular', 'Buyback'].map((h) => <th key={h} style={TH}>{h}</th>)
                  : ['#', 'Team', 'Status', 'Picks', '%'].map((h) => <th key={h} style={TH}>{h}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {stats.map((t, i) => {
                const color = statusColor(t.status);
                const reg = regularMap.get(t.name);
                const bb  = buybackMap.get(t.name);
                return (
                  <tr key={t.name} style={{
                    borderBottom: `1px solid ${C.bg}`,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    opacity: t.status === 'dead' ? 0.45 : 1,
                  }}>
                    <td style={{ ...TD, color: C.textDim }}>{i + 1}</td>
                    <td style={{ ...TD, color, fontWeight: 600 }}>{t.name}</td>
                    <td style={TD}>
                      <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    {filter === 'all' ? (
                      <>
                        <td style={{ ...TD, color: C.accent, fontWeight: 600 }}>
                          {reg?.pickCount ?? 0}
                          <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim, marginLeft: 4 }}>
                            ({reg?.pickPercent.toFixed(1) ?? '0.0'}%)
                          </span>
                        </td>
                        <td style={{ ...TD, color: BB_COLOR, fontWeight: 600 }}>
                          {bb?.pickCount ?? 0}
                          {(bb?.pickCount ?? 0) > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim, marginLeft: 4 }}>
                              ({bb!.pickPercent.toFixed(1)}%)
                            </span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ ...TD, color: C.text, fontWeight: 600 }}>{t.pickCount}</td>
                        <td style={{ ...TD, color: C.textMid }}>{t.pickPercent.toFixed(1)}%</td>
                      </>
                    )}
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
