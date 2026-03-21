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
const PICKS_SHEET        = 'picks - day 3';
const PICKS_PREV_SHEET   = 'picks - day 2';
const MATCHUPS_SHEET     = 'matchups - day 3';
const TOMORROW_MATCHUPS  = 'matchups - day 4';

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
    ])
      .then(([todayEntries, prevEntries, matchups, tomorrowMatchups]) => {
        if (cancelled) return;

        // Build prior day lookup by name for pick comparison
        const prevMap = new Map<string, Entry>();
        for (const e of prevEntries) {
          if (!prevMap.has(e.name)) prevMap.set(e.name, e);
        }

        // Only keep entries that have today's pick data (pick8 or pick9 must be present)
        // Entries with no day 3 picks are excluded entirely from all views and counts
        const entries: Entry[] = todayEntries
          .filter((e) => (e.pick8 && e.pick8 !== '-') || (e.pick9 && e.pick9 !== '-'))
          .map((e) => {
            const prev = prevMap.get(e.name);
            // Flag if any carryover picks differ from the prior day's sheet
            const inconsistentPicks = prev
              ? e.pick1 !== prev.pick1 || e.pick2 !== prev.pick2 ||
                e.pick3 !== prev.pick3 || e.pick4 !== prev.pick4
              : false;
            return { ...e, inconsistentPicks };
          });

        // Collect unique team names from tomorrow's matchups
        const tomorrowTeams = [
          ...new Set([
            ...tomorrowMatchups.map((m) => m.betterSeed).filter(Boolean),
            ...tomorrowMatchups.map((m) => m.worseSeed).filter(Boolean),
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
