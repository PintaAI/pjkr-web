import { useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
}

export function useDebouncedAutoSave({ delay = 1000, onSave, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string | null>(null);

  const debouncedSave = useCallback(
    (data: any) => {
      if (!enabled) return;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only save if data has actually changed
      const dataString = JSON.stringify(data);
      if (lastDataRef.current === dataString) {
        return;
      }

      lastDataRef.current = dataString;

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        try {
          await onSave(data);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, delay);
    },
    [delay, onSave, enabled]
  );

  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, cancelAutoSave };
}