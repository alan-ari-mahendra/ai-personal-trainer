import { sql } from '@/lib/db';

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
    const result = await sql`
      INSERT INTO workouts (
        user_id,
        exercise_name,
        weight_kg,
        sets,
        reps,
        rpe,
        notes,
        created_at
      ) VALUES (
        ${input.userId},
        ${input.exerciseName},
        ${input.weightKg},
        ${input.sets},
        ${input.reps},
        ${input.rpe},
        ${input.notes},
        NOW()
      )
      RETURNING
        id,
        exercise_name,
        weight_kg,
        sets,
        reps,
        (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as total_volume
    `;

    const saved = result[0];

    return {
      success: true,
      data: {
        id: saved.id,
        exercise: saved.exercise_name,
        weight: saved.weight_kg,
        sets: saved.sets,
        reps: saved.reps,
        volume: Number(saved.total_volume),
      },
    };
  } catch (error) {
    console.error('[TOOL] saveWorkoutLog error:', error);
    return { success: false, error: 'Gagal menyimpan workout' };
  }
}
