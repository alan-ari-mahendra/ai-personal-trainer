import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    const body = await req.json();

    const { exercises } = body as {
      exercises: Array<{
        exercise_name: string;
        weight_kg: number | null;
        sets: number;
        reps: number;
        rpe: number | null;
        notes: string | null;
      }>;
    };

    if (!exercises || exercises.length === 0) {
      return Response.json(
        { error: 'At least 1 exercise required' },
        { status: 400 },
      );
    }

    const inserted = [];
    for (const ex of exercises) {
      if (!ex.exercise_name?.trim() || !ex.sets || !ex.reps) continue;

      const result = await sql`
        INSERT INTO workouts (user_id, exercise_name, weight_kg, sets, reps, rpe, notes)
        VALUES (${userId}, ${ex.exercise_name.trim()}, ${ex.weight_kg},
                ${ex.sets}, ${ex.reps}, ${ex.rpe}, ${ex.notes})
        RETURNING id, exercise_name, weight_kg, sets, reps, rpe, notes,
                  (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as volume,
                  created_at
      `;
      inserted.push(result[0]);
    }

    return Response.json({ success: true, data: inserted });
  } catch (error) {
    console.error('Save workout error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
