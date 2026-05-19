'use server';

import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

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
    const result = await sql`
      INSERT INTO meals (user_id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size)
      VALUES (${session.userId}, ${meal_type}, ${item.food_name.trim()},
              ${item.calories}, ${item.protein_g}, ${item.carbs_g}, ${item.fat_g}, ${item.portion_size})
      RETURNING id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, created_at
    `;
    inserted.push(result[0]);
  }
  return { success: true, data: inserted };
}

export async function getNutritionToday() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const meals = await sql`
    SELECT id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, created_at
    FROM meals
    WHERE user_id = ${session.userId} AND DATE(created_at) = CURRENT_DATE
    ORDER BY created_at ASC
  `;

  const grouped: Record<string, typeof meals> = {};
  for (const meal of meals) {
    const type = meal.meal_type as string;
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
    const result = await sql`
      INSERT INTO workouts (user_id, exercise_name, weight_kg, sets, reps, rpe, notes)
      VALUES (${session.userId}, ${ex.exercise_name.trim()}, ${ex.weight_kg},
              ${ex.sets}, ${ex.reps}, ${ex.rpe}, ${ex.notes})
      RETURNING id, exercise_name, weight_kg, sets, reps, rpe, notes,
                (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as volume, created_at
    `;
    inserted.push(result[0]);
  }
  return { success: true, data: inserted };
}

export async function getWorkoutToday() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const workouts = await sql`
    SELECT id, exercise_name, weight_kg, sets, reps, rpe, notes,
           (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as volume, created_at
    FROM workouts
    WHERE user_id = ${session.userId} AND DATE(created_at) = CURRENT_DATE
    ORDER BY created_at ASC
  `;

  const totalVolume = workouts.reduce((sum, w) => sum + Number(w.volume || 0), 0);
  return { data: workouts, totalVolume };
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

  const result = await sql`
    INSERT INTO cardio_logs (user_id, type, distance_km, duration_min, pace_min_km, calories_burned, notes)
    VALUES (${session.userId}, ${type}, ${distance_km}, ${duration_min}, ${paceMinKm}, ${caloriesBurned}, ${notes})
    RETURNING id, type, distance_km, duration_min, pace_min_km, calories_burned, notes, created_at
  `;
  return { success: true, data: result[0] };
}

export async function getCardioWeek() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const logs = await sql`
    SELECT id, type, distance_km, duration_min, pace_min_km, calories_burned, notes, created_at
    FROM cardio_logs
    WHERE user_id = ${session.userId} AND created_at >= NOW() - INTERVAL '7 days'
    ORDER BY created_at ASC
  `;
  return logs;
}
