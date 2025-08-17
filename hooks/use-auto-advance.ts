import { useEffect, } from "react";

interface UseAutoAdvanceOptions {
  enabled: boolean;
  vocabulary?: any[];
  interval?: number;
  onAdvance?: () => void;
}

export const useAutoAdvance = (options: UseAutoAdvanceOptions) => {
  const { enabled, vocabulary, interval = 8000, onAdvance } = options;

  useEffect(() => {
    if (!enabled || !vocabulary?.length) return;

    const id = setInterval(() => {
      onAdvance?.();
    }, interval);

    return () => clearInterval(id);
  }, [enabled, vocabulary, interval, onAdvance]);
};