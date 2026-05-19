import { db } from '@/lib/db';
import { workouts, meals, cardioLogs, bodyStats } from '@/lib/schema';
import { eq, and, gte, count, sql } from 'drizzle-orm';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateFilter(createdAt: any, period: string) {
  if (period === 'today') {
    return sql`DATE(${createdAt}) = CURRENT_DATE`;
  }
  if (period === 'week') {
    return gte(createdAt, sql`NOW() - INTERVAL '7 days'`);
  }
  return gte(createdAt, sql`NOW() - INTERVAL '30 days'`);
}

async function queryWorkouts(userId: string, period: string) {
  return db.select({
    total_sessions: count(),
    total_reps: sql<number>`COALESCE(SUM(${workouts.sets} * ${workouts.reps}), 0)::int`,
    total_volume: sql<string>`COALESCE(SUM(${workouts.sets} * ${workouts.reps} * COALESCE(${workouts.weightKg}, 0)), 0)::decimal(12,2)`,
    unique_exercises: sql<number>`COUNT(DISTINCT ${workouts.exerciseName})::int`,
    heaviest_lift: sql<string>`MAX(${workouts.weightKg})::decimal(6,2)`,
  }).from(workouts).where(
    and(eq(workouts.userId, userId), dateFilter(workouts.createdAt, period)),
  );
}

async function queryNutrition(userId: string, period: string) {
  return db.select({
    total_meals: count(),
    total_calories: sql<number>`COALESCE(SUM(${meals.calories}), 0)::int`,
    total_protein: sql<string>`COALESCE(SUM(${meals.proteinG}), 0)::decimal(8,1)`,
    avg_per_meal: sql<string>`COALESCE(AVG(${meals.calories}), 0)::decimal(8,1)`,
  }).from(meals).where(
    and(eq(meals.userId, userId), dateFilter(meals.createdAt, period)),
  );
}

async function queryCardio(userId: string, period: string) {
  return db.select({
    total_sessions: count(),
    total_distance: sql<string>`COALESCE(SUM(${cardioLogs.distanceKm}), 0)::decimal(6,2)`,
    total_minutes: sql<number>`COALESCE(SUM(${cardioLogs.durationMin}), 0)::int`,
    total_calories_burned: sql<number>`COALESCE(SUM(${cardioLogs.caloriesBurned}), 0)::int`,
  }).from(cardioLogs).where(
    and(eq(cardioLogs.userId, userId), dateFilter(cardioLogs.createdAt, period)),
  );
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
      const data = await db.select({
        entries: count(),
        min_weight: sql<string>`MIN(${bodyStats.weightKg})::decimal(5,2)`,
        max_weight: sql<string>`MAX(${bodyStats.weightKg})::decimal(5,2)`,
        avg_weight: sql<string>`AVG(${bodyStats.weightKg})::decimal(5,2)`,
        change_kg: sql<string>`(MAX(${bodyStats.weightKg}) - MIN(${bodyStats.weightKg}))::decimal(5,2)`,
      }).from(bodyStats).where(
        and(eq(bodyStats.userId, userId), gte(bodyStats.recordedAt, sql`CURRENT_DATE - ${offset}`)),
      );
      return { metric: 'weight', period, data: data[0] };
    }

    // metric === 'all'
    const [workoutData, nutritionData, cardioData, weightData] = await Promise.all([
      queryWorkouts(userId, period),
      queryNutrition(userId, period),
      queryCardio(userId, period),
      db.select({
        avg_weight: sql<string>`AVG(${bodyStats.weightKg})::decimal(5,2)`,
      }).from(bodyStats).where(
        and(eq(bodyStats.userId, userId), gte(bodyStats.recordedAt, sql`CURRENT_DATE - ${offset}`)),
      ),
    ]);

    return {
      metric: 'all',
      period,
      data: {
        workouts: workoutData[0],
        nutrition: nutritionData[0],
        cardio: cardioData[0],
        weight: weightData[0],
      },
    };
  } catch (error) {
    console.error('[TOOL] getUserAnalytics error:', error);
    return { success: false, error: 'Gagal mengambil analytics' };
  }
}
