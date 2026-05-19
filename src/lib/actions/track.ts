'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { meals, workouts, cardioLogs } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

// ===== Nutrition =====

export async function saveNutrition(data: {
  meal_type: string;
  items: Array<{
    food_name: string;
    portion_size: string | null;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }>;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const { meal_type, items } = data;
  if (!meal_type || !items?.length) throw new Error('meal_type and items required');

  const inserted = [];
  for (const item of items) {
    if (!item.food_name?.trim()) continue;
    const result = await db.insert(meals).values({
      userId: session.userId,
      mealType: meal_type,
      foodName: item.food_name.trim(),
      calories: item.calories,
      proteinG: item.protein_g?.toString() ?? null,
      carbsG: item.carbs_g?.toString() ?? null,
      fatG: item.fat_g?.toString() ?? null,
      portionSize: item.portion_size,
    }).returning({
      id: meals.id,
      mealType: meals.mealType,
      foodName: meals.foodName,
      calories: meals.calories,
      proteinG: meals.proteinG,
      carbsG: meals.carbsG,
      fatG: meals.fatG,
      portionSize: meals.portionSize,
      createdAt: meals.createdAt,
    });
    inserted.push(result[0]);
  }
  return { success: true, data: inserted };
}

export async function getNutritionToday() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const rows = await db.select({
    id: meals.id,
    mealType: meals.mealType,
    foodName: meals.foodName,
    calories: meals.calories,
    proteinG: meals.proteinG,
    carbsG: meals.carbsG,
    fatG: meals.fatG,
    portionSize: meals.portionSize,
    createdAt: meals.createdAt,
  }).from(meals).where(
    and(eq(meals.userId, session.userId), sql`DATE(${meals.createdAt}) = CURRENT_DATE`)
  ).orderBy(meals.createdAt);

  const grouped: Record<string, typeof rows> = {};
  for (const meal of rows) {
    const type = meal.mealType;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(meal);
  }
  return grouped;
}

// ===== Workout =====

export async function saveWorkout(data: {
  exercises: Array<{
    exercise_name: string;
    weight_kg: number | null;
    sets: number;
    reps: number;
    rpe: number | null;
    notes: string | null;
  }>;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const { exercises } = data;
  if (!exercises?.length) throw new Error('At least 1 exercise required');

  const inserted = [];
  for (const ex of exercises) {
    if (!ex.exercise_name?.trim() || !ex.sets || !ex.reps) continue;
    const result = await db.insert(workouts).values({
      userId: session.userId,
      exerciseName: ex.exercise_name.trim(),
      weightKg: ex.weight_kg?.toString() ?? null,
      sets: ex.sets,
      reps: ex.reps,
      rpe: ex.rpe,
      notes: ex.notes,
    }).returning({
      id: workouts.id,
      exerciseName: workouts.exerciseName,
      weightKg: workouts.weightKg,
      sets: workouts.sets,
      reps: workouts.reps,
      rpe: workouts.rpe,
      notes: workouts.notes,
      volume: sql<string>`(${workouts.sets} * ${workouts.reps} * COALESCE(${workouts.weightKg}, 0))::decimal(12,2)`,
      createdAt: workouts.createdAt,
    });
    inserted.push(result[0]);
  }
  return { success: true, data: inserted };
}

export async function getWorkoutToday() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const rows = await db.select({
    id: workouts.id,
    exerciseName: workouts.exerciseName,
    weightKg: workouts.weightKg,
    sets: workouts.sets,
    reps: workouts.reps,
    rpe: workouts.rpe,
    notes: workouts.notes,
    volume: sql<string>`(${workouts.sets} * ${workouts.reps} * COALESCE(${workouts.weightKg}, 0))::decimal(12,2)`,
    createdAt: workouts.createdAt,
  }).from(workouts).where(
    and(eq(workouts.userId, session.userId), sql`DATE(${workouts.createdAt}) = CURRENT_DATE`)
  ).orderBy(workouts.createdAt);

  const totalVolume = rows.reduce((s, w) => s + Number(w.volume || 0), 0);
  return { data: rows, totalVolume };
}

// ===== Cardio =====

const CAL_PER_MIN: Record<string, number> = {
  running: 8, cycling: 6, swimming: 7, walking: 4, hiit: 10, other: 6,
};

export async function saveCardio(data: {
  type: string;
  distance_km: number | null;
  duration_min: number;
  notes: string | null;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const { type, distance_km, duration_min, notes } = data;
  if (!type || !duration_min) throw new Error('type and duration_min required');

  const paceMinKm = distance_km && distance_km > 0
    ? +(duration_min / distance_km).toFixed(2)
    : null;
  const caloriesBurned = Math.round(duration_min * (CAL_PER_MIN[type] || 6));

  const result = await db.insert(cardioLogs).values({
    userId: session.userId,
    type,
    distanceKm: distance_km?.toString() ?? null,
    durationMin: duration_min,
    paceMinKm: paceMinKm?.toString() ?? null,
    caloriesBurned,
    notes,
  }).returning({
    id: cardioLogs.id,
    type: cardioLogs.type,
    distanceKm: cardioLogs.distanceKm,
    durationMin: cardioLogs.durationMin,
    paceMinKm: cardioLogs.paceMinKm,
    caloriesBurned: cardioLogs.caloriesBurned,
    notes: cardioLogs.notes,
    createdAt: cardioLogs.createdAt,
  });
  return { success: true, data: result[0] };
}

export async function getCardioWeek() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const logs = await db.select({
    id: cardioLogs.id,
    type: cardioLogs.type,
    distanceKm: cardioLogs.distanceKm,
    durationMin: cardioLogs.durationMin,
    paceMinKm: cardioLogs.paceMinKm,
    caloriesBurned: cardioLogs.caloriesBurned,
    notes: cardioLogs.notes,
    createdAt: cardioLogs.createdAt,
  }).from(cardioLogs).where(
    and(eq(cardioLogs.userId, session.userId), sql`${cardioLogs.createdAt} >= NOW() - INTERVAL '7 days'`)
  ).orderBy(cardioLogs.createdAt);
  return logs;
}
