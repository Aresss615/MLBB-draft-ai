import type { Hero } from '../types';
import { RoleTag, TierBadge } from './RoleTag';

interface HeroCardProps {
  hero: Hero;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const roleColors: Record<string, string> = {
  Tank: 'border-blue-500/40',
  Fighter: 'border-orange-500/40',
  Assassin: 'border-red-500/40',
  Mage: 'border-purple-500/40',
  Marksman: 'border-yellow-500/40',
  Support: 'border-emerald-500/40',
};

const roleBg: Record<string, string> = {
  Tank: 'from-blue-500/10',
  Fighter: 'from-orange-500/10',
  Assassin: 'from-red-500/10',
  Mage: 'from-purple-500/10',
  Marksman: 'from-yellow-500/10',
  Support: 'from-emerald-500/10',
};

export default function HeroCard({ hero, disabled, selected, compact, onClick }: HeroCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left w-full
          ${disabled
            ? 'opacity-30 cursor-not-allowed border-surface-700 bg-surface-900'
            : selected
              ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/50'
              : `border-surface-700 bg-surface-800 hover:border-surface-500 hover:bg-surface-700 hero-card-glow cursor-pointer`
          }
        `}
      >
        <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${roleBg[hero.primaryRole]} to-transparent border ${roleColors[hero.primaryRole]} flex items-center justify-center text-sm font-bold text-slate-300`}>
          {hero.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-200 truncate">{hero.name}</span>
            <TierBadge tier={hero.tier} />
          </div>
          <RoleTag role={hero.primaryRole} size="sm" />
        </div>
        {disabled && (
          <span className="absolute top-1 right-1 text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            Used
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col p-3 rounded-lg border transition-all text-left
        ${disabled
          ? 'opacity-30 cursor-not-allowed border-surface-700 bg-surface-900'
          : selected
            ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/50'
            : `border-surface-700 bg-surface-800 hover:border-surface-500 hover:bg-surface-700 hero-card-glow cursor-pointer`
        }
      `}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleBg[hero.primaryRole]} to-transparent border ${roleColors[hero.primaryRole]} flex items-center justify-center text-lg font-bold text-slate-300`}>
          {hero.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100 truncate">{hero.name}</span>
            <TierBadge tier={hero.tier} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <RoleTag role={hero.primaryRole} size="sm" />
            {hero.secondaryRole && (
              <>
                <span className="text-slate-600">/</span>
                <RoleTag role={hero.secondaryRole} size="sm" />
              </>
            )}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{hero.shortDescription}</p>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
        <span>WR {hero.winRate}%</span>
        <span>PR {hero.pickRate}%</span>
        <span>BR {hero.banRate}%</span>
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-950/60 rounded-lg">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold bg-surface-900/80 px-3 py-1 rounded">
            Already Used
          </span>
        </div>
      )}
    </button>
  );
}
