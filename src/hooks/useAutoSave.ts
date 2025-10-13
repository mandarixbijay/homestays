import { useCallback, useEffect, useRef } from "react";

type Options = {
  key: string;
  data: any;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (err?: any) => void;
};

export function useAutoSave({ key, data, debounceMs = 2000, onSaveStart, onSaveSuccess, onSaveError }: Options) {
  const timer = useRef<number | null>(null);
  const lastSaved = useRef<any>(null);

  const save = useCallback(async () => {
    try {
      onSaveStart?.();
      // By default, we persist to localStorage as a draft backup. Replace this with server autosave when needed.
      localStorage.setItem(`autosave:${key}`, JSON.stringify({ data, savedAt: new Date().toISOString() }));
      lastSaved.current = data;
      onSaveSuccess?.();
    } catch (err) {
      console.error("Autosave failed", err);
      onSaveError?.(err);
    }
  }, [data, key, onSaveStart, onSaveSuccess, onSaveError]);

  useEffect(() => {
    if (JSON.stringify(lastSaved.current) === JSON.stringify(data)) {
      return;
    }
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      save();
    }, debounceMs);
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
  }, [data, debounceMs, save]);

}