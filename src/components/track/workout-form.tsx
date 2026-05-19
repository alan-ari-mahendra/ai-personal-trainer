'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveWorkout } from '@/lib/actions/track';
import type { WorkoutParseResult, WorkoutExercise } from '@/types/api';

interface WorkoutFormProps {
  initialData: WorkoutParseResult;
  onSave: () => void;
}

const EMPTY_EXERCISE: WorkoutExercise = {
  exercise_name: '',
  sets: 1,
  reps: 1,
  weight_kg: null,
  rpe: null,
  notes: null,
};

export function WorkoutForm({ initialData, onSave }: WorkoutFormProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData.exercises.length > 0) {
      setExercises([...initialData.exercises]);
    }
  }, [initialData]);

  function updateExercise(index: number, field: keyof WorkoutExercise, value: string) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        if (field === 'exercise_name' || field === 'notes') {
          return { ...ex, [field]: value };
        }
        const num = value === '' ? null : Number(value);
        return { ...ex, [field]: num };
      }),
    );
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addExercise() {
    setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }]);
  }

  const totalVolume = exercises.reduce(
    (sum, ex) => sum + (ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0),
    0,
  );

  async function handleSave() {
    const valid = exercises.filter((ex) => ex.exercise_name.trim() && ex.sets && ex.reps);
    if (valid.length === 0) return;

    setSaving(true);
    try {
      const result = await saveWorkout({ exercises: valid });
      if (result.success) {
        setExercises([]);
        onSave();
      }
    } finally {
      setSaving(false);
    }
  }

  if (exercises.length === 0) return null;

  return (
    <div className="space-y-4 rounded-xl border p-4">
      {exercises.map((ex, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Exercise {i + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => removeExercise(i)}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nama</Label>
              <Input
                value={ex.exercise_name}
                onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                placeholder="Bench Press"
              />
            </div>
            <div>
              <Label className="text-xs">Beban (kg)</Label>
              <Input
                type="number"
                value={ex.weight_kg ?? ''}
                onChange={(e) => updateExercise(i, 'weight_kg', e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-xs">Set</Label>
              <Input
                type="number"
                value={ex.sets ?? ''}
                onChange={(e) => updateExercise(i, 'sets', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Rep</Label>
              <Input
                type="number"
                value={ex.reps ?? ''}
                onChange={(e) => updateExercise(i, 'reps', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">RPE</Label>
              <Input
                type="number"
                value={ex.rpe ?? ''}
                onChange={(e) => updateExercise(i, 'rpe', e.target.value)}
                placeholder="—"
                min={1}
                max={10}
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input
                value={ex.notes ?? ''}
                onChange={(e) => updateExercise(i, 'notes', e.target.value)}
                placeholder="—"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addExercise} className="w-full">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Tambah Exercise
      </Button>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium">
          Total Volume:{' '}
          <span className="text-primary">{totalVolume.toLocaleString()} kg</span>
        </span>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Simpan
        </Button>
      </div>
    </div>
  );
}
