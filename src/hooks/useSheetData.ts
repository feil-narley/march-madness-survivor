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
const PICKS_SHEET        = 'picks - day 5';
const PICKS_PREV_SHEET   = 'picks - day 4';
const MATCHUPS_SHEET     = 'matchups - day 5';
const TOMORROW_MATCHUPS  = 'matchups - day 6';
const DAY_AFTER_MATCHUPS = 'matchups - day 7';

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
      fetchMatchups(DAY_AFTER_MATCHUPS).catch(() => [] as Matchup[]),
    ])
      .then(([todayEntries, prevEntries, matchups, tomorrowMatchups, dayAfterMatchups]) => {
        if (cancelled) return;

        // Build prior day lookup by name for pick comparison
        const prevMap = new Map<string, Entry>();
        for (const e of prevEntries) {
          if (!prevMap.has(e.name)) prevMap.set(e.name, e);
        }

        // Only keep entries that submitted a pick12 (the required today pick).
        // pick13 being absent means they are a single-picker — still valid.
        // "NOT LISTED" counts as present — it is a valid submitted pick (uncertain team).
        const entries: Entry[] = todayEntries
          .filter((e) => e.pick12 && e.pick12 !== '-')
          .map((e) => {
            const prev = prevMap.get(e.name);
            const inconsistentPicks = prev
              ? e.pick1  !== prev.pick1  || e.pick2  !== prev.pick2  ||
                e.pick3  !== prev.pick3  || e.pick4  !== prev.pick4  ||
                e.pick8  !== prev.pick8  || e.pick9  !== prev.pick9  ||
                e.pick10 !== prev.pick10 || e.pick11 !== prev.pick11
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
