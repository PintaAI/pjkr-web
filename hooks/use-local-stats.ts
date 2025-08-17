import { useState, useEffect, useCallback } from "react";

interface SessionStats {
  known: number;
  unknown: number;
  favorites: string[];
}

const LS_KEY = "dailyVocabStats";

const loadStats = (): SessionStats => {
  if (typeof window === "undefined") return { known: 0, unknown: 0, favorites: [] };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { known: 0, unknown: 0, favorites: [] };
    return JSON.parse(raw);
  } catch {
    return { known: 0, unknown: 0, favorites: [] };
  }
};

const saveStats = (stats: SessionStats) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(stats));
};

export const useLocalStats = () => {
  const [stats, setStats] = useState<SessionStats>(() => loadStats());

  const incrementKnown = useCallback(() => {
    setStats(s => {
      const updated = { ...s, known: s.known + 1 };
      saveStats(updated);
      return updated;
    });
  }, []);

  const incrementUnknown = useCallback(() => {
    setStats(s => {
      const updated = { ...s, unknown: s.unknown + 1 };
      saveStats(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((word: string) => {
    setStats(s => {
      const exists = s.favorites.includes(word);
      const updated: SessionStats = {
        ...s,
        favorites: exists ? s.favorites.filter(w => w !== word) : [...s.favorites, word],
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const resetStats = useCallback(() => {
    const cleared: SessionStats = { known: 0, unknown: 0, favorites: [] };
    setStats(cleared);
    saveStats(cleared);
  }, []);

  return {
    stats,
    incrementKnown,
    incrementUnknown,
    toggleFavorite,
    resetStats,
  };
};