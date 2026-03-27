import Papa from 'papaparse';
import type { Entry, Matchup } from './types';

const SHEET_ID = '11BcCGc2QFjaoqJh7IB2cmxICqdjO1hgAdu1swCM3478';

function sheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

async function fetchCsv(sheetName: string): Promise<string[][]> {
  const res = await fetch(sheetUrl(sheetName));
  if (!res.ok) throw new Error(`Failed to fetch sheet "${sheetName}" (${res.status}). Make sure the sheet is publicly accessible.`);
  const text = await res.text();
  const result = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return result.data as string[][];
}

function clean(val: string | undefined): string {
  const s = (val ?? '').trim();
  return s === '#N/A' || s === '#ERROR!' ? '' : s;
}

/**
 * Fetch entries from the current day's picks tab.
 * Expected columns (row 1 = headers):
 *   A: Name  B: Status  C: Buyback  D: Pick 1  E: Pick 2
 *   [F: Pick 3  G: Pick 4  H: Pick 5  I: Pick 6  J: Pick 7  — future days]
 */
export async function fetchEntries(sheetName: string): Promise<Entry[]> {
  const rows = await fetchCsv(sheetName);
  const entries: Entry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = clean(r[0]);
    if (!name) continue;

    const buybackRaw = clean(r[2]).toLowerCase();

    entries.push({
      name,
      sheetStatus: clean(r[1]).toLowerCase(),  // 'active' | 'eliminated' | etc.
      buyback: buybackRaw === 'y' || buybackRaw === 'yes',
      pick1: clean(r[3]),
      pick2: clean(r[4]),
      pick3: clean(r[5]),
      pick4: clean(r[6]),
      pick5: clean(r[7]),
      pick6: clean(r[8]),
      pick7: clean(r[9]),
      pick8:  clean(r[10]),
      pick9:  clean(r[11]),
      pick10: clean(r[12]),
      pick11: clean(r[13]),
      pick12: clean(r[14]),
      pick13: clean(r[15]),
    });
  }

  return entries;
}

/**
 * Fetch matchups from the current day's matchups tab.
 * Expected columns (row 1 = headers):
 *   A: Better Seed  B: Worse Seed  C: Favorite  D: Moneyline  E: Spread
 *   F: Final  (any non-empty value = game is locked)
 *   G: Winner (winning team name — used when Final is set)
 */
export async function fetchMatchups(sheetName: string): Promise<Matchup[]> {
  const rows = await fetchCsv(sheetName);
  const matchups: Matchup[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const betterSeed = clean(r[0]);
    const worseSeed  = clean(r[1]);
    if (!betterSeed && !worseSeed) continue;

    const isFinal = clean(r[5]) !== '';       // col F: Final
    const winnerRaw = clean(r[6]);            // col G: Winner

    matchups.push({
      id:         `${betterSeed}__${worseSeed}`,
      betterSeed,
      worseSeed,
      favorite:   clean(r[2]),
      moneyline:  clean(r[3]),
      spread:     clean(r[4]),
      // Locked only when Final column is set AND a winner is named
      winner: isFinal && winnerRaw ? winnerRaw : null,
    });
  }

  return matchups;
}
