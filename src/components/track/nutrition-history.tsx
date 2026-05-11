"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NutritionHistoryProps {
  refreshKey: number;
}

interface NutritionEntry {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  portion_size: string;
  created_at: string;
}

const MEAL_LABELS: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: "\u{1F305}", label: "Breakfast" },
  lunch: { emoji: "\u{1F31E}", label: "Lunch" },
  snack: { emoji: "\u{1F36A}", label: "Snack" },
  dinner: { emoji: "\u{1F319}", label: "Dinner" },
};

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NutritionHistory({ refreshKey }: NutritionHistoryProps) {
  const [grouped, setGrouped] = useState<Record<string, NutritionEntry[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/track/nutrition/today");
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        if (!cancelled) setGrouped(json.data);
      } catch {
        if (!cancelled) setGrouped(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-muted/50"
          />
        ))}
      </div>
    );
  }

  const hasData =
    grouped && Object.values(grouped).some((entries) => entries.length > 0);

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Belum ada catatan hari ini
        </CardContent>
      </Card>
    );
  }

  const sortedMealTypes = MEAL_ORDER.filter(
    (type) => grouped![type] && grouped![type].length > 0,
  );

  return (
    <div className="space-y-3">
      {sortedMealTypes.map((mealType) => {
        const entries = grouped![mealType];
        const meta = MEAL_LABELS[mealType] ?? {
          emoji: "",
          label: mealType,
        };
        const firstTime = entries[0]?.created_at;

        return (
          <Card key={mealType}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {meta.emoji} {meta.label}
                </CardTitle>
                {firstTime && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(firstTime)}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-1.5">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate pr-2">{entry.food_name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {entry.calories != null && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.calories} kcal
                      </Badge>
                    )}
                    {entry.protein_g != null && (
                      <span className="text-xs text-muted-foreground">
                        {entry.protein_g}g P
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
