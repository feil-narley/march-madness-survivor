import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus } from '../lib/derive';

const ENTRY_COLOR: Record<string, string> = {
  alive: '#22c55e',
  eliminated: '#ef4444',
  uncertain: '#f59e0b',
};

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
  const teamStatus = buildTeamStatusMap(matchups, scenario);

  const pendingMatchups = matchups.filter((m) => m.winner === null);
  const lockedMatchups = matchups.filter((m) => m.winner !== null);

  // Group matchups by round
  const rounds: Record<string, Matchup[]> = {};
  matchups.forEach((m) => {
    const r = m.round || 'Matchups';
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(m);
  });

  // Entry survival summary under current scenario
  const survival = entries.map((e) => ({
    entry: e,
    status: getEntryStatus(e, teamStatus),
  }));

  const aliveCount = survival.filter((s) => s.status === 'alive').length;
  const elimCount = survival.filter((s) => s.status === 'eliminated').length;
  const uncertainCount = survival.filter((s) => s.status === 'uncertain').length;

  const hasScenario = Object.values(scenario).some((v) => v !== null);

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Left: matchup cards */}
        <div>
          {Object.entries(rounds).map(([round, rMatchups]) => (
            <div key={round} style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {round}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
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
          ))}

          {matchups.length === 0 && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                No matchups found. Add a <strong style={{ color: '#f97316' }}>Matchups</strong> tab to your Google Sheet.
              </p>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
                Expected columns: Round | Team 1 | Team 2 | Winner (blank = pending)
              </p>
            </div>
          )}
        </div>

        {/* Right: results panel */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                Scenario Results
              </h3>
              {hasScenario && (
                <button
                  onClick={onReset}
                  style={{
                    background: 'none',
                    border: '1px solid #475569',
                    borderRadius: 5,
                    color: '#94a3b8',
                    padding: '5px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Would Survive', value: aliveCount, color: '#22c55e' },
                { label: 'Uncertain', value: uncertainCount, color: '#f59e0b' },
                { label: 'Eliminated', value: elimCount, color: '#ef4444' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>{lockedMatchups.length} games final</span>
              <span>{pendingMatchups.length} pending</span>
            </div>

            {hasScenario && (
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#f97316' }}>
                Scenario mode active — results reflect your selections above.
              </div>
            )}
          </div>

          {/* Scrollable entry list */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
              Entry Outcomes
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {survival.map(({ entry, status }) => (
                <div
                  key={entry.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #0f172a',
                    borderLeft: `3px solid ${ENTRY_COLOR[status]}`,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#f1f5f9' }}>{entry.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ENTRY_COLOR[status], textTransform: 'capitalize' }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MatchupCardProps {
  matchup: Matchup;
  selection: string | null;
  onChange: (winner: string | null) => void;
}

function MatchupCard({ matchup, selection, onChange }: MatchupCardProps) {
  const locked = matchup.winner !== null;
  const effectiveWinner = matchup.winner ?? selection;

  return (
    <div
      style={{
        background: '#0f172a',
        border: `1px solid ${locked ? '#334155' : '#1e3a5f'}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          background: locked ? '#1e293b' : 'rgba(59,130,246,0.1)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
          {matchup.round || 'Matchup'}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 10,
            background: locked ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
            color: locked ? '#22c55e' : '#3b82f6',
          }}
        >
          {locked ? '🔒 FINAL' : '⚡ LIVE'}
        </span>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', gap: 1, padding: 12 }}>
        {[matchup.team1, matchup.team2].map((team) => {
          const isWinner = effectiveWinner === team;
          const isLoser = effectiveWinner !== null && effectiveWinner !== team;
          return (
            <button
              key={team}
              disabled={locked}
              onClick={() => {
                // If already selected, deselect (toggle off)
                onChange(selection === team ? null : team);
              }}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: isWinner
                  ? 'rgba(34,197,94,0.15)'
                  : isLoser
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: `2px solid ${
                  isWinner ? '#22c55e' : isLoser ? 'rgba(239,68,68,0.3)' : '#334155'
                }`,
                borderRadius: 6,
                color: isWinner ? '#22c55e' : isLoser ? '#475569' : '#f1f5f9',
                fontSize: 13,
                fontWeight: isWinner ? 700 : 500,
                cursor: locked ? 'default' : 'pointer',
                textDecoration: isLoser ? 'line-through' : 'none',
                textAlign: 'center',
                transition: 'all 0.15s',
                opacity: isLoser ? 0.5 : 1,
              }}
            >
              {team}
              {isWinner && <div style={{ fontSize: 16, marginTop: 4 }}>🏆</div>}
            </button>
          );
        })}
      </div>

      {/* Undecided option (only for unlocked) */}
      {!locked && (
        <button
          onClick={() => onChange(null)}
          style={{
            display: 'block',
            width: 'calc(100% - 24px)',
            margin: '0 12px 12px',
            padding: '7px',
            background: selection === null ? 'rgba(100,116,139,0.2)' : 'transparent',
            border: `1px solid ${selection === null ? '#64748b' : '#334155'}`,
            borderRadius: 5,
            color: '#64748b',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: selection === null ? 600 : 400,
          }}
        >
          Undecided
        </button>
      )}
    </div>
  );
}
