export type TeamStatus = 'alive' | 'won' | 'dead' | 'unknown';
export type EntryStatus = 'alive' | 'partial' | 'uncertain' | 'eliminated';

export interface Entry {
  name: string;
  /** 'active' | 'eliminated' — from the sheet's Status column */
  sheetStatus: string;
  buyback: boolean;
  pick1: string;
  pick2: string;
  // Future days — populated when sheet has more picks
  pick3: string;
  pick4: string;
  pick5: string;
  pick6: string;
  pick7: string;
}

export interface Matchup {
  id: string;
  betterSeed: string;
  worseSeed: string;
  favorite: string;
  moneyline: string;
  spread: string;
  /**
   * null  = game not yet final — scenario selection allowed
   * string = game is final (locked); value is the winning team name
   */
  winner: string | null;
}

export interface TeamStats {
  name: string;
  status: TeamStatus;
  pickCount: number;
  pickPercent: number;
}

/** matchupId -> winning team name, or null if undecided */
export type ScenarioSelections = Record<string, string | null>;
