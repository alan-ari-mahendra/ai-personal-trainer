import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);

    const [workoutStats, nutritionStats, cardioStats, latestWeight] =
      await Promise.all([
        sql`
          SELECT COUNT(*)::int as count,
                 COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as volume
          FROM workouts
          WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
        `,
        sql`
          SELECT COALESCE(SUM(calories), 0)::int as calories,
                 COALESCE(SUM(protein_g), 0)::decimal(8,1) as protein
          FROM meals
          WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
        `,
        sql`
          SELECT COUNT(*)::int as sessions,
                 COALESCE(SUM(duration_min), 0)::int as total_min
          FROM cardio_logs
          WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
        `,
        sql`
          SELECT weight_kg, recorded_at
          FROM body_stats
          WHERE user_id = ${userId}
          ORDER BY recorded_at DESC LIMIT 1
        `,
      ]);

    return Response.json({
      weeklyWorkouts: workoutStats[0],
      todayNutrition: nutritionStats[0],
      weeklyCardio: cardioStats[0],
      latestWeight: latestWeight[0] ?? null,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
