import Papa from 'papaparse';
import type { Entry, Matchup } from './types';

const SHEET_ID = '1tZURlTOuLx6u2gTqRcFjJb7_gSUnheLFFLB1kVjX2Vk';

function sheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

async function fetchCsv(sheetName: string): Promise<string[][]> {
  const res = await fetch(sheetUrl(sheetName));
  if (!res.ok) throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
  const text = await res.text();
  const result = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return result.data as string[][];
}

function clean(val: string | undefined): string {
  const s = (val ?? '').trim();
  return s === '#N/A' || s === '#ERROR!' ? '' : s;
}

/**
 * Fetch entries from the given day tab.
 * Expected columns (row 1 = headers):
 *   A: Name  B: Pick1  C: Pick2  D: Paid  E: Buyback
 *   F: Pick3  G: Pick4  H: Pick5  I: Pick6  J: Pick7
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
      pick1: clean(r[1]),
      pick2: clean(r[2]),
      paid: clean(r[3]).toLowerCase() === 'y',
      buyback: clean(r[4]).toLowerCase() === 'y',
      pick3: clean(r[5]),
      pick4: clean(r[6]),
      pick5: clean(r[7]),
      pick6: clean(r[8]),
      pick7: clean(r[9]),
    });
  }

  return entries;
}

/**
 * Fetch matchups from the "Matchups" tab.
 * Expected columns (row 1 = headers):
 *   A: Round  B: Team1  C: Team2  D: Winner (blank = not yet played)
 */
export async function fetchMatchups(): Promise<Matchup[]> {
  const rows = await fetchCsv('Matchups');
  const matchups: Matchup[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const team1 = clean(r[1]);
    const team2 = clean(r[2]);
    if (!team1 && !team2) continue;
    const winner = clean(r[3]);
    matchups.push({
      id: `${team1}__${team2}`,
      round: clean(r[0]),
      team1,
      team2,
      winner: winner || null,
    });
  }

  return matchups;
}
