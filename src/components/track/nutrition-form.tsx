"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveNutrition } from "@/lib/actions/track";
import type { NutritionItem, NutritionParseResult } from "@/types/api";

interface NutritionFormProps {
  initialData: NutritionParseResult;
  onSave: () => void;
}

const MEAL_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
] as const;

function emptyItem(): NutritionItem {
  return {
    food_name: "",
    portion_size: "",
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  };
}

export function NutritionForm({ initialData, onSave }: NutritionFormProps) {
  const [mealType, setMealType] = useState(initialData.meal_type);
  const [items, setItems] = useState<NutritionItem[]>(initialData.items);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMealType(initialData.meal_type);
    setItems(initialData.items);
  }, [initialData]);

  const updateItem = useCallback(
    (index: number, field: keyof NutritionItem, value: string) => {
      setItems((prev) => {
        const next = [...prev];
        const item = { ...next[index] };

        if (field === "food_name" || field === "portion_size") {
          (item[field] as string) = value;
        } else {
          (item[field] as number | null) =
            value === "" ? null : Number(value);
        }

        next[index] = item;
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, emptyItem()]);
  }, []);

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories ?? 0),
      protein: acc.protein + (item.protein_g ?? 0),
      carbs: acc.carbs + (item.carbs_g ?? 0),
      fat: acc.fat + (item.fat_g ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveNutrition({ meal_type: mealType, items });
      if (result.success) {
        onSave();
      }
    } catch {
      // TODO: surface error to user
    } finally {
      setIsSaving(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Review & Edit</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meal type selector */}
        <div className="space-y-1.5">
          <Label htmlFor="meal-type">Meal Type</Label>
          <select
            id="meal-type"
            value={mealType}
            onChange={(e) =>
              setMealType(
                e.target.value as NutritionParseResult["meal_type"],
              )
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {MEAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Item list */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {idx + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Row 1: food name + portion */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  placeholder="Food name"
                  value={item.food_name}
                  onChange={(e) =>
                    updateItem(idx, "food_name", e.target.value)
                  }
                />
                <Input
                  placeholder="Portion"
                  className="w-28"
                  value={item.portion_size}
                  onChange={(e) =>
                    updateItem(idx, "portion_size", e.target.value)
                  }
                />
              </div>

              {/* Row 2: macros */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">kcal</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.calories ?? ""}
                    onChange={(e) =>
                      updateItem(idx, "calories", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Protein (g)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.protein_g ?? ""}
                    onChange={(e) =>
                      updateItem(idx, "protein_g", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Carbs (g)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.carbs_g ?? ""}
                    onChange={(e) =>
                      updateItem(idx, "carbs_g", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Fat (g)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.fat_g ?? ""}
                    onChange={(e) =>
                      updateItem(idx, "fat_g", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add item */}
        <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Tambah Item
        </Button>

        {/* Totals */}
        <div className="flex flex-wrap gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
          <Badge variant="secondary">Total: {totals.calories} kcal</Badge>
          <Badge variant="secondary">{totals.protein}g P</Badge>
          <Badge variant="secondary">{totals.carbs}g C</Badge>
          <Badge variant="secondary">{totals.fat}g F</Badge>
        </div>

        {/* Save */}
        <Button className="w-full" disabled={isSaving} onClick={handleSave}>
          {isSaving ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <Save className="h-4 w-4" data-icon="inline-start" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}
