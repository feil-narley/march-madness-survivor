/** Shared design tokens — import these instead of hard-coding colors */
export const C = {
  bg:       '#090d18',
  surface:  '#101726',
  elevated: '#172035',
  border:   '#233044',
  borderHi: '#2e4060',

  text:     '#e2e8f4',
  textMid:  '#8ca0bc',
  textDim:  '#4a607a',

  accent:      '#38bdf8',  // sky blue
  accentDim:   'rgba(56,189,248,0.12)',
  accentBorder:'rgba(56,189,248,0.3)',

  alive:    '#34d399',
  aliveDim: 'rgba(52,211,153,0.12)',
  dead:     '#f87171',
  deadDim:  'rgba(248,113,113,0.12)',
  won:      '#818cf8',
  wonDim:   'rgba(129,140,248,0.12)',
  uncertain:'#fbbf24',
  uncDim:   'rgba(251,191,36,0.12)',
} as const;

export const statusColor = (s: string) =>
  ({ alive: C.alive, won: C.won, dead: C.dead, unknown: C.textDim }[s] ?? C.textDim);

export const entryColor = (s: string) =>
  ({ alive: C.alive, eliminated: C.dead, uncertain: C.uncertain }[s] ?? C.textDim);
