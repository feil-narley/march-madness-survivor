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

  const survival = entries.map((e) => ({
    entry: e,
    status: getEntryStatus(e, teamStatus),
    picks: getTodayPicks(e),
  }));

  const filtered = search
    ? survival.filter((s) => s.entry.name.toLowerCase().includes(search.toLowerCase()))
    : survival;

  const total          = survival.length;
  const aliveCount     = survival.filter((s) => s.status === 'alive').length;
  const partialCount   = survival.filter((s) => s.status === 'partial').length;
  const elimCount      = survival.filter((s) => s.status === 'eliminated').length;
  const uncertainCount = survival.filter((s) => s.status === 'uncertain').length;

  function pct(n: number): string {
    if (total === 0) return '0.0%';
    return `${((n / total) * 100).toFixed(1)}%`;
  }

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
              <p style={{ color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
                Make sure the matchups sheet tab exists and is publicly accessible.<br />
                Columns: <code style={{ color: C.textMid }}>Better Seed | Worse Seed | Favorite | Moneyline | Spread | Winner</code>
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 14,
            }}>
              {matchups.map((m) => (
                <MatchupCard
                  key={m.id}
                  matchup={m}
                  selection={scenario[m.id] ?? null}
                  onChange={(winner) => onScenarioChange(m.id, winner)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ position: 'sticky', top: 16 }}>

          {/* Summary */}
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
                  Reset All
                </button>
              )}
            </div>

            {[
              { label: 'Would Survive', value: aliveCount,     color: C.alive,     p: pct(aliveCount) },
              { label: 'Partial',       value: partialCount,   color: C.partial,   p: pct(partialCount) },
              { label: 'Uncertain',     value: uncertainCount, color: C.uncertain, p: pct(uncertainCount) },
              { label: 'Eliminated',    value: elimCount,      color: C.dead,      p: pct(elimCount) },
            ].map((s) => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 12, color: C.textMid }}>{s.label}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: s.color, opacity: 0.7 }}>({s.p})</span>
                </span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: C.textDim }}>
              <span>{locked} games final</span>
              <span>{pending} pending</span>
            </div>

            {hasScenario && (
              <div style={{
                marginTop: 12, background: `${C.accent}10`,
                border: `1px solid ${C.accentBorder}`,
                borderRadius: 5, padding: '7px 10px',
                fontSize: 11, color: C.accent, lineHeight: 1.4,
              }}>
                Scenario mode active — projections reflect your selections.
              </div>
            )}
          </div>

          {/* Entry outcomes */}
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

            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
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
                        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                          {picks.map((p) => {
                            const ts = teamStatus[p] ?? 'unknown';
                            const pc = ts === 'won' ? C.alive : ts === 'dead' ? C.dead : C.textMid;
                            return (
                              <span key={p} style={{
                                fontSize: 10, color: pc,
                                background: `${pc}15`, borderRadius: 3,
                                padding: '1px 6px', border: `1px solid ${pc}30`,
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

/** Format moneyline for display — cap absurdly large lines */
function formatML(ml: string): string {
  if (!ml) return '';
  const n = parseInt(ml, 10);
  if (isNaN(n)) return ml;
  if (Math.abs(n) >= 5000) return n > 0 ? '+∞' : 'LOCK';
  return n > 0 ? `+${n}` : `${n}`;
}

function MatchupCard({ matchup, selection, onChange }: MatchupCardProps) {
  const locked = matchup.winner !== null;
  const effectiveWinner = matchup.winner ?? selection;

  const betterWon  = effectiveWinner === matchup.betterSeed;
  const worseWon   = effectiveWinner === matchup.worseSeed;
  const undecided  = effectiveWinner === null;

  const isFavBetter = !matchup.favorite || matchup.favorite === matchup.betterSeed;

  return (
    <div style={{
      background: C.elevated,
      border: `1px solid ${locked ? C.border : C.borderHi}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* ── Header: favorite info ── */}
      <div style={{
        padding: '10px 14px',
        background: locked ? C.surface : `${C.accent}08`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.textDim,
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            {locked ? '🔒 Final' : '⚡ Pending'}
          </span>
          {locked && matchup.winner && (
            <span style={{ fontSize: 11, fontWeight: 600, color: C.alive }}>
              {matchup.winner} wins
            </span>
          )}
        </div>

        {/* Favorite line */}
        {matchup.favorite && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: C.textMid }}>Fav:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>
              {matchup.favorite}
            </span>
            {matchup.moneyline && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isFavBetter ? C.alive : C.uncertain,
                background: isFavBetter ? `${C.alive}15` : `${C.uncertain}15`,
                borderRadius: 4, padding: '1px 7px',
              }}>
                {formatML(matchup.moneyline)}
              </span>
            )}
            {matchup.spread && (
              <span style={{
                fontSize: 11, color: C.textMid,
                background: `${C.text}08`,
                borderRadius: 4, padding: '1px 7px',
              }}>
                {matchup.spread}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Three-tile selector ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, padding: 12 }}>

        {/* Better Seed (left) */}
        <SeedTile
          label={matchup.betterSeed}
          selected={betterWon}
          isLoser={worseWon}
          locked={locked}
          onClick={() => onChange(betterWon ? null : matchup.betterSeed)}
        />

        {/* Undecided (center) */}
        <button
          onClick={() => onChange(null)}
          disabled={locked}
          style={{
            width: 72,
            background: undecided && !locked ? `${C.uncertain}14` : 'transparent',
            border: `2px solid ${undecided && !locked ? C.uncertain : C.border}`,
            borderRadius: 8,
            color: undecided && !locked ? C.uncertain : C.textDim,
            fontSize: 10,
            fontWeight: undecided && !locked ? 700 : 400,
            cursor: locked ? 'default' : 'pointer',
            padding: '8px 4px',
            textAlign: 'center',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
            lineHeight: 1.4,
          }}
        >
          {locked ? '—' : 'Undet.'}
        </button>

        {/* Worse Seed (right) */}
        <SeedTile
          label={matchup.worseSeed}
          selected={worseWon}
          isLoser={betterWon}
          locked={locked}
          onClick={() => onChange(worseWon ? null : matchup.worseSeed)}
        />
      </div>
    </div>
  );
}

interface SeedTileProps {
  label: string;
  selected: boolean;
  isLoser: boolean;
  locked: boolean;
  onClick: () => void;
}

function SeedTile({ label, selected, isLoser, locked, onClick }: SeedTileProps) {
  return (
    <button
      disabled={locked}
      onClick={onClick}
      style={{
        padding: '12px 8px',
        background: selected ? C.aliveDim : isLoser ? C.deadDim : `${C.text}04`,
        border: `2px solid ${selected ? C.alive : isLoser ? `${C.dead}40` : C.border}`,
        borderRadius: 8,
        color: selected ? C.alive : isLoser ? C.dead : C.text,
        cursor: locked ? 'default' : 'pointer',
        textAlign: 'center',
        opacity: isLoser ? 0.45 : 1,
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minHeight: 70,
        width: '100%',
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 700,
        textDecoration: isLoser ? 'line-through' : 'none',
        lineHeight: 1.2,
      }}>
        {label || '—'}
      </span>
      {selected && <span style={{ fontSize: 14, marginTop: 2 }}>🏆</span>}
    </button>
  );
}
