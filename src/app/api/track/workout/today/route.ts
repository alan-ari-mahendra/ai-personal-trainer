import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);

    const workouts = await sql`
      SELECT id, exercise_name, weight_kg, sets, reps, rpe, notes,
             (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as volume,
             created_at
      FROM workouts
      WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at ASC
    `;

    const totalVolume = workouts.reduce(
      (sum, w) => sum + Number(w.volume || 0),
      0,
    );

    return Response.json({ data: workouts, totalVolume });
  } catch (error) {
    console.error('Workout today error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
