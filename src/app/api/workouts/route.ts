import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    const workouts = await sql`
      SELECT id, exercise_name, weight_kg, sets, reps, duration_min, notes, rpe, created_at
      FROM workouts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return Response.json({ data: workouts });
  } catch (error) {
    console.error('Workouts list error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
