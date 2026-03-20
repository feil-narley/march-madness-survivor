import { useEffect, useState } from 'react';
import { fetchEntries, fetchMatchups } from '../lib/sheets';
import type { Entry, Matchup } from '../lib/types';

export interface SheetData {
  entries: Entry[];
  matchups: Matchup[];
  tomorrowTeams: string[];
}

interface UseSheetDataResult {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Update these constants whenever the active day changes
const PICKS_SHEET        = 'picks - day 2';
const PICKS_DAY1_SHEET   = 'picks - day 1';
const MATCHUPS_SHEET     = 'matchups - day 2';
const TOMORROW_MATCHUPS  = 'matchups - day 3';

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
      fetchEntries(PICKS_DAY1_SHEET),
      fetchMatchups(MATCHUPS_SHEET),
      fetchMatchups(TOMORROW_MATCHUPS).catch(() => [] as Matchup[]),
    ])
      .then(([day2Entries, day1Entries, matchups, day3Matchups]) => {
        if (cancelled) return;

        // Build day 1 lookup by name for pick comparison
        const day1Map = new Map<string, Entry>();
        for (const e of day1Entries) {
          if (!day1Map.has(e.name)) day1Map.set(e.name, e);
        }

        // Only keep entries that have day 2 pick data (pick3 or pick4 must be present)
        // Entries with no day 2 picks are excluded entirely from all views and counts
        const entries: Entry[] = day2Entries
          .filter((e) => (e.pick3 && e.pick3 !== '-') || (e.pick4 && e.pick4 !== '-'))
          .map((e) => {
            const d1 = day1Map.get(e.name);
            const inconsistentPicks = d1
              ? e.pick1 !== d1.pick1 || e.pick2 !== d1.pick2
              : false;
            return { ...e, inconsistentPicks };
          });

        // Collect unique team names from tomorrow's matchups
        const tomorrowTeams = [
          ...new Set([
            ...day3Matchups.map((m) => m.betterSeed).filter(Boolean),
            ...day3Matchups.map((m) => m.worseSeed).filter(Boolean),
          ]),
        ].sort();

        setData({ entries, matchups, tomorrowTeams });
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
