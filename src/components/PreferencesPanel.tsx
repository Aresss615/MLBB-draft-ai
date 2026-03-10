import type { UserPreferences, Role } from '../types';
import { heroes } from '../data/heroes';
import { Settings, User, Shield, X as XIcon } from 'lucide-react';
import { getHeroById } from '../data/heroes';

interface PreferencesPanelProps {
  prefs: UserPreferences;
  onSetRole: (role: Role | 'Fill') => void;
  onToggleComfort: (heroId: string) => void;
  onToggleExcluded: (heroId: string) => void;
  onSetMode: (mode: 'solo' | 'team') => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const roles: (Role | 'Fill')[] = ['Fill', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

export default function PreferencesPanel({
  prefs, onSetRole, onToggleComfort, onToggleExcluded, onSetMode, onReset, isOpen, onClose,
}: PreferencesPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-slate-100">Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User size={12} />
              Queue Mode
            </label>
            <div className="flex gap-2">
              {(['solo', 'team'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => onSetMode(mode)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    prefs.mode === mode
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-800 text-slate-400 hover:text-slate-200 hover:bg-surface-700 border border-surface-600'
                  }`}
                >
                  {mode === 'solo' ? 'Solo Queue' : 'Coordinated Team'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {prefs.mode === 'solo'
                ? 'Favors safer, self-sufficient picks. Avoids team-dependent heroes.'
                : 'Allows coordinated combos and team-dependent synergies.'}
            </p>
          </div>

          {/* Preferred Role */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Shield size={12} />
              Preferred Role
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => onSetRole(role)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    prefs.preferredRole === role
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-800 text-slate-400 hover:text-slate-200 hover:bg-surface-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Comfort Heroes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Comfort Heroes
              <span className="text-slate-500 font-normal ml-1">({prefs.comfortHeroes.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {heroes.map(hero => {
                const isSelected = prefs.comfortHeroes.includes(hero.id);
                return (
                  <button
                    key={hero.id}
                    onClick={() => onToggleComfort(hero.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      isSelected
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                        : 'bg-surface-800 text-slate-500 hover:text-slate-300 hover:bg-surface-700'
                    }`}
                  >
                    {hero.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Excluded Heroes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Excluded Heroes
              <span className="text-slate-500 font-normal ml-1">({prefs.excludedHeroes.length} selected)</span>
            </label>
            {prefs.excludedHeroes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {prefs.excludedHeroes.map(id => {
                  const hero = getHeroById(id);
                  return hero ? (
                    <button
                      key={id}
                      onClick={() => onToggleExcluded(id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30"
                    >
                      {hero.name} <XIcon size={10} />
                    </button>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">No heroes excluded. Click heroes in the comfort pool to toggle.</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto">
              {heroes.filter(h => !prefs.excludedHeroes.includes(h.id)).map(hero => (
                <button
                  key={hero.id}
                  onClick={() => onToggleExcluded(hero.id)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-800 text-slate-500 hover:text-slate-300 hover:bg-surface-700 transition-colors"
                >
                  {hero.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-700 flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Reset All Preferences
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
