import { C } from '../lib/theme';
import type { Entry, Matchup, ScenarioSelections } from '../lib/types';
import { buildTeamStatusMap, getEntryStatus } from '../lib/derive';

interface TomorrowPicksProps {
  entries: Entry[];
  matchups: Matchup[];
  scenario: ScenarioSelections;
  tomorrowTeams: string[];
  tomorrowMatchups: Matchup[];
  dayAfterTeams: string[];
  dayAfterMatchups: Matchup[];
}

// All pick fields across every day — used to determine which teams have already been picked
const ALL_PICK_FIELDS: (keyof Entry)[] = [
  'pick1','pick2','pick3','pick4','pick5','pick6','pick7',
  'pick8','pick9','pick10','pick11','pick12','pick13',
];

/** Returns the spread label for a team: (-X.X) if favorite, (+X.X) if underdog, '' if no data. */
function spreadLabel(team: string, matchups: Matchup[]): string {
  const m = matchups.find((mu) => mu.betterSeed === team || mu.worseSeed === team);
  if (!m || !m.spread) return '';
  const raw = m.spread.trim().replace(/^[+-]/, '');
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return '';
  return m.favorite === team ? `(-${n})` : `(+${n})`;
}

function numericSpread(team: string, matchups: Matchup[]): number {
  const m = matchups.find((mu) => mu.betterSeed === team || mu.worseSeed === team);
  if (!m || !m.spread) return 0;
  const n = parseFloat(m.spread.replace(/^[+-]/, ''));
  if (isNaN(n)) return 0;
  return m.favorite === team ? -n : n;
}

interface TeamSectionProps {
  title: string;
  subtitle: string;
  teams: string[];
  sectionMatchups: Matchup[];
  survivingEntries: Entry[];
  survivingCount: number;
  accentColor: string;
}

function TeamSection({ title, subtitle, teams, sectionMatchups, survivingEntries, survivingCount, accentColor }: TeamSectionProps) {
  if (teams.length === 0) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <p style={{ color: C.textDim, fontSize: 12, margin: 0 }}>
          No matchup data yet — will populate once the sheet is filled in.
        </p>
      </div>
    );
  }

  const rows = teams.map((team) => {
    const usedCount = survivingEntries.filter((e) =>
      ALL_PICK_FIELDS.some((f) => {
        const v = e[f] as string;
        return v && v !== '-' && v.toUpperCase() !== 'NOT LISTED' && v === team;
      })
    ).length;
    return { team, usedCount, available: survivingCount - usedCount };
  }).sort((a, b) => numericSpread(a.team, sectionMatchups) - numericSpread(b.team, sectionMatchups));

  const maxAvailable = rows.reduce((m, r) => Math.max(m, r.available), 0);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{subtitle}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(({ team, usedCount, available }) => {
          const barPct = maxAvailable > 0 ? (available / maxAvailable) * 100 : 0;
          const label  = spreadLabel(team, sectionMatchups);
          return (
            <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Team name + spread */}
              <div style={{ width: 200, minWidth: 200, display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{team}</span>
                {label && (
                  <span style={{ fontSize: 11, color: C.textDim, fontWeight: 400 }}>{label}</span>
                )}
              </div>

              {/* Bar */}
              <div style={{ flex: 1, background: C.bg, borderRadius: 4, height: 20, overflow: 'hidden' }}>
                <div style={{
                  width: `${barPct}%`, height: '100%',
                  background: accentColor, borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>

              {/* Available */}
              <div style={{ width: 36, textAlign: 'right', fontSize: 13, fontWeight: 700, color: accentColor }}>
                {available}
              </div>

              {/* Used */}
              <div style={{ width: 60, fontSize: 11, color: C.textDim, whiteSpace: 'nowrap' }}>
                ({usedCount} used)
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: C.textDim }}>
        "Used" = surviving entries that already picked this team · "Available" = those who have not
      </div>
    </div>
  );
}

export default function TomorrowPicks({
  entries,
  matchups,
  scenario,
  tomorrowTeams,
  tomorrowMatchups,
  dayAfterTeams,
  dayAfterMatchups,
}: TomorrowPicksProps) {
  const teamStatus = buildTeamStatusMap(matchups, scenario);

  // Only count entries that have definitively survived (status 'alive')
  const survivingEntries = entries.filter(
    (e) => getEntryStatus(e, teamStatus) === 'alive'
  );
  const survivingCount = survivingEntries.length;

  return (
    <div style={{ padding: '0 28px 28px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TeamSection
        title="Available Picks for Tomorrow"
        subtitle={`${survivingCount} entries surviving · sorted biggest favorite → biggest underdog`}
        teams={tomorrowTeams}
        sectionMatchups={tomorrowMatchups}
        survivingEntries={survivingEntries}
        survivingCount={survivingCount}
        accentColor={C.alive}
      />
      <TeamSection
        title="Available Picks for Day After Tomorrow"
        subtitle={`${survivingCount} entries surviving · will populate as matchup data is entered`}
        teams={dayAfterTeams}
        sectionMatchups={dayAfterMatchups}
        survivingEntries={survivingEntries}
        survivingCount={survivingCount}
        accentColor={C.won}
      />
    </div>
  );
}
