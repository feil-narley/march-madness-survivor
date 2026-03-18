import { C } from '../lib/theme';

export type Tab = 'dashboard' | 'entries' | 'teams' | 'pairings' | 'scenario';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'entries',    label: 'Entries' },
  { id: 'teams',      label: 'Team Frequency' },
  { id: 'pairings',   label: 'Team Pairings' },
  { id: 'scenario',   label: 'Scenario Analyzer' },
];

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({ activeTab, onTabChange, onRefresh, loading }: HeaderProps) {
  return (
    <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 28px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Logo mark */}
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🏀</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>
                March Madness Survivor
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                2025 Tournament · Day 1
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: loading ? C.elevated : C.accentDim,
              color: loading ? C.textDim : C.accent,
              border: `1px solid ${loading ? C.border : C.accentBorder}`,
              borderRadius: 7,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        {/* Tab bar */}
        <nav style={{ display: 'flex', gap: 2, marginBottom: -1 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
                  color: active ? C.accent : C.textMid,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  letterSpacing: active ? '-0.1px' : '0',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
