import { useEffect, useState } from 'react';
import { fetchEntries, fetchMatchups } from '../lib/sheets';
import type { Entry, Matchup } from '../lib/types';

export interface SheetData {
  entries: Entry[];
  matchups: Matchup[];
}

interface UseSheetDataResult {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Update these constants whenever the active day changes
const PICKS_SHEET   = 'picks - day 1';
const MATCHUPS_SHEET = 'matchups - day 1';

export function useSheetData(): UseSheetDataResult {
  const [data, setData]       = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchEntries(PICKS_SHEET), fetchMatchups(MATCHUPS_SHEET)])
      .then(([entries, matchups]) => {
        if (!cancelled) {
          setData({ entries, matchups });
          setLoading(false);
        }
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
