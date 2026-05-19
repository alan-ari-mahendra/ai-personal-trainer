'use client';

import { useState, useCallback } from 'react';
import { parseInput } from '@/lib/actions/parse';
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
        const data = (await parseInput(type, trimmed)) as T;
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
