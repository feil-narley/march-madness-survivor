import { useState } from 'react';
import Header, { type Tab } from './components/Header';
import StatsBar from './components/StatsBar';
import Dashboard from './components/Dashboard';
import EntriesTable from './components/EntriesTable';
import TeamFrequency from './components/TeamFrequency';
import TeamPairings from './components/TeamPairings';
import ScenarioAnalyzer from './components/ScenarioAnalyzer';
import { useSheetData } from './hooks/useSheetData';
import type { ScenarioSelections } from './lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [scenario, setScenario] = useState<ScenarioSelections>({});
  const { data, loading, error, refresh } = useSheetData();

  function handleScenarioChange(id: string, winner: string | null) {
    setScenario((prev) => ({ ...prev, [id]: winner }));
  }

  function handleScenarioReset() {
    setScenario({});
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={refresh}
        loading={loading}
      />

      {loading && !data && (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏀</div>
          <p>Loading sheet data…</p>
        </div>
      )}

      {error && (
        <div
          style={{
            margin: 24,
            padding: 20,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            maxWidth: 700,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <strong>Error loading data:</strong> {error}
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0' }}>
            Make sure the Google Sheet is publicly accessible and the <strong>Matchups</strong> tab exists.
          </p>
        </div>
      )}

      {data && (
        <>
          <StatsBar entries={data.entries} matchups={data.matchups} scenario={scenario} />

          <main style={{ paddingTop: 8 }}>
            {activeTab === 'dashboard' && (
              <Dashboard entries={data.entries} matchups={data.matchups} scenario={scenario} />
            )}
            {activeTab === 'entries' && (
              <EntriesTable entries={data.entries} matchups={data.matchups} scenario={scenario} />
            )}
            {activeTab === 'teams' && (
              <TeamFrequency entries={data.entries} matchups={data.matchups} scenario={scenario} />
            )}
            {activeTab === 'pairings' && (
              <TeamPairings entries={data.entries} matchups={data.matchups} scenario={scenario} />
            )}
            {activeTab === 'scenario' && (
              <ScenarioAnalyzer
                entries={data.entries}
                matchups={data.matchups}
                scenario={scenario}
                onScenarioChange={handleScenarioChange}
                onReset={handleScenarioReset}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
