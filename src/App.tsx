import { useMemo, useState } from 'react';
import { useDraft } from './hooks/useDraft';
import { usePreferences } from './hooks/usePreferences';
import { getPickRecommendations, getBanRecommendations } from './engine/scoring';
import { analyzeAllyComp, analyzeEnemyComp } from './engine/composition';
import { generateCoachNotes } from './engine/coach';
import DraftBoard from './components/DraftBoard';
import HeroSelector from './components/HeroSelector';
import Recommendations from './components/Recommendations';
import CompositionPanel from './components/CompositionPanel';
import CoachNotes from './components/CoachNotes';
import PreferencesPanel from './components/PreferencesPanel';
import { Settings, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const {
    draft, selectionTarget, usedHeroIds,
    setHero, removeHero, resetDraft, openSelector, closeSelector,
  } = useDraft();

  const {
    prefs, setPreferredRole, toggleComfortHero,
    toggleExcludedHero, setMode, resetPrefs,
  } = usePreferences();

  const [prefsOpen, setPrefsOpen] = useState(false);

  // ── Compute recommendations and analysis ──
  const pickRecs = useMemo(() => getPickRecommendations(draft, prefs, 5), [draft, prefs]);
  const banRecs = useMemo(() => getBanRecommendations(draft, prefs, 5), [draft, prefs]);
  const allyComp = useMemo(() => analyzeAllyComp(draft), [draft]);
  const enemyComp = useMemo(() => analyzeEnemyComp(draft), [draft]);

  const coachNotes = useMemo(() => generateCoachNotes({
    draft,
    pickRecs,
    banRecs,
    allyWarnings: allyComp.warnings,
    allyStrengths: allyComp.strengths,
    enemyStyles: enemyComp.styleClassification,
    enemyStyleExplanation: enemyComp.styleExplanation,
    enemyStrengths: enemyComp.strengths,
    prefs,
  }), [draft, pickRecs, banRecs, allyComp, enemyComp, prefs]);

  // ── Quick pick: find first empty ally slot ──
  const handleQuickPick = (heroId: string) => {
    const emptyIndex = draft.allyPicks.findIndex(s => s.heroId === null);
    if (emptyIndex !== -1) {
      setHero({ side: 'ally', type: 'pick', index: emptyIndex }, heroId);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="border-b border-surface-800 bg-surface-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-brand-400" />
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                MLBB Draft Coach
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-brand-600/20 text-brand-300 rounded-md border border-brand-600/30 uppercase tracking-wider">
                MVP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrefsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-surface-800 hover:bg-surface-700 rounded-lg border border-surface-700 transition-colors"
              >
                <Settings size={14} />
                <span className="hidden sm:inline">Preferences</span>
              </button>
              <button
                onClick={resetDraft}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 bg-surface-800 hover:bg-surface-700 rounded-lg border border-surface-700 transition-colors"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset Draft</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Draft Board */}
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Draft Board</h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      {draft.allyPicks.filter(s => s.heroId).length}/5
                    </span>
                    <span className="text-surface-600">vs</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-danger" />
                      {draft.enemyPicks.filter(s => s.heroId).length}/5
                    </span>
                  </div>
                </div>
                <DraftBoard
                  draft={draft}
                  selectionTarget={selectionTarget}
                  onSlotClick={openSelector}
                  onRemoveHero={removeHero}
                />
              </div>
            </div>
          </div>

          {/* Center Column: Recommendations */}
          <div className="lg:col-span-4">
            <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
              <Recommendations
                pickRecs={pickRecs}
                banRecs={banRecs}
                onPickHero={handleQuickPick}
              />
            </div>
          </div>

          {/* Right Column: Analysis + Coach */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
              <CompositionPanel
                allyWarnings={allyComp.warnings}
                allyStrengths={allyComp.strengths}
                enemyAnalysis={enemyComp}
              />
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
              <CoachNotes notes={coachNotes} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-600">
            MLBB Draft Coach — Rule-based drafting assistant. Not affiliated with Moonton.
          </p>
          <p className="text-[10px] text-slate-600">
            Hero data is mock/approximate for MVP purposes.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {selectionTarget && (
        <HeroSelector
          target={selectionTarget}
          usedHeroIds={usedHeroIds}
          onSelect={setHero}
          onClose={closeSelector}
        />
      )}

      <PreferencesPanel
        prefs={prefs}
        onSetRole={setPreferredRole}
        onToggleComfort={toggleComfortHero}
        onToggleExcluded={toggleExcludedHero}
        onSetMode={setMode}
        onReset={resetPrefs}
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
      />
    </div>
  );
}
