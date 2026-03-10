import { useState, useCallback, useMemo } from 'react';
import type { DraftState, DraftSlot, SelectionTarget, Side } from '../types';
import { getAllUsedIds } from '../data/heroes';

const emptySlot = (): DraftSlot => ({ heroId: null });

const initialDraft: DraftState = {
  allyPicks: Array.from({ length: 5 }, emptySlot),
  enemyPicks: Array.from({ length: 5 }, emptySlot),
  allyBans: Array.from({ length: 5 }, () => null),
  enemyBans: Array.from({ length: 5 }, () => null),
};

export function useDraft() {
  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [selectionTarget, setSelectionTarget] = useState<SelectionTarget | null>(null);

  const usedHeroIds = useMemo(() => getAllUsedIds(draft), [draft]);

  const setHero = useCallback((target: SelectionTarget, heroId: string) => {
    setDraft(prev => {
      const next = { ...prev };
      if (target.type === 'pick') {
        const side = target.side === 'ally' ? 'allyPicks' : 'enemyPicks';
        next[side] = [...prev[side]];
        next[side][target.index] = { ...prev[side][target.index], heroId };
      } else {
        const side = target.side === 'ally' ? 'allyBans' : 'enemyBans';
        next[side] = [...prev[side]];
        next[side][target.index] = heroId;
      }
      return next;
    });
    setSelectionTarget(null);
  }, []);

  const removeHero = useCallback((side: Side, type: 'pick' | 'ban', index: number) => {
    setDraft(prev => {
      const next = { ...prev };
      if (type === 'pick') {
        const key = side === 'ally' ? 'allyPicks' : 'enemyPicks';
        next[key] = [...prev[key]];
        next[key][index] = { ...prev[key][index], heroId: null };
      } else {
        const key = side === 'ally' ? 'allyBans' : 'enemyBans';
        next[key] = [...prev[key]];
        next[key][index] = null;
      }
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(initialDraft);
    setSelectionTarget(null);
  }, []);

  const openSelector = useCallback((target: SelectionTarget) => {
    setSelectionTarget(target);
  }, []);

  const closeSelector = useCallback(() => {
    setSelectionTarget(null);
  }, []);

  return {
    draft,
    selectionTarget,
    usedHeroIds,
    setHero,
    removeHero,
    resetDraft,
    openSelector,
    closeSelector,
  };
}
