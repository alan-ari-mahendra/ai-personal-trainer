'use client';

import { useState } from 'react';
import { AiInput } from '@/components/track/ai-input';
import { WorkoutForm } from '@/components/track/workout-form';
import { WorkoutHistory } from '@/components/track/workout-history';
import { useParse } from '@/hooks/use-parse';
import type { WorkoutParseResult } from '@/types/api';

export default function WorkoutPage() {
  const { parse, isParsing, error } = useParse<WorkoutParseResult>('workout');
  const [parseResult, setParseResult] = useState<WorkoutParseResult | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  async function handleParse(input: string) {
    const result = await parse(input);
    if (result) setParseResult(result);
  }

  function handleSaved() {
    setParseResult(null);
    setHistoryKey((k) => k + 1);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Catat Latihan</h1>

        <AiInput
          placeholder='Deskripsikan latihan kamu... misal "bench press 4x12 80kg, squat 3x10 60kg"'
          isParsing={isParsing}
          error={error}
          onParse={handleParse}
        />

        {parseResult && (
          <WorkoutForm initialData={parseResult} onSave={handleSaved} />
        )}

        <WorkoutHistory refreshKey={historyKey} />
      </div>
    </div>
  );
}
