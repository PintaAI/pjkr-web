"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  RotateCcw,
  Check,
  X,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { useDailySoal } from "@/hooks/use-daily-soal";
import { useLocalStats } from "@/hooks/use-local-stats";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
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

interface DailySoalProps {
  user: User;
  take?: number;
}




/**
 * DailySoal (daily quiz practice)
 * Shortcuts: Arrow keys (navigate) • Enter (submit/next)
 */
const DailySoal = ({ user, take = 5 }: DailySoalProps) => {
  const { soal, loading, error } = useDailySoal(user, take);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpsi, setSelectedOpsi] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerResult, setAnswerResult] = useState<null | "correct" | "incorrect">(null);

  // Custom hooks
  const { stats, incrementKnown, incrementUnknown, toggleFavorite, resetStats } = useLocalStats();

  // Reset index if data size changes
  useEffect(() => {
    if (currentIndex >= (soal?.length ?? 0)) setCurrentIndex(0);
  }, [soal, currentIndex]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOpsi(null);
    setShowExplanation(false);
    setAnswerResult(null);
  }, [currentIndex, soal]);

  const next = useCallback(() => {
    if (!soal?.length) return;
    setCurrentIndex(prev => (prev + 1) % soal.length);
  }, [soal]);

  const prev = useCallback(() => {
    if (!soal?.length) return;
    setCurrentIndex(prev => (prev - 1 + soal.length) % soal.length);
  }, [soal]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: next,
    onPrev: prev,
    onToggleFlip: () => setShowExplanation(s => !s),
    disabled: false,
  });

  const handleOpsiSelect = (opsiId: number) => {
    if (answerResult) return; // Prevent changing after answer
    setSelectedOpsi(opsiId);
  };

  const handleSubmitAnswer = () => {
    if (!soal?.length || selectedOpsi === null || answerResult) return;

    const current = soal[currentIndex];
    const selectedOpsiObj = current.opsis.find(o => o.id === selectedOpsi);
    
    if (selectedOpsiObj?.isCorrect) {
      setAnswerResult("correct");
      incrementKnown();
      setShowExplanation(true);
    } else {
      setAnswerResult("incorrect");
      incrementUnknown();
      setShowExplanation(true);
    }
  };

  // Auto advance to next question 3s after answering
  useEffect(() => {
    if (!answerResult) return;
    const t = setTimeout(() => {
      setShowExplanation(false);
      setSelectedOpsi(null);
      setAnswerResult(null);
      next();
    }, 3000);
    return () => clearTimeout(t);
  }, [answerResult, next]);

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
          <CardTitle className="text-sm">Daily Soal (일일 문제)</CardTitle>
          <CardDescription className="text-[11px]">Loading todays questions...</CardDescription>
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
          <CardTitle className="text-sm">Daily Soal (일일 문제)</CardTitle>
          <CardDescription className="text-[11px]">Something went wrong</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive text-xs">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!soal || soal.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Daily Soal (일일 문제)</CardTitle>
          <CardDescription className="text-[11px]">No questions available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-xs">
            Join a class or create questions to practice.
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = soal[currentIndex];
  const isFav = stats.favorites.includes(current.pertanyaan);

  return (
    <Card className="relative gap-2">
      <CardHeader className="py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-1">
              Daily Soal
            </CardTitle>
            <CardDescription className="text-[10px] leading-tight">
              Latihan soal harian
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  toggleFavorite(current.pertanyaan);
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
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full overflow-hidden h-1 mt-0">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / soal.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 inset-y-0 h-full px-1 text-[10px] flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
            onClick={prev}
            disabled={soal.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-[8px]">Prev</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 inset-y-0 h-full px-1 text-[10px] flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
            onClick={next}
            disabled={soal.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="text-[8px]">Next</span>
          </Button>

          <div className="mx-auto px-4">
            {/* Question */}
            <div className="text-center mb-3">
              {current.difficulty && (
                <span className={clsx(
                  "inline-block px-2 py-0.5 rounded-full text-[9px] font-medium mb-2",
                  current.difficulty === "BEGINNER" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  current.difficulty === "INTERMEDIATE" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  current.difficulty === "ADVANCED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {current.difficulty}
                </span>
              )}
              <div className="font-bold text-base leading-snug">
                {current.pertanyaan}
              </div>
              {current.koleksiSoal && (
                <div className="text-muted-foreground text-[10px] mt-1">
                  {current.koleksiSoal.nama}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-1.5">
              {current.opsis.map((opsi) => (
                <button
                  key={opsi.id}
                  type="button"
                  onClick={() => handleOpsiSelect(opsi.id)}
                  disabled={answerResult !== null}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg border text-[11px] transition-all",
                    "hover:bg-muted/50 disabled:cursor-not-allowed",
                    selectedOpsi === opsi.id && "border-primary bg-primary/5",
                    answerResult === "correct" && opsi.isCorrect && "border-green-500 bg-green-500/10",
                    answerResult === "incorrect" && selectedOpsi === opsi.id && !opsi.isCorrect && "border-destructive bg-destructive/10",
                    answerResult === "incorrect" && opsi.isCorrect && "border-green-500 bg-green-500/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px]">
                      {opsi.order + 1}
                    </span>
                    <span>{opsi.opsiText}</span>
                    {answerResult && opsi.isCorrect && (
                      <Check className="h-3 w-3 ml-auto text-green-500" />
                    )}
                    {answerResult === "incorrect" && selectedOpsi === opsi.id && !opsi.isCorrect && (
                      <X className="h-3 w-3 ml-auto text-destructive" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            {selectedOpsi !== null && answerResult === null && (
              <Button
                onClick={handleSubmitAnswer}
                className="w-full mt-3 h-8 text-[11px]"
                size="sm"
              >
                Submit Answer
              </Button>
            )}

            {/* Explanation */}
            {showExplanation && current.explanation && (
              <div className={clsx(
                "mt-3 p-2 rounded-lg text-[10px] leading-snug",
                answerResult === "correct" ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
              )}>
                <div className="flex items-start gap-1.5">
                  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-0.5">Penjelasan:</div>
                    <div className="text-muted-foreground">{current.explanation}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {answerResult && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 text-[10px] flex-1"
                  onClick={markUnknown}
                >
                  <X className="h-3 w-3 mr-1" /> Review
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 px-2 text-[10px] flex-1"
                  onClick={markKnown}
                >
                  <Check className="h-3 w-3 mr-1" /> Paham
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Favorites */}
        {stats.favorites.length > 0 && (
          <div className="border-t pt-1.5">
            <div className="flex items-center justify-between">
              <div className="font-medium text-muted-foreground text-[9px]">
                Favs ({stats.favorites.length})
              </div>
              <div className="flex-1 ml-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5">
                  {stats.favorites.slice(0, 8).map(q => (
                    <span
                      key={q}
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20 whitespace-nowrap text-[9px] truncate max-w-24"
                      title={q}
                    >
                      {q.length > 15 ? q.slice(0, 15) + '...' : q}
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

export default DailySoal;
