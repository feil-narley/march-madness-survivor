export type TeamStatus = 'alive' | 'won' | 'dead' | 'unknown';
export type EntryStatus = 'alive' | 'eliminated' | 'uncertain';

export interface Entry {
  name: string;
  pick1: string;
  pick2: string;
  paid: boolean;
  buyback: boolean;
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
  /** null = not yet played (unlocked); non-null = locked result (winning team name) */
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
