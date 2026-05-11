'use client';

import { useState, useCallback } from 'react';
import type { ParseType, ParseResult } from '@/types/api';

interface UseParseReturn<T extends ParseResult> {
  parse: (input: string) => Promise<T | null>;
  isParsing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useParse<T extends ParseResult>(type: ParseType): UseParseReturn<T> {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(
    async (input: string): Promise<T | null> => {
      const trimmed = input.trim();
      if (!trimmed) {
        setError('Input tidak boleh kosong');
        return null;
      }

      setIsParsing(true);
      setError(null);

      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, input: trimmed }),
          credentials: 'include',
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Server error: ${res.status}`);
        }

        const data = (await res.json()) as T;
        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Gagal parse input';
        setError(msg);
        return null;
      } finally {
        setIsParsing(false);
      }
    },
    [type],
  );

  const clearError = useCallback(() => setError(null), []);

  return { parse, isParsing, error, clearError };
}
