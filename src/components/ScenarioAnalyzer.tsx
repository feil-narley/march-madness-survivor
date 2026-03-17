import { useState } from 'react';
import { C, entryColor } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus, getTodayPicks } from '../lib/derive';

interface ScenarioAnalyzerProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
  onScenarioChange: (id: string, winner: string | null) => void;
  onReset: () => void;
}

export default function ScenarioAnalyzer({
  entries,
  matchups,
  scenario,
  onScenarioChange,
  onReset,
}: ScenarioAnalyzerProps) {
  const [search, setSearch] = useState('');

  const teamStatus = buildTeamStatusMap(matchups, scenario);

  // Group matchups by round
  const rounds: Record<string, Matchup[]> = {};
  matchups.forEach((m) => {
    const r = m.round || 'Today\'s Matchups';
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(m);
  });

  const survival = entries.map((e) => ({
    entry: e,
    status: getEntryStatus(e, teamStatus),
    picks: getTodayPicks(e),
  }));

  const filtered = search
    ? survival.filter((s) => s.entry.name.toLowerCase().includes(search.toLowerCase()))
    : survival;

  const aliveCount    = survival.filter((s) => s.status === 'alive').length;
  const elimCount     = survival.filter((s) => s.status === 'eliminated').length;
  const uncertainCount= survival.filter((s) => s.status === 'uncertain').length;

  const hasScenario = Object.values(scenario).some((v) => v !== null);
  const locked  = matchups.filter((m) => m.winner !== null).length;
  const pending = matchups.filter((m) => m.winner === null).length;

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── Left: matchup cards ── */}
        <div>
          {matchups.length === 0 ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 40, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <p style={{ color: C.textMid, margin: 0, fontWeight: 600 }}>No matchups loaded</p>
              <p style={{ color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                Add a <strong style={{ color: C.accent }}>Matchups</strong> tab to your Google Sheet.<br />
                Columns: <code style={{ color: C.textMid }}>Round | Team 1 | Team 2 | Winner</code>
              </p>
            </div>
          ) : (
            Object.entries(rounds).map(([round, rMatchups]) => (
              <div key={round} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: C.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {round}
                  </span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {rMatchups.filter(m => m.winner).length}/{rMatchups.length} final
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 12,
                }}>
                  {rMatchups.map((m) => (
                    <MatchupCard
                      key={m.id}
                      matchup={m}
                      selection={scenario[m.id] ?? null}
                      onChange={(winner) => onScenarioChange(m.id, winner)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ position: 'sticky', top: 16 }}>

          {/* Summary card */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 18, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Scenario Results</span>
              {hasScenario && (
                <button onClick={onReset} style={{
                  background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 5, color: C.textMid, padding: '4px 10px',
                  fontSize: 11, cursor: 'pointer',
                }}>
                  Reset
                </button>
              )}
            </div>

            {[
              { label: 'Would Survive', value: aliveCount,     color: C.alive },
              { label: 'Uncertain',     value: uncertainCount, color: C.uncertain },
              { label: 'Eliminated',    value: elimCount,      color: C.dead },
            ].map((s) => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 12, color: C.textMid }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: C.textDim }}>
              <span>{locked} final</span>
              <span>{pending} pending</span>
            </div>

            {hasScenario && (
              <div style={{
                marginTop: 12, background: `${C.accent}10`,
                border: `1px solid ${C.accentBorder}`,
                borderRadius: 5, padding: '7px 10px',
                fontSize: 11, color: C.accent, lineHeight: 1.4,
              }}>
                Scenario mode active — projections reflect your picks above.
              </div>
            )}
          </div>

          {/* Entry outcomes with search */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                Entry Outcomes
              </div>
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', background: C.elevated,
                  border: `1px solid ${C.border}`, borderRadius: 5,
                  color: C.text, padding: '7px 10px', fontSize: 12,
                }}
              />
            </div>

            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: C.textDim, fontSize: 12 }}>
                  No entries match "{search}"
                </div>
              ) : (
                filtered.map(({ entry, status, picks }) => {
                  const ec = entryColor(status);
                  return (
                    <div key={entry.name} style={{
                      padding: '9px 14px',
                      borderBottom: `1px solid ${C.bg}`,
                      borderLeft: `3px solid ${ec}`,
                      background: `${ec}06`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{entry.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: ec,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {status}
                        </span>
                      </div>
                      {picks.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {picks.map((p) => {
                            const ts = teamStatus[p] ?? 'unknown';
                            const pc = ts === 'won' ? C.alive : ts === 'dead' ? C.dead : C.textMid;
                            return (
                              <span key={p} style={{
                                fontSize: 10, color: pc,
                                background: `${pc}15`, borderRadius: 3,
                                padding: '1px 6px',
                              }}>
                                {p}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Matchup Card ─────────────────────────────────────────── */

interface MatchupCardProps {
  matchup: Matchup;
  selection: string | null;
  onChange: (winner: string | null) => void;
}

function MatchupCard({ matchup, selection, onChange }: MatchupCardProps) {
  const locked = matchup.winner !== null;
  const effectiveWinner = matchup.winner ?? selection;

  const team1Won = effectiveWinner === matchup.team1;
  const team2Won = effectiveWinner === matchup.team2;

  return (
    <div style={{
      background: C.elevated,
      border: `1px solid ${locked ? C.border : C.borderHi}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px',
        background: locked ? C.surface : `${C.accent}08`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {matchup.round || 'Matchup'}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 10,
          background: locked ? `${C.alive}18` : `${C.accent}18`,
          color: locked ? C.alive : C.accent,
        }}>
          {locked ? '🔒 Final' : '⚡ Pending'}
        </span>
      </div>

      {/* Team buttons in VS layout */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
          {/* Team 1 */}
          <TeamBtn
            team={matchup.team1}
            isWinner={team1Won}
            isLoser={team2Won}
            locked={locked}
            onClick={() => onChange(selection === matchup.team1 ? null : matchup.team1)}
          />

          {/* VS divider */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.textDim,
            textAlign: 'center', userSelect: 'none',
          }}>
            VS
          </div>

          {/* Team 2 */}
          <TeamBtn
            team={matchup.team2}
            isWinner={team2Won}
            isLoser={team1Won}
            locked={locked}
            onClick={() => onChange(selection === matchup.team2 ? null : matchup.team2)}
          />
        </div>

        {/* Undecided button */}
        {!locked && (
          <button
            onClick={() => onChange(null)}
            style={{
              display: 'block', width: '100%', marginTop: 8,
              padding: '6px',
              background: selection === null ? `${C.textDim}18` : 'transparent',
              border: `1px solid ${selection === null ? C.textMid : C.border}`,
              borderRadius: 5, color: selection === null ? C.textMid : C.textDim,
              fontSize: 11, cursor: 'pointer', fontWeight: selection === null ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            Undecided
          </button>
        )}
      </div>
    </div>
  );
}

function TeamBtn({
  team, isWinner, isLoser, locked, onClick,
}: {
  team: string; isWinner: boolean; isLoser: boolean; locked: boolean; onClick: () => void;
}) {
  return (
    <button
      disabled={locked}
      onClick={onClick}
      style={{
        padding: '12px 8px',
        background: isWinner ? `${C.alive}18` : isLoser ? `${C.dead}08` : `${C.text}06`,
        border: `2px solid ${isWinner ? C.alive : isLoser ? `${C.dead}30` : C.border}`,
        borderRadius: 7,
        color: isWinner ? C.alive : isLoser ? C.textDim : C.text,
        fontSize: 13,
        fontWeight: isWinner ? 700 : 500,
        cursor: locked ? 'default' : 'pointer',
        textAlign: 'center',
        textDecoration: isLoser ? 'line-through' : 'none',
        opacity: isLoser ? 0.45 : 1,
        transition: 'all 0.15s',
        lineHeight: 1.3,
        width: '100%',
        minHeight: 58,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{team || '—'}</span>
      {isWinner && <span style={{ fontSize: 14 }}>🏆</span>}
    </button>
  );
}
