'use server';

import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function getOverview() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const userId = session.userId;

  const [workoutStats, nutritionStats, cardioStats, latestWeight] = await Promise.all([
    sql`
      SELECT COUNT(*)::int as count,
             COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as volume
      FROM workouts WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    `,
    sql`
      SELECT COALESCE(SUM(calories), 0)::int as calories,
             COALESCE(SUM(protein_g), 0)::decimal(8,1) as protein
      FROM meals WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
    `,
    sql`
      SELECT COUNT(*)::int as sessions,
             COALESCE(SUM(duration_min), 0)::int as total_min
      FROM cardio_logs WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    `,
    sql`
      SELECT weight_kg, recorded_at
      FROM body_stats WHERE user_id = ${userId}
      ORDER BY recorded_at DESC LIMIT 1
    `,
  ]);

  return {
    weeklyWorkouts: workoutStats[0],
    todayNutrition: nutritionStats[0],
    weeklyCardio: cardioStats[0],
    latestWeight: latestWeight[0] ?? null,
  };
}

export async function getChartData(type: string, days: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const userId = session.userId;
  const safeDays = Math.min(days, 365);

  if (type === 'weight') {
    return sql`
      SELECT recorded_at as date, weight_kg::decimal(5,2) as value
      FROM body_stats WHERE user_id = ${userId} AND recorded_at >= CURRENT_DATE - ${safeDays}
      ORDER BY recorded_at ASC
    `;
  }

  if (type === 'calories') {
    return sql`
      SELECT DATE(created_at)::text as date, COALESCE(SUM(calories), 0)::int as value
      FROM meals WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '1 day' * ${safeDays}
      GROUP BY DATE(created_at) ORDER BY date ASC
    `;
  }

  // Default: workout volume
  return sql`
    SELECT DATE(created_at)::text as date,
           COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as value
    FROM workouts WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '1 day' * ${safeDays}
    GROUP BY DATE(created_at) ORDER BY date ASC
  `;
}
