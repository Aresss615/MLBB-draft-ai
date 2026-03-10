import { useState, useMemo } from 'react';
import type { Hero, Role, SelectionTarget } from '../types';
import { heroes } from '../data/heroes';
import HeroCard from './HeroCard';
import { Search, X, Filter } from 'lucide-react';

interface HeroSelectorProps {
  target: SelectionTarget;
  usedHeroIds: Set<string>;
  onSelect: (target: SelectionTarget, heroId: string) => void;
  onClose: () => void;
}

const roles: (Role | 'All')[] = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

export default function HeroSelector({ target, usedHeroIds, onSelect, onClose }: HeroSelectorProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');

  const filteredHeroes = useMemo(() => {
    let filtered = heroes;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.primaryRole.toLowerCase().includes(q) ||
        h.secondaryRole?.toLowerCase().includes(q) ||
        h.playstyleTags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== 'All') {
      filtered = filtered.filter(h => h.primaryRole === roleFilter || h.secondaryRole === roleFilter);
    }

    // Sort: available first, then by tier/meta
    return [...filtered].sort((a, b) => {
      const aUsed = usedHeroIds.has(a.id) ? 1 : 0;
      const bUsed = usedHeroIds.has(b.id) ? 1 : 0;
      if (aUsed !== bUsed) return aUsed - bUsed;
      return b.metaScore - a.metaScore;
    });
  }, [search, roleFilter, usedHeroIds]);

  const handleSelect = (hero: Hero) => {
    if (usedHeroIds.has(hero.id)) return;
    onSelect(target, hero.id);
  };

  const sideLabel = target.side === 'ally' ? 'Allied' : 'Enemy';
  const typeLabel = target.type === 'pick' ? 'Pick' : 'Ban';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Select Hero</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {sideLabel} {typeLabel} — Slot {target.index + 1}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-5 py-3 border-b border-surface-700 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search heroes..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-slate-500 mr-1" />
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  roleFilter === role
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-slate-400 hover:text-slate-200 hover:bg-surface-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredHeroes.map(hero => (
              <HeroCard
                key={hero.id}
                hero={hero}
                compact
                disabled={usedHeroIds.has(hero.id)}
                onClick={() => handleSelect(hero)}
              />
            ))}
          </div>
          {filteredHeroes.length === 0 && (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
              No heroes match your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-700 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {filteredHeroes.filter(h => !usedHeroIds.has(h.id)).length} heroes available
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-surface-800 hover:bg-surface-700 text-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
