import { useState, useCallback } from 'react';
import type { UserPreferences, Role } from '../types';

const defaultPrefs: UserPreferences = {
  preferredRole: 'Fill',
  comfortHeroes: [],
  excludedHeroes: [],
  mode: 'solo',
};

const STORAGE_KEY = 'mlbb-draft-coach-prefs';

function loadPrefs(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultPrefs;
}

function savePrefs(prefs: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<UserPreferences>(loadPrefs);

  const setPrefs = useCallback((update: Partial<UserPreferences>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...update };
      savePrefs(next);
      return next;
    });
  }, []);

  const setPreferredRole = useCallback((role: Role | 'Fill') => {
    setPrefs({ preferredRole: role });
  }, [setPrefs]);

  const toggleComfortHero = useCallback((heroId: string) => {
    setPrefsState(prev => {
      const next = {
        ...prev,
        comfortHeroes: prev.comfortHeroes.includes(heroId)
          ? prev.comfortHeroes.filter(id => id !== heroId)
          : [...prev.comfortHeroes, heroId],
      };
      savePrefs(next);
      return next;
    });
  }, []);

  const toggleExcludedHero = useCallback((heroId: string) => {
    setPrefsState(prev => {
      const next = {
        ...prev,
        excludedHeroes: prev.excludedHeroes.includes(heroId)
          ? prev.excludedHeroes.filter(id => id !== heroId)
          : [...prev.excludedHeroes, heroId],
      };
      savePrefs(next);
      return next;
    });
  }, []);

  const setMode = useCallback((mode: 'solo' | 'team') => {
    setPrefs({ mode });
  }, [setPrefs]);

  const resetPrefs = useCallback(() => {
    setPrefsState(defaultPrefs);
    savePrefs(defaultPrefs);
  }, []);

  return {
    prefs,
    setPreferredRole,
    toggleComfortHero,
    toggleExcludedHero,
    setMode,
    resetPrefs,
  };
}
