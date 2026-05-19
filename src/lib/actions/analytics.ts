'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { workouts, meals, cardioLogs, bodyStats } from '@/lib/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function getOverview() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const userId = session.userId;

  const [workoutStats, nutritionStats, cardioStats, latestWeight] = await Promise.all([
    db.select({
      count: sql<number>`COUNT(*)::int`,
      volume: sql<string>`COALESCE(SUM(${workouts.sets} * ${workouts.reps} * COALESCE(${workouts.weightKg}, 0)), 0)::decimal(12,2)`,
    }).from(workouts).where(
      and(eq(workouts.userId, userId), sql`${workouts.createdAt} >= NOW() - INTERVAL '7 days'`)
    ),
    db.select({
      calories: sql<number>`COALESCE(SUM(${meals.calories}), 0)::int`,
      protein: sql<string>`COALESCE(SUM(${meals.proteinG}), 0)::decimal(8,1)`,
    }).from(meals).where(
      and(eq(meals.userId, userId), sql`DATE(${meals.createdAt}) = CURRENT_DATE`)
    ),
    db.select({
      sessions: sql<number>`COUNT(*)::int`,
      totalMin: sql<number>`COALESCE(SUM(${cardioLogs.durationMin}), 0)::int`,
    }).from(cardioLogs).where(
      and(eq(cardioLogs.userId, userId), sql`${cardioLogs.createdAt} >= NOW() - INTERVAL '7 days'`)
    ),
    db.select({
      weightKg: bodyStats.weightKg,
      recordedAt: bodyStats.recordedAt,
    }).from(bodyStats).where(eq(bodyStats.userId, userId)).orderBy(desc(bodyStats.recordedAt)).limit(1),
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
    return db.select({
      date: bodyStats.recordedAt,
      value: sql<string>`${bodyStats.weightKg}::decimal(5,2)`,
    }).from(bodyStats).where(
      and(eq(bodyStats.userId, userId), sql`${bodyStats.recordedAt} >= CURRENT_DATE - ${safeDays}`)
    ).orderBy(bodyStats.recordedAt);
  }

  if (type === 'calories') {
    return db.select({
      date: sql<string>`DATE(${meals.createdAt})::text`,
      value: sql<number>`COALESCE(SUM(${meals.calories}), 0)::int`,
    }).from(meals).where(
      and(eq(meals.userId, userId), sql`${meals.createdAt} >= NOW() - INTERVAL '1 day' * ${safeDays}`)
    ).groupBy(sql`DATE(${meals.createdAt})`).orderBy(sql`DATE(${meals.createdAt})`);
  }

  // Default: workout volume
  return db.select({
    date: sql<string>`DATE(${workouts.createdAt})::text`,
    value: sql<string>`COALESCE(SUM(${workouts.sets} * ${workouts.reps} * COALESCE(${workouts.weightKg}, 0)), 0)::decimal(12,2)`,
  }).from(workouts).where(
    and(eq(workouts.userId, userId), sql`${workouts.createdAt} >= NOW() - INTERVAL '1 day' * ${safeDays}`)
  ).groupBy(sql`DATE(${workouts.createdAt})`).orderBy(sql`DATE(${workouts.createdAt})`);
}
