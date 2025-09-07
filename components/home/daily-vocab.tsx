"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Star,
  StarOff,
  RotateCcw,
  Check,
  X,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { useDailyVocabulary } from "@/hooks/use-daily-vocabulary";
import { useLocalStats } from "@/hooks/use-local-stats";
import { useSpeech } from "@/hooks/use-speech";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAutoAdvance } from "@/hooks/use-auto-advance";
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
}

/**
 * DailyVocab (compact-only version)
 * Shortcuts: Space (flip) • Arrow keys (navigate)
 */
const DailyVocab = ({ user, take = 5 }: DailyVocabProps) => {
  const { vocabulary, loading, error } = useDailyVocabulary(user, take);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [autoAdvance] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessResult, setGuessResult] = useState<null | "correct" | "incorrect">(null);
  const [autoFlipping, setAutoFlipping] = useState(false);

  // Custom hooks
  const { stats, incrementKnown, incrementUnknown, toggleFavorite, resetStats } = useLocalStats();
  const { speak } = useSpeech();
  const { disabled: autoFlippingDisabled } = { disabled: autoFlipping };

  // Reset index if data size changes
  useEffect(() => {
    if (currentIndex >= (vocabulary?.length ?? 0)) setCurrentIndex(0);
  }, [vocabulary, currentIndex]);

  // Reset guess when word changes
  useEffect(() => {
    setGuess("");
    setGuessResult(null);
    setShowBack(false);
    setAutoFlipping(false);
  }, [currentIndex, vocabulary]);

  const next = useCallback(() => {
    if (!vocabulary?.length) return;
    setCurrentIndex(prev => (prev + 1) % vocabulary.length);
    setShowBack(false);
  }, [vocabulary]);

  const prev = useCallback(() => {
    if (!vocabulary?.length) return;
    setCurrentIndex(prev => (prev - 1 + vocabulary.length) % vocabulary.length);
    setShowBack(false);
  }, [vocabulary]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: next,
    onPrev: prev,
    onToggleFlip: () => setShowBack(s => !s),
    disabled: autoFlippingDisabled,
  });

  // Auto advance
  useAutoAdvance({
    enabled: autoAdvance,
    vocabulary,
    interval: 8000,
    onAdvance: () => {
      setCurrentIndex(p => (p + 1) % vocabulary!.length);
      setShowBack(false);
    },
  });

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabulary?.length || guessResult) return;
    const correct = normalize(guess) === normalize(current.indonesian);
    if (correct) {
      setGuessResult("correct");
      incrementKnown();
      setAutoFlipping(true);
      setTimeout(() => {
        setShowBack(true);
        setAutoFlipping(false);
      }, 400);
    } else {
      setGuessResult("incorrect");
      incrementUnknown();
      // user can choose to flip; do not auto flip so they can retry mentally / then click
    }
  };

  // Auto advance to next word 3s after a guess (any result)
  useEffect(() => {
    if (!guessResult) return;
    const t = setTimeout(() => {
      setAutoFlipping(false);
      setShowBack(false);
      setGuess("");
      setGuessResult(null);
      next();
    }, 3000);
    return () => clearTimeout(t);
  }, [guessResult, next]);

  const markKnown = () => {
    incrementKnown();
    next();
  };

  const markUnknown = () => {
    incrementUnknown();
    next();
  };

  const accuracy = useMemo(() => {
    const total = stats.known + stats.unknown;
    if (!total) return 0;
    return Math.round((stats.known / total) * 100);
  }, [stats]);

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription className="text-[11px]">Loading todays words...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 border-destructive/40">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription className="text-[11px]">Something went wrong</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive text-xs">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription className="text-[11px]">No words available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-xs">
            Start learning to unlock daily words.
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = vocabulary[currentIndex];
  const isFav = stats.favorites.includes(current.korean);

  return (
    <Card className="relative gap-2 ">
      <CardHeader className="py-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-1">
              Daily Vocab
            </CardTitle>
            <CardDescription className="text-[10px] leading-tight">
              Kosa kata harian
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  toggleFavorite(current.korean);
                  toast("Favorite toggled");
                }}
                aria-label="Toggle favorite"
              >
                {isFav ? (
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  speak(current.korean, "ko-KR");
                  toast("Speak clicked");
                }}
                aria-label="Speak"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  navigator?.clipboard?.writeText(current.korean).catch(() => {});
                  toast("Copied to clipboard");
                }}
                aria-label="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  resetStats();
                  toast("Stats reset");
                }}
                aria-label="Reset stats"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[9px]">
              <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">{stats.known}</span>
              <span className="px-1 py-0.5 rounded bg-destructive/10 text-destructive">{stats.unknown}</span>
              <span className="px-1 py-0.5 rounded bg-muted">{accuracy}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Progress bar */ }
        <div className="w-full bg-muted rounded-full overflow-hidden h-1 mt-0">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
          />
        </div>

        {/* Navigation & index */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={prev}
            disabled={vocabulary.length <= 1 || autoFlipping}
          >
            <ChevronLeft className="h-3 w-3" />
            Prev
          </Button>
          <div className="text-muted-foreground font-medium text-[10px]">
            {currentIndex + 1}/{vocabulary.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={next}
            disabled={vocabulary.length <= 1 || autoFlipping}
          >
            Next
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>


        {/* Flip Card (click to flip) */ }
        <div
          className="group relative mx-auto w-full aspect-[5/3] [perspective:1200px] cursor-pointer select-none"
          onClick={() => setShowBack((s) => !s)}
          role="button"
          aria-pressed={showBack}
        >
          <div
            className={clsx(
              "absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] rounded-lg border",
              showBack && "[transform:rotateY(180deg)]",
              autoFlipping && "pointer-events-none"
            )}
          >
            {/* FRONT */ }
            <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/5 via-background to-primary/10 text-center p-3 gap-2">
              <div className="font-bold tracking-tight text-primary break-words text-2xl">
                {current.korean}
              </div>
              <div className="uppercase tracking-wide text-muted-foreground text-[10px]">
                {current.pos && current.pos.replace("_", " ")} • {current.type}
              </div>
              <div className="text-muted-foreground text-[9px]">
                {guessResult
                  ? "Click to flip"
                  : "Enter guess below (or click to peek)"}
              </div>
            </div>
            {/* BACK */ }
            <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden flex flex-col gap-3 justify-between rounded-lg bg-gradient-to-br from-secondary/20 via-background to-secondary/30 p-3">
              <div className="overflow-auto space-y-2">
                <div>
                  <div className="font-medium text-muted-foreground mb-0.5 text-[9px]">Meaning</div>
                  <div className="font-semibold text-lg">{current.indonesian}</div>
                </div>
                {current.exampleSentences?.length > 0 && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-0.5 text-[9px]">Examples</div>
                    <ul className="leading-snug space-y-1 text-[11px]">
                      {current.exampleSentences.map((s: string, i: number) => (
                        <li key={i} className="pl-2 border-l border-primary/30">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(current.korean);
                  }}
                >
                  <Volume2 className="h-3 w-3 mr-1" /> Listen
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    markKnown();
                  }}
                >
                  <Check className="h-3 w-3 mr-1" /> hafal
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    markUnknown();
                  }}
                >
                  <X className="h-3 w-3 mr-1" /> Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Guess Input (moved below card) */}
        <form onSubmit={handleGuessSubmit} className="space-y-1">
          <div className="flex gap-2">
            <Input
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                if (guessResult) setGuessResult(null);
              }}
              placeholder="Tebak arti..."
              className={clsx(
                "h-7 px-2 text-[11px] text-center",
                guessResult === "correct" && "border-green-500 focus-visible:ring-green-500",
                guessResult === "incorrect" && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={autoFlipping}
            />
            <Button
              type="submit"
              size="sm"
              className="h-7 px-3 text-[11px]"
              disabled={!guess.trim() || autoFlipping}
            >
              Check
            </Button>
          </div>
   
        </form>


        {/* Favorites */ }
        {stats.favorites.length > 0 && (
          <div className="border-t pt-1.5">
            <div className="flex items-center justify-between">
              <div className="font-medium text-muted-foreground text-[9px]">
                Favs ({stats.favorites.length})
              </div>
              <div className="flex-1 ml-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5">
                  {stats.favorites.slice(0, 8).map(w => (
                    <span
                      key={w}
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20 whitespace-nowrap text-[9px]"
                    >
                      {w}
                    </span>
                  ))}
                  {stats.favorites.length > 8 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{stats.favorites.length - 8}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyVocab;