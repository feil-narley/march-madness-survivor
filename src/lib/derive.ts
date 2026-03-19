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
    if (m.betterSeed !== team && m.worseSeed !== team) continue;
    appearedInAny = true;

    const result = m.winner ?? scenario[m.id] ?? null;
    if (result) {
      if (result !== m.betterSeed && result !== m.worseSeed) continue;
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
    if (m.betterSeed) teams.add(m.betterSeed);
    if (m.worseSeed)  teams.add(m.worseSeed);
  });

  const map: Record<string, TeamStatus> = {};
  teams.forEach((t) => { map[t] = getTeamStatus(t, matchups, scenario); });
  return map;
}

/**
 * Return today's picks for an entry.
 * Day 1 sheets only have pick1/pick2; later days add pick3+.
 * We return all non-empty picks so this works for any day.
 */
export function getTodayPicks(entry: Entry): string[] {
  return [
    entry.pick1, entry.pick2,
    entry.pick3, entry.pick4,
    entry.pick5, entry.pick6, entry.pick7,
  ].filter(Boolean);
}

/** Determine whether an entry survives given a team status map. */
export function getEntryStatus(
  entry: Entry,
  teamStatus: Record<string, TeamStatus>
): EntryStatus {
  // If the sheet already marks this entry as eliminated (e.g. prior day loss), it's done
  if (entry.sheetStatus && entry.sheetStatus !== 'active' && entry.sheetStatus !== '') {
    return 'eliminated';
  }

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

/** Compute per-team pick statistics. */
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

/** Compute how often each pair of teams is picked together. */
export function computePairingMatrix(
  entries: Entry[]
): Record<string, Record<string, number>> {
  const pairs: Record<string, Record<string, number>> = {};

  entries.forEach((e) => {
    const picks = getTodayPicks(e);
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        const a = picks[i], b = picks[j];
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
