import { C } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus } from '../lib/derive';

interface TomorrowPicksProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
  tomorrowTeams: string[];
}

export default function TomorrowPicks({
  entries,
  matchups,
  scenario,
  tomorrowTeams,
}: TomorrowPicksProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);

  // Surviving entries = those NOT eliminated today
  const survivingEntries = entries.filter(
    (e) => getEntryStatus(e, teamStatus) !== 'eliminated'
  );
  const survivingCount = survivingEntries.length;

  if (tomorrowTeams.length === 0) {
    return (
      <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ color: C.textMid, margin: 0, fontWeight: 600 }}>No tomorrow matchups loaded</p>
          <p style={{ color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
            Make sure the <code style={{ color: C.textMid }}>matchups - day 3</code> sheet tab exists and is publicly accessible.
          </p>
        </div>
      </div>
    );
  }

  // All picks used by each surviving entry (pick1 through pick7)
  const allPickFields: (keyof Entry)[] = ['pick1','pick2','pick3','pick4','pick5','pick6','pick7'];

  // For each tomorrow team, count surviving entries that have ALREADY used it
  const rows = tomorrowTeams.map((team) => {
    const usedCount = survivingEntries.filter((e) =>
      allPickFields.some((f) => {
        const v = e[f] as string;
        return v && v !== '-' && v === team;
      })
    ).length;

    const available = survivingCount - usedCount;
    return { team, usedCount, available };
  }).sort((a, b) => b.available - a.available);

  const maxAvailable = rows.reduce((m, r) => Math.max(m, r.available), 0);

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Available Picks for Tomorrow</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            {survivingCount} entries surviving · bar shows how many can still pick each team (total surviving minus those who already picked them)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(({ team, usedCount, available }) => {
            const barPct = maxAvailable > 0 ? (available / maxAvailable) * 100 : 0;
            return (
              <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Team name */}
                <div style={{ width: 160, minWidth: 160, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>
                  {team}
                </div>

                {/* Bar */}
                <div style={{ flex: 1, background: C.bg, borderRadius: 4, height: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: `${barPct}%`, height: '100%',
                    background: C.alive, borderRadius: 4,
                    transition: 'width 0.3s',
                  }} />
                </div>

                {/* Available count */}
                <div style={{ width: 36, textAlign: 'right', fontSize: 13, fontWeight: 700, color: C.alive }}>
                  {available}
                </div>

                {/* Used count */}
                <div style={{ width: 60, fontSize: 11, color: C.textDim, whiteSpace: 'nowrap' }}>
                  ({usedCount} used)
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
          "Used" = surviving entries that picked this team in any prior round · "Available" = surviving entries who have not yet used this team
        </div>
      </div>
    </div>
  );
}
