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
 * Day 4: everyone has pick10 and pick11.
 * "NOT LISTED" is kept — it is treated as a pending/unknown team so the entry
 * stays uncertain rather than being eliminated (unless the other pick lost).
 */
export function getTodayPicks(entry: Entry): string[] {
  return [entry.pick10, entry.pick11].filter(p => p && p !== '-');
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

  // '-' in today's pick slots means the entry missed the deadline
  const rawPicks = [entry.pick10, entry.pick11];
  if (rawPicks.some(p => p === '-')) return 'eliminated';

  const picks = getTodayPicks(entry);
  if (picks.length === 0) return 'eliminated';

  let wonCount     = 0;
  let deadCount    = 0;
  let pendingCount = 0;

  for (const pick of picks) {
    const s = teamStatus[pick] ?? 'alive';
    if (s === 'dead')               deadCount++;
    else if (s === 'won')           wonCount++;
    else /* alive | unknown */      pendingCount++;
  }

  if (deadCount > 0)                         return 'eliminated';
  if (pendingCount === 0)                    return 'alive';      // all picks won
  if (wonCount > 0 && pendingCount > 0)      return 'partial';    // some won, some pending
  return 'uncertain';                                              // all pending
}

/** Compute per-team pick statistics. */
export function computeTeamStats(
  entries: Entry[],
  teamStatus: Record<string, TeamStatus>
): TeamStats[] {
  const counts: Record<string, number> = {};
  const total = entries.length;

  entries.forEach((e) => {
    // Deduplicate picks per entry so a team is counted at most once per entry
    new Set(getTodayPicks(e)).forEach((pick) => {
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

/** Return only the current-day picks (pick10–pick11), excluding prior-day picks and "NOT LISTED" placeholders. */
export function getCurrentDayPicks(entry: Entry): string[] {
  return [entry.pick10, entry.pick11]
    .filter(p => p && p !== '-' && p.toUpperCase() !== 'NOT LISTED');
}

/** Compute how often each pair of teams is picked together. */
export function computePairingMatrix(
  entries: Entry[],
  pickFn: (e: Entry) => string[] = getTodayPicks
): Record<string, Record<string, number>> {
  const pairs: Record<string, Record<string, number>> = {};

  entries.forEach((e) => {
    const picks = pickFn(e);
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
