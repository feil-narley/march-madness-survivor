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
 *   A: Name  B: Pick 1  C: Pick 2  [D: Paid  E: Buyback  F: Pick3 … optional]
 */
export async function fetchEntries(sheetName: string): Promise<Entry[]> {
  const rows = await fetchCsv(sheetName);
  const entries: Entry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = clean(r[0]);
    if (!name) continue;
    entries.push({
      name,
      pick1:   clean(r[1]),
      pick2:   clean(r[2]),
      paid:    clean(r[3]).toLowerCase() === 'y',
      buyback: clean(r[4]).toLowerCase() === 'y',
      pick3:   clean(r[5]),
      pick4:   clean(r[6]),
      pick5:   clean(r[7]),
      pick6:   clean(r[8]),
      pick7:   clean(r[9]),
    });
  }

  return entries;
}

/**
 * Fetch matchups from the current day's matchups tab.
 * Expected columns (row 1 = headers):
 *   A: Better Seed  B: Worse Seed  C: Favorite  D: Moneyline  E: Spread  F: Winner (blank = pending)
 */
export async function fetchMatchups(sheetName: string): Promise<Matchup[]> {
  const rows = await fetchCsv(sheetName);
  const matchups: Matchup[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const betterSeed = clean(r[0]);
    const worseSeed  = clean(r[1]);
    if (!betterSeed && !worseSeed) continue;

    const winner = clean(r[5]);
    matchups.push({
      id:         `${betterSeed}__${worseSeed}`,
      betterSeed,
      worseSeed,
      favorite:   clean(r[2]),
      moneyline:  clean(r[3]),
      spread:     clean(r[4]),
      winner:     winner || null,
    });
  }

  return matchups;
}
