type Tab = 'dashboard' | 'entries' | 'teams' | 'pairings' | 'scenario';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'entries', label: 'Entries' },
  { id: 'teams', label: 'Team Frequency' },
  { id: 'pairings', label: 'Team Pairings' },
  { id: 'scenario', label: 'Scenario Analyzer' },
];

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({ activeTab, onTabChange, onRefresh, loading }: HeaderProps) {
  return (
    <header style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🏀</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f97316' }}>
                March Madness Survivor
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Day 2 — 2025 Tournament</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: loading ? '#334155' : '#f97316',
              color: loading ? '#94a3b8' : '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        <nav style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === tab.id ? '#f97316' : '#94a3b8',
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export type { Tab };
