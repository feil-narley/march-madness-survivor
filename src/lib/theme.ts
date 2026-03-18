/** Shared design tokens */
export const C = {
  bg:       '#090d18',
  surface:  '#101726',
  elevated: '#172035',
  border:   '#233044',
  borderHi: '#2e4060',

  text:    '#ffffff',
  textMid: '#94a3b8',
  textDim: '#4a607a',

  // Red / White / Blue palette
  // Blue  = positive (alive, surviving, won)
  // Red   = negative (dead, eliminated)
  // White = neutral  (uncertain, undecided, unknown)

  alive:    '#3b82f6',          // blue
  aliveDim: 'rgba(59,130,246,0.12)',

  won:      '#60a5fa',          // lighter blue
  wonDim:   'rgba(96,165,250,0.12)',

  dead:     '#ef4444',          // red
  deadDim:  'rgba(239,68,68,0.12)',

  uncertain: '#e2e8f4',         // near-white / neutral
  uncDim:    'rgba(226,232,244,0.08)',

  accent:       '#3b82f6',      // blue as primary accent
  accentDim:    'rgba(59,130,246,0.12)',
  accentBorder: 'rgba(59,130,246,0.3)',
} as const;

export const statusColor = (s: string): string =>
  ({ alive: C.alive, won: C.won, dead: C.dead, unknown: C.textDim }[s] ?? C.textDim);

export const entryColor = (s: string): string =>
  ({ alive: C.alive, eliminated: C.dead, uncertain: C.uncertain }[s] ?? C.textDim);
