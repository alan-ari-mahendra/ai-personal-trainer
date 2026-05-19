'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkoutToday } from '@/lib/actions/track';

interface WorkoutEntry {
  id: number;
  exerciseName: string;
  weightKg: string | null;
  sets: number;
  reps: number;
  rpe: number | null;
  volume: string;
  createdAt: Date | null;
}

interface WorkoutHistoryProps {
  refreshKey: number;
}

export function WorkoutHistory({ refreshKey }: WorkoutHistoryProps) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWorkoutToday()
      .then((res) => {
        setWorkouts((res.data ?? []) as WorkoutEntry[]);
        setTotalVolume(res.totalVolume ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Latihan Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada latihan hari ini
          </p>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{w.exerciseName}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    — {w.sets}×{w.reps}
                    {w.weightKg ? ` @ ${w.weightKg}kg` : ''}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Number(w.volume).toLocaleString()} kg
                </span>
              </div>
            ))}
            <div className="border-t pt-2 text-right text-sm font-medium">
              Total: {totalVolume.toLocaleString()} kg
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
