import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onToggleFlip?: () => void;
  disabled?: boolean;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const { onNext, onPrev, onToggleFlip, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === " " && onToggleFlip) {
        e.preventDefault();
        onToggleFlip();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onToggleFlip, disabled]);
};