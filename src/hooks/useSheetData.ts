import { useEffect, useState } from 'react';
import { fetchEntries, fetchMatchups } from '../lib/sheets';
import type { Entry, Matchup } from '../lib/types';

export interface SheetData {
  entries: Entry[];
  matchups: Matchup[];
  tomorrowTeams: string[];
  tomorrowMatchups: Matchup[];
  dayAfterTeams: string[];
  dayAfterMatchups: Matchup[];
}

interface UseSheetDataResult {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Update these constants whenever the active day changes
const PICKS_SHEET        = 'picks - day 4';
const PICKS_PREV_SHEET   = 'picks - day 3';
const MATCHUPS_SHEET     = 'matchups - day 4';
const TOMORROW_MATCHUPS  = 'matchups - day 5';

export function useSheetData(): UseSheetDataResult {
  const [data, setData]       = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchEntries(PICKS_SHEET),
      fetchEntries(PICKS_PREV_SHEET),
      fetchMatchups(MATCHUPS_SHEET),
      fetchMatchups(TOMORROW_MATCHUPS).catch(() => [] as Matchup[]),
      fetchMatchups('matchups - day 6').catch(() => [] as Matchup[]),
    ])
      .then(([todayEntries, prevEntries, matchups, tomorrowMatchups, dayAfterMatchups]) => {
        if (cancelled) return;

        // Build prior day lookup by name for pick comparison
        const prevMap = new Map<string, Entry>();
        for (const e of prevEntries) {
          if (!prevMap.has(e.name)) prevMap.set(e.name, e);
        }

        // Only keep entries that have today's pick data (pick10 or pick11 must be present)
        // "NOT LISTED" counts as present — it is a valid submitted pick (uncertain team)
        // Entries with no day 4 picks are excluded entirely from all views and counts
        const entries: Entry[] = todayEntries
          .filter((e) => (e.pick10 && e.pick10 !== '-') || (e.pick11 && e.pick11 !== '-'))
          .map((e) => {
            const prev = prevMap.get(e.name);
            // Flag if any carryover picks differ from the prior day's sheet
            const inconsistentPicks = prev
              ? e.pick1 !== prev.pick1 || e.pick2 !== prev.pick2 ||
                e.pick3 !== prev.pick3 || e.pick4 !== prev.pick4 ||
                e.pick8 !== prev.pick8 || e.pick9 !== prev.pick9
              : false;
            return { ...e, inconsistentPicks };
          });

        const tomorrowTeams = [
          ...new Set([
            ...tomorrowMatchups.map((m) => m.betterSeed).filter(Boolean),
            ...tomorrowMatchups.map((m) => m.worseSeed).filter(Boolean),
          ]),
        ].sort();

        const dayAfterTeams = [
          ...new Set([
            ...dayAfterMatchups.map((m) => m.betterSeed).filter(Boolean),
            ...dayAfterMatchups.map((m) => m.worseSeed).filter(Boolean),
          ]),
        ].sort();

        setData({ entries, matchups, tomorrowTeams, tomorrowMatchups, dayAfterTeams, dayAfterMatchups });
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [tick]);

  return {
    data,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
