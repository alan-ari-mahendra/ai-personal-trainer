"use client";

import { useState, useEffect } from "react";
import { getNutritionToday } from "@/lib/actions/track";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NutritionHistoryProps {
  refreshKey: number;
}

interface NutritionEntry {
  id: number;
  mealType: string;
  foodName: string;
  calories: number | null;
  proteinG: string | null;
  carbsG: string | null;
  fatG: string | null;
  portionSize: string | null;
  createdAt: Date | null;
}

const MEAL_LABELS: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: "\u{1F305}", label: "Breakfast" },
  lunch: { emoji: "\u{1F31E}", label: "Lunch" },
  snack: { emoji: "\u{1F36A}", label: "Snack" },
  dinner: { emoji: "\u{1F319}", label: "Dinner" },
};

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
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
        const data = await getNutritionToday();
        if (!cancelled) setGrouped(data as Record<string, NutritionEntry[]>);
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
        const firstTime = entries[0]?.createdAt;

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
                  <span className="truncate pr-2">{entry.foodName}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {entry.calories != null && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.calories} kcal
                      </Badge>
                    )}
                    {entry.proteinG != null && (
                      <span className="text-xs text-muted-foreground">
                        {entry.proteinG}g P
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
