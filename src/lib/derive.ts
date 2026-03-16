import type {
  Entry,
  Matchup,
  ScenarioSelections,
  TeamStats,
  TeamStatus,
  EntryStatus,
} from './types';

/** Determine a team's status given completed matchups and current scenario. */
export function getTeamStatus(
  team: string,
  matchups: Matchup[],
  scenario: ScenarioSelections = {}
): TeamStatus {
  if (!team) return 'unknown';

  let appearedInAny = false;

  for (const m of matchups) {
    if (m.team1 !== team && m.team2 !== team) continue;
    appearedInAny = true;

    // Locked result takes precedence
    const result = m.winner ?? scenario[m.id] ?? null;
    if (result) {
      if (result !== m.team1 && result !== m.team2) continue; // bad data
      return result === team ? 'won' : 'dead';
    }
  }

  return appearedInAny ? 'alive' : 'unknown';
}

/** Build a status map for every team that appears in any matchup. */
export function buildTeamStatusMap(
  matchups: Matchup[],
  scenario: ScenarioSelections = {}
): Record<string, TeamStatus> {
  const teams = new Set<string>();
  matchups.forEach((m) => {
    if (m.team1) teams.add(m.team1);
    if (m.team2) teams.add(m.team2);
  });

  const map: Record<string, TeamStatus> = {};
  teams.forEach((t) => {
    map[t] = getTeamStatus(t, matchups, scenario);
  });
  return map;
}

/** Return the picks for "today" (day 2 = pick3 + pick4, plus buy-back extras). */
export function getTodayPicks(entry: Entry): string[] {
  const picks = [entry.pick3, entry.pick4];
  if (entry.buyback) picks.push(entry.pick5, entry.pick6, entry.pick7);
  return picks.filter(Boolean);
}

/** Determine whether an entry survives given a team status map. */
export function getEntryStatus(
  entry: Entry,
  teamStatus: Record<string, TeamStatus>
): EntryStatus {
  const picks = getTodayPicks(entry);
  if (picks.length === 0) return 'uncertain';

  let anyUncertain = false;
  for (const pick of picks) {
    const s = teamStatus[pick] ?? 'alive';
    if (s === 'dead') return 'eliminated';
    if (s === 'alive' || s === 'unknown') anyUncertain = true;
  }
  return anyUncertain ? 'uncertain' : 'alive';
}

/** Compute per-team pick statistics for today's picks. */
export function computeTeamStats(
  entries: Entry[],
  teamStatus: Record<string, TeamStatus>
): TeamStats[] {
  const counts: Record<string, number> = {};
  const total = entries.length;

  entries.forEach((e) => {
    getTodayPicks(e).forEach((pick) => {
      counts[pick] = (counts[pick] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([name, pickCount]) => ({
      name,
      status: teamStatus[name] ?? 'alive',
      pickCount,
      pickPercent: (pickCount / total) * 100,
    }))
    .sort((a, b) => b.pickCount - a.pickCount);
}

/** Compute how often each pair of teams is picked together (today's picks only). */
export function computePairingMatrix(
  entries: Entry[]
): Record<string, Record<string, number>> {
  const pairs: Record<string, Record<string, number>> = {};

  entries.forEach((e) => {
    const picks = getTodayPicks(e);
    // All unique pairs
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        const a = picks[i];
        const b = picks[j];
        if (!a || !b || a === b) continue;
        if (!pairs[a]) pairs[a] = {};
        if (!pairs[b]) pairs[b] = {};
        pairs[a][b] = (pairs[a][b] || 0) + 1;
        pairs[b][a] = (pairs[b][a] || 0) + 1;
      }
    }
  });

  return pairs;
}

/** Summary counts: how many teams are alive / have won / are dead. */
export function computeTeamSummary(teamStatus: Record<string, TeamStatus>) {
  const counts = { alive: 0, won: 0, dead: 0, unknown: 0 };
  Object.values(teamStatus).forEach((s) => counts[s]++);
  return counts;
}
