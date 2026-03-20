import { useState } from 'react';
import { C } from './lib/theme';
import Header, { type Tab } from './components/Header';
import StatsBar from './components/StatsBar';
import Dashboard from './components/Dashboard';
import EntriesTable from './components/EntriesTable';
import TeamFrequency from './components/TeamFrequency';
import TeamPairings from './components/TeamPairings';
import ScenarioAnalyzer from './components/ScenarioAnalyzer';
import TomorrowPicks from './components/TomorrowPicks';
import { useSheetData } from './hooks/useSheetData';
import type { ScenarioSelections } from './lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [scenario, setScenario] = useState<ScenarioSelections>({});
  const { data, loading, error, refresh } = useSheetData();

  function handleScenarioChange(id: string, winner: string | null) {
    setScenario((prev) => ({ ...prev, [id]: winner }));
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Loading state */}
      {loading && !data && (
        <div style={{ paddingTop: 80, textAlign: 'center', color: C.textDim }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>🏀</div>
          <p style={{ fontSize: 14 }}>Loading sheet data…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          maxWidth: 600, margin: '32px auto', padding: '20px 24px',
          background: `${C.dead}10`, border: `1px solid ${C.dead}40`,
          borderRadius: 8, color: C.dead,
        }}>
          <strong>Could not load data</strong>
          <p style={{ color: C.textMid, fontSize: 13, margin: '8px 0 0', lineHeight: 1.6 }}>
            {error}<br />
            Make sure the Google Sheet is publicly accessible and a <strong>Matchups</strong> tab exists.
          </p>
        </div>
      )}

      {data && (
        <>
          <StatsBar entries={data.entries} matchups={data.matchups} scenario={scenario} />

          <main style={{ paddingTop: 4 }}>
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
                onReset={() => setScenario({})}
              />
            )}
            {activeTab === 'tomorrow' && (
              <TomorrowPicks
                entries={data.entries}
                matchups={data.matchups}
                scenario={scenario}
                tomorrowTeams={data.tomorrowTeams}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
