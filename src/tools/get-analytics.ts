import { sql } from '@/lib/db';

interface GetAnalyticsInput {
  userId: string;
  period: 'today' | 'week' | 'month';
  metric: 'all' | 'workouts' | 'nutrition' | 'cardio' | 'weight';
}

const WEIGHT_DATE_OFFSETS = {
  today: 0,
  week: 7,
  month: 30,
} as const;

// Separate queries per period to avoid dynamic SQL
async function queryWorkouts(userId: string, period: string) {
  if (period === 'today') {
    return sql`
      SELECT COUNT(*)::int as total_sessions,
             COALESCE(SUM(sets * reps), 0)::int as total_reps,
             COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as total_volume,
             COUNT(DISTINCT exercise_name)::int as unique_exercises,
             MAX(weight_kg)::decimal(6,2) as heaviest_lift
      FROM workouts WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
    `;
  }
  if (period === 'week') {
    return sql`
      SELECT COUNT(*)::int as total_sessions,
             COALESCE(SUM(sets * reps), 0)::int as total_reps,
             COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as total_volume,
             COUNT(DISTINCT exercise_name)::int as unique_exercises,
             MAX(weight_kg)::decimal(6,2) as heaviest_lift
      FROM workouts WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    `;
  }
  return sql`
    SELECT COUNT(*)::int as total_sessions,
           COALESCE(SUM(sets * reps), 0)::int as total_reps,
           COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as total_volume,
           COUNT(DISTINCT exercise_name)::int as unique_exercises,
           MAX(weight_kg)::decimal(6,2) as heaviest_lift
    FROM workouts WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '30 days'
  `;
}

async function queryNutrition(userId: string, period: string) {
  if (period === 'today') {
    return sql`
      SELECT COUNT(*)::int as total_meals,
             COALESCE(SUM(calories), 0)::int as total_calories,
             COALESCE(SUM(protein_g), 0)::decimal(8,1) as total_protein,
             COALESCE(AVG(calories), 0)::decimal(8,1) as avg_per_meal
      FROM meals WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
    `;
  }
  if (period === 'week') {
    return sql`
      SELECT COUNT(*)::int as total_meals,
             COALESCE(SUM(calories), 0)::int as total_calories,
             COALESCE(SUM(protein_g), 0)::decimal(8,1) as total_protein,
             COALESCE(AVG(calories), 0)::decimal(8,1) as avg_per_meal
      FROM meals WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    `;
  }
  return sql`
    SELECT COUNT(*)::int as total_meals,
           COALESCE(SUM(calories), 0)::int as total_calories,
           COALESCE(SUM(protein_g), 0)::decimal(8,1) as total_protein,
           COALESCE(AVG(calories), 0)::decimal(8,1) as avg_per_meal
    FROM meals WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '30 days'
  `;
}

async function queryCardio(userId: string, period: string) {
  if (period === 'today') {
    return sql`
      SELECT COUNT(*)::int as total_sessions,
             COALESCE(SUM(distance_km), 0)::decimal(6,2) as total_distance,
             COALESCE(SUM(duration_min), 0)::int as total_minutes,
             COALESCE(SUM(calories_burned), 0)::int as total_calories_burned
      FROM cardio_logs WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
    `;
  }
  if (period === 'week') {
    return sql`
      SELECT COUNT(*)::int as total_sessions,
             COALESCE(SUM(distance_km), 0)::decimal(6,2) as total_distance,
             COALESCE(SUM(duration_min), 0)::int as total_minutes,
             COALESCE(SUM(calories_burned), 0)::int as total_calories_burned
      FROM cardio_logs WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    `;
  }
  return sql`
    SELECT COUNT(*)::int as total_sessions,
           COALESCE(SUM(distance_km), 0)::decimal(6,2) as total_distance,
           COALESCE(SUM(duration_min), 0)::int as total_minutes,
           COALESCE(SUM(calories_burned), 0)::int as total_calories_burned
    FROM cardio_logs WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '30 days'
  `;
}

export async function getUserAnalytics(input: GetAnalyticsInput) {
  const { userId, period, metric } = input;
  const offset = WEIGHT_DATE_OFFSETS[period];

  try {
    if (metric === 'workouts') {
      const data = await queryWorkouts(userId, period);
      return { metric: 'workouts', period, data: data[0] };
    }

    if (metric === 'nutrition') {
      const data = await queryNutrition(userId, period);
      return { metric: 'nutrition', period, data: data[0] };
    }

    if (metric === 'cardio') {
      const data = await queryCardio(userId, period);
      return { metric: 'cardio', period, data: data[0] };
    }

    if (metric === 'weight') {
      const data = await sql`
        SELECT COUNT(*)::int as entries,
               MIN(weight_kg)::decimal(5,2) as min_weight,
               MAX(weight_kg)::decimal(5,2) as max_weight,
               AVG(weight_kg)::decimal(5,2) as avg_weight,
               (MAX(weight_kg) - MIN(weight_kg))::decimal(5,2) as change_kg
        FROM body_stats
        WHERE user_id = ${userId} AND recorded_at >= CURRENT_DATE - ${offset}
      `;
      return { metric: 'weight', period, data: data[0] };
    }

    // metric === 'all'
    const [workouts, nutrition, cardio, weight] = await Promise.all([
      queryWorkouts(userId, period),
      queryNutrition(userId, period),
      queryCardio(userId, period),
      sql`
        SELECT AVG(weight_kg)::decimal(5,2) as avg_weight
        FROM body_stats WHERE user_id = ${userId} AND recorded_at >= CURRENT_DATE - ${offset}
      `,
    ]);

    return {
      metric: 'all',
      period,
      data: {
        workouts: workouts[0],
        nutrition: nutrition[0],
        cardio: cardio[0],
        weight: weight[0],
      },
    };
  } catch (error) {
    console.error('[TOOL] getUserAnalytics error:', error);
    return { success: false, error: 'Gagal mengambil analytics' };
  }
}
