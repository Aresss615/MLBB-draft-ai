import type { DraftState, SelectionTarget, Side } from '../types';
import { getHeroById } from '../data/heroes';
import { RoleTag } from './RoleTag';
import { Plus, X } from 'lucide-react';

interface DraftBoardProps {
  draft: DraftState;
  selectionTarget: SelectionTarget | null;
  onSlotClick: (target: SelectionTarget) => void;
  onRemoveHero: (side: Side, type: 'pick' | 'ban', index: number) => void;
}

const sideColors = {
  ally: {
    accent: 'border-brand-500',
    bg: 'bg-brand-500/10',
    headerBg: 'bg-brand-500/5',
    headerText: 'text-brand-400',
    slotBorder: 'border-brand-500/30 hover:border-brand-500/60',
    activeBorder: 'border-brand-400 ring-2 ring-brand-400/30',
    banBorder: 'border-brand-500/20 hover:border-brand-500/40',
  },
  enemy: {
    accent: 'border-danger',
    bg: 'bg-danger/10',
    headerBg: 'bg-danger/5',
    headerText: 'text-red-400',
    slotBorder: 'border-red-500/30 hover:border-red-500/60',
    activeBorder: 'border-red-400 ring-2 ring-red-400/30',
    banBorder: 'border-red-500/20 hover:border-red-500/40',
  },
};

function PickSlot({
  heroId,
  index,
  side,
  isActive,
  onClick,
  onRemove,
}: {
  heroId: string | null;
  index: number;
  side: Side;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const hero = heroId ? getHeroById(heroId) : null;
  const colors = sideColors[side];

  const roleBg: Record<string, string> = {
    Tank: 'from-blue-500/20',
    Fighter: 'from-orange-500/20',
    Assassin: 'from-red-500/20',
    Mage: 'from-purple-500/20',
    Marksman: 'from-yellow-500/20',
    Support: 'from-emerald-500/20',
  };

  return (
    <div
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
        ${isActive
          ? colors.activeBorder
          : hero
            ? `border-surface-600 bg-gradient-to-r ${hero ? roleBg[hero.primaryRole] : ''} to-transparent hover:border-surface-500`
            : `${colors.slotBorder} bg-surface-800/50`
        }
      `}
      onClick={onClick}
    >
      {hero ? (
        <>
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleBg[hero.primaryRole]} to-surface-800 border border-surface-600 flex items-center justify-center text-lg font-bold text-slate-200`}>
            {hero.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-100 truncate">{hero.name}</div>
            <RoleTag role={hero.primaryRole} size="sm" />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-surface-700 text-slate-500 hover:text-red-400 transition-all"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-surface-600 flex items-center justify-center">
            <Plus size={16} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 font-medium">Pick {index + 1}</div>
            <div className="text-[10px] text-slate-600">Click to select</div>
          </div>
        </>
      )}
    </div>
  );
}

function BanSlot({
  heroId,
  index,
  side,
  isActive,
  onClick,
  onRemove,
}: {
  heroId: string | null;
  index: number;
  side: Side;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const hero = heroId ? getHeroById(heroId) : null;
  const colors = sideColors[side];

  return (
    <div
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
        ${isActive
          ? colors.activeBorder
          : hero
            ? 'border-surface-600 bg-surface-800/80 hover:border-surface-500'
            : `${colors.banBorder} bg-surface-900/50`
        }
      `}
      onClick={onClick}
    >
      {hero ? (
        <>
          <div className="w-7 h-7 rounded-md bg-surface-700 border border-surface-600 flex items-center justify-center text-xs font-bold text-red-400 line-through">
            {hero.name.charAt(0)}
          </div>
          <span className="text-xs text-slate-400 line-through truncate flex-1">{hero.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface-700 text-slate-500 hover:text-red-400 transition-all"
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <>
          <div className="w-7 h-7 rounded-md border border-dashed border-surface-600 flex items-center justify-center">
            <Plus size={12} className="text-slate-600" />
          </div>
          <span className="text-[11px] text-slate-600">Ban {index + 1}</span>
        </>
      )}
    </div>
  );
}

export default function DraftBoard({ draft, selectionTarget, onSlotClick, onRemoveHero }: DraftBoardProps) {
  const isSlotActive = (side: Side, type: 'pick' | 'ban', index: number) =>
    selectionTarget?.side === side && selectionTarget?.type === type && selectionTarget?.index === index;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Ally Side */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 rounded-full bg-brand-500" />
          <h3 className="text-sm font-bold text-brand-400 uppercase tracking-wider">Your Team</h3>
        </div>

        {/* Ally Picks */}
        <div className="space-y-2">
          {draft.allyPicks.map((slot, i) => (
            <PickSlot
              key={`ally-pick-${i}`}
              heroId={slot.heroId}
              index={i}
              side="ally"
              isActive={isSlotActive('ally', 'pick', i)}
              onClick={() => onSlotClick({ side: 'ally', type: 'pick', index: i })}
              onRemove={() => onRemoveHero('ally', 'pick', i)}
            />
          ))}
        </div>

        {/* Ally Bans */}
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Bans</div>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
            {draft.allyBans.map((heroId, i) => (
              <BanSlot
                key={`ally-ban-${i}`}
                heroId={heroId}
                index={i}
                side="ally"
                isActive={isSlotActive('ally', 'ban', i)}
                onClick={() => onSlotClick({ side: 'ally', type: 'ban', index: i })}
                onRemove={() => onRemoveHero('ally', 'ban', i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enemy Side */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 rounded-full bg-danger" />
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Enemy Team</h3>
        </div>

        {/* Enemy Picks */}
        <div className="space-y-2">
          {draft.enemyPicks.map((slot, i) => (
            <PickSlot
              key={`enemy-pick-${i}`}
              heroId={slot.heroId}
              index={i}
              side="enemy"
              isActive={isSlotActive('enemy', 'pick', i)}
              onClick={() => onSlotClick({ side: 'enemy', type: 'pick', index: i })}
              onRemove={() => onRemoveHero('enemy', 'pick', i)}
            />
          ))}
        </div>

        {/* Enemy Bans */}
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Bans</div>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
            {draft.enemyBans.map((heroId, i) => (
              <BanSlot
                key={`enemy-ban-${i}`}
                heroId={heroId}
                index={i}
                side="enemy"
                isActive={isSlotActive('enemy', 'ban', i)}
                onClick={() => onSlotClick({ side: 'enemy', type: 'ban', index: i })}
                onRemove={() => onRemoveHero('enemy', 'ban', i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
