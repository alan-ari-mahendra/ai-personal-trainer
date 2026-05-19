import { db } from '@/lib/db';
import { workouts } from '@/lib/schema';

interface SaveWorkoutInput {
  userId: string;
  exerciseName: string;
  weightKg: number | null;
  sets: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
}

export async function saveWorkoutLog(input: SaveWorkoutInput) {
  try {
    const result = await db.insert(workouts).values({
      userId: input.userId,
      exerciseName: input.exerciseName,
      weightKg: input.weightKg?.toString() ?? null,
      sets: input.sets,
      reps: input.reps,
      rpe: input.rpe,
      notes: input.notes,
    }).returning();

    const saved = result[0];
    const volume = saved.sets * saved.reps * (Number(saved.weightKg) || 0);

    return {
      success: true,
      data: {
        id: saved.id,
        exercise: saved.exerciseName,
        weight: saved.weightKg,
        sets: saved.sets,
        reps: saved.reps,
        volume: Number(volume.toFixed(2)),
      },
    };
  } catch (error) {
    console.error('[TOOL] saveWorkoutLog error:', error);
    return { success: false, error: 'Gagal menyimpan workout' };
  }
}
