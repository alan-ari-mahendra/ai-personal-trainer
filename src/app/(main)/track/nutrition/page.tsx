"use client";

import { useState } from "react";
import { AiInput } from "@/components/track/ai-input";
import { NutritionForm } from "@/components/track/nutrition-form";
import { NutritionHistory } from "@/components/track/nutrition-history";
import { useParse } from "@/hooks/use-parse";
import type { NutritionParseResult } from "@/types/api";

export default function NutritionPage() {
  const { parse, isParsing, error } = useParse<NutritionParseResult>("nutrition");
  const [parseResult, setParseResult] = useState<NutritionParseResult | null>(null);
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
        <h1 className="text-2xl font-bold">Catat Makanan</h1>

        <AiInput
          placeholder='Deskripsikan makanan kamu... misal "saya makan sosis 2 biji dan kentang goreng 100gram"'
          isParsing={isParsing}
          error={error}
          onParse={handleParse}
        />

        {parseResult && (
          <NutritionForm initialData={parseResult} onSave={handleSaved} />
        )}

        <NutritionHistory refreshKey={historyKey} />
      </div>
    </div>
  );
}
