"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  X,
  Copy
} from "lucide-react";
import { useDailyVocabulary } from "@/hooks/use-daily-vocabulary";
import clsx from "clsx";

// Local User interface
interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  currentStreak?: number;
  xp?: number;
  level?: number;
}

interface DailyVocabProps {
  user: User;
  take?: number;
  compact?: boolean; // reduce spacing & typography
}

interface SessionStats {
  known: number;
  unknown: number;
  favorites: string[]; // korean words
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

const speak = (text: string, lang = "ko-KR") => {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.speak(u);
};

/**
 * DailyVocab component
 * Shortcuts: Space (flip) • Arrow keys (navigate)
 * Prop: compact - tighter layout (smaller fonts, reduced spacing)
 */
const DailyVocab = ({ user, take = 5, compact = false }: DailyVocabProps) => {
  const { vocabulary, loading, error } = useDailyVocabulary(user, take);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [stats, setStats] = useState<SessionStats>(() => loadStats());

  // Ensure currentIndex resets if vocabulary length shrinks
  useEffect(() => {
    if (currentIndex >= (vocabulary?.length ?? 0)) setCurrentIndex(0);
  }, [vocabulary, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setShowBack((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Auto advance
  useEffect(() => {
    if (!autoAdvance || !vocabulary?.length) return;
    const id = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % vocabulary.length);
      setShowBack(false);
    }, 8000);
    return () => clearInterval(id);
  }, [autoAdvance, vocabulary]);

  const next = useCallback(() => {
    if (!vocabulary?.length) return;
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
    setShowBack(false);
  }, [vocabulary]);

  const prev = useCallback(() => {
    if (!vocabulary?.length) return;
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
    setShowBack(false);
  }, [vocabulary]);

  const toggleFavorite = useCallback((word: string) => {
    setStats((s) => {
      const exists = s.favorites.includes(word);
      const updated: SessionStats = {
        ...s,
        favorites: exists ? s.favorites.filter((w) => w !== word) : [...s.favorites, word],
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const markKnown = () => {
    setStats((s) => {
      const updated = { ...s, known: s.known + 1 };
      saveStats(updated);
      return updated;
    });
    next();
  };

  const markUnknown = () => {
    setStats((s) => {
      const updated = { ...s, unknown: s.unknown + 1 };
      saveStats(updated);
      return updated;
    });
    next();
  };

  const resetStats = () => {
    const cleared: SessionStats = { known: 0, unknown: 0, favorites: [] };
    setStats(cleared);
    saveStats(cleared);
  };

  const accuracy = useMemo(() => {
    const total = stats.known + stats.unknown;
    if (!total) return 0;
    return Math.round((stats.known / total) * 100);
  }, [stats]);

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription>Learn a new Korean word every day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive/40">
        <CardHeader>
          <CardTitle>Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription>Learn a new Korean word every day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription>Learn a new Korean word every day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            No vocabulary available. Start learning to see daily words!
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = vocabulary[currentIndex];
  const isFav = stats.favorites.includes(current.korean);

  return (
    <Card
      className={clsx(
        "relative",
        compact ? "mb-4" : "mb-6"
      )}
    >
      <CardHeader
        className={clsx(
          "pb-2",
            compact ? "py-2" : "py-3"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle
              className={clsx(
                "font-semibold flex items-center gap-1",
                compact ? "text-sm" : "text-base"
              )}
            >
              Daily Vocab <span className={clsx("text-muted-foreground", compact ? "text-[10px]" : "text-[11px]")}>일일</span>
            </CardTitle>
            <CardDescription
              className={clsx(
                "leading-tight",
                compact ? "text-[10px]" : "text-[11px]"
              )}
            >
              Space=flip • ←/→ navigate
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={clsx(compact ? "h-6 w-6" : "h-7 w-7")}
                onClick={() => toggleFavorite(current.korean)}
                aria-label="Toggle favorite"
              >
                {isFav ? (
                  <Star className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4", "text-yellow-500 fill-yellow-500")} />
                ) : (
                  <StarOff className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={clsx(
                  compact ? "h-6 w-6" : "h-7 w-7",
                  autoAdvance && "bg-secondary"
                )}
                onClick={() => setAutoAdvance((s) => !s)}
                aria-label="Auto advance"
              >
                <RotateCcw
                  className={clsx(
                    compact ? "h-3.5 w-3.5" : "h-4 w-4",
                    !autoAdvance && "opacity-40"
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={clsx(compact ? "h-6 w-6" : "h-7 w-7")}
                onClick={() => speak(current.korean, "ko-KR")}
                aria-label="Speak"
              >
                <Volume2 className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={clsx(compact ? "h-6 w-6" : "h-7 w-7")}
                onClick={() => navigator?.clipboard?.writeText(current.korean).catch(() => {})}
                aria-label="Copy"
              >
                <Copy className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={clsx(compact ? "h-6 w-6" : "h-7 w-7")}
                onClick={resetStats}
                aria-label="Reset stats"
              >
                <RotateCcw className={clsx(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </Button>
            </div>
            <div
              className={clsx(
                "flex items-center gap-1.5 font-medium",
                compact ? "text-[9px]" : "text-[10px]"
              )}
            >
              <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">{stats.known}</span>
              <span className="px-1 py-0.5 rounded bg-destructive/10 text-destructive">{stats.unknown}</span>
              <span className="px-1 py-0.5 rounded bg-muted">{accuracy}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent
        className={clsx(
          "pt-2",
          compact ? "space-y-3 pb-3" : "space-y-4 pb-4"
        )}
      >
        {/* Progress bar */}
        <div
          className={clsx(
            "w-full bg-muted rounded-full overflow-hidden",
            compact ? "h-1" : "h-1.5"
          )}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
          />
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className={clsx("px-2", compact ? "h-6 text-[10px]" : "h-7 text-[11px]")}
            onClick={prev}
            disabled={vocabulary.length <= 1}
          >
            <ChevronLeft className={clsx(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
            Prev
          </Button>
          <div
            className={clsx(
              "text-muted-foreground font-medium",
              compact ? "text-[10px]" : "text-[11px]"
            )}
          >
            {currentIndex + 1}/{vocabulary.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={clsx("px-2", compact ? "h-6 text-[10px]" : "h-7 text-[11px]")}
            onClick={next}
            disabled={vocabulary.length <= 1}
          >
            Next
            <ChevronRight className={clsx(compact ? "h-3 w-3 ml-0.5" : "h-3.5 w-3.5 ml-0.5")} />
          </Button>
        </div>

        {/* Flip Card */}
        <div
          className={clsx(
            "group relative mx-auto w-full [perspective:1200px]",
            compact ? "aspect-[5/3]" : "aspect-[3/2]"
          )}
        >
          <div
            className={clsx(
              "absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] rounded-lg border",
              showBack && "[transform:rotateY(180deg)]"
            )}
          >
            {/* FRONT */}
            <div
              className={clsx(
                "absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/5 via-background to-primary/10 text-center",
                compact ? "p-3 gap-2" : "p-4 gap-3"
              )}
            >
              <div
                className={clsx(
                  "font-bold tracking-tight text-primary break-words",
                  compact ? "text-2xl" : "text-3xl md:text-4xl"
                )}
              >
                {current.korean}
              </div>
              <div
                className={clsx(
                  "uppercase tracking-wide text-muted-foreground",
                  compact ? "text-[10px]" : "text-[11px]"
                )}
              >
                {current.pos && current.pos.replace("_", " ")} • {current.type}
              </div>
              <div
                className={clsx(
                  "text-muted-foreground",
                  compact ? "text-[9px]" : "text-[10px]"
                )}
              >
                Space / Reveal
              </div>
            </div>
            {/* BACK */}
            <div
              className={clsx(
                "absolute inset-0 [transform:rotateY(180deg)] backface-hidden flex flex-col gap-3 justify-between rounded-lg bg-gradient-to-br from-secondary/20 via-background to-secondary/30",
                compact ? "p-3" : "p-4"
              )}
            >
              <div className={clsx("overflow-auto", compact ? "space-y-2" : "space-y-3")}>
                <div>
                  <div
                    className={clsx(
                      "font-medium text-muted-foreground mb-0.5",
                      compact ? "text-[9px]" : "text-[10px]"
                    )}
                  >
                    Meaning
                  </div>
                  <div className={clsx("font-semibold", compact ? "text-lg" : "text-xl")}>
                    {current.indonesian}
                  </div>
                </div>
                {current.exampleSentences?.length > 0 && (
                  <div>
                    <div
                      className={clsx(
                        "font-medium text-muted-foreground mb-0.5",
                        compact ? "text-[9px]" : "text-[10px]"
                      )}
                    >
                      Examples
                    </div>
                    <ul
                      className={clsx(
                        "leading-snug",
                        compact ? "space-y-1 text-[11px]" : "space-y-1.5 text-xs"
                      )}
                    >
                      {current.exampleSentences.map((s: string, i: number) => (
                        <li key={i} className="pl-2 border-l border-primary/30">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={clsx("flex flex-wrap gap-1.5")}>
                <Button
                  variant="outline"
                  size="sm"
                  className={clsx(
                    "px-2",
                    compact ? "h-6 text-[10px]" : "h-7 text-[11px]"
                  )}
                  onClick={() => speak(current.korean)}
                >
                  <Volume2 className={clsx(compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1")} /> Listen
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={clsx(
                    "px-2",
                    compact ? "h-6 text-[10px]" : "h-7 text-[11px]"
                  )}
                  onClick={markKnown}
                >
                  <Check className={clsx(compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1")} /> Knew
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className={clsx(
                    "px-2",
                    compact ? "h-6 text-[10px]" : "h-7 text-[11px]"
                  )}
                  onClick={markUnknown}
                >
                  <X className={clsx(compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1")} /> Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          <Button
            variant="default"
            size="sm"
            className={clsx(
              compact ? "h-6 px-2 text-[10px]" : "h-7 px-3 text-[11px]"
            )}
            onClick={() => setShowBack((s) => !s)}
          >
            {showBack ? (
              <EyeOff className={clsx(compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1")} />
            ) : (
              <Eye className={clsx(compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1")} />
            )}
            {showBack ? "Front" : "Reveal"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={clsx(
              compact ? "h-6 px-2 text-[10px]" : "h-7 px-3 text-[11px]"
            )}
            onClick={() => {
              setShowBack(false);
              next();
            }}
          >
            Skip
          </Button>
        </div>

        {/* Favorites */}
        {stats.favorites.length > 0 && (
          <div className={clsx("border-t", compact ? "pt-1.5" : "pt-2")}>
            <div className="flex items-center justify-between">
              <div
                className={clsx(
                  "font-medium text-muted-foreground",
                  compact ? "text-[9px]" : "text-[10px]"
                )}
              >
                Favs ({stats.favorites.length})
              </div>
              <div className="flex-1 ml-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5">
                  {stats.favorites.slice(0, compact ? 8 : 10).map((w) => (
                    <span
                      key={w}
                      className={clsx(
                        "px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20 whitespace-nowrap",
                        compact ? "text-[9px]" : "text-[10px]"
                      )}
                    >
                      {w}
                    </span>
                  ))}
                  {stats.favorites.length > (compact ? 8 : 10) && (
                    <span
                      className={clsx(
                        "text-muted-foreground",
                        compact ? "text-[9px]" : "text-[10px]"
                      )}
                    >
                      +{stats.favorites.length - (compact ? 8 : 10)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Accent */}
      {!compact && (
        <div className="pointer-events-none absolute inset-0 rounded-lg opacity-25 [mask-image:radial-gradient(circle_at_center,white,transparent)] bg-[linear-gradient(110deg,transparent,theme(colors.primary/15),transparent)]" />
      )}
    </Card>
  );
};

export default DailyVocab;