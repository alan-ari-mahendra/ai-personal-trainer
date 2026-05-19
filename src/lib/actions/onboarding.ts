'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, bodyStats } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export interface OnboardingData {
  display_name: string | null;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string;
  activity_level: string;
  exercise_history: string | null;
  injuries: string | null;
  address: string | null;
}

export async function saveOnboarding(data: OnboardingData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.update(users).set({
    displayName: data.display_name,
    gender: data.gender,
    age: data.age,
    heightCm: data.height_cm?.toString() ?? null,
    weightKg: data.weight_kg?.toString() ?? null,
    goal: data.goal,
    activityLevel: data.activity_level,
    exerciseHistory: data.exercise_history,
    injuries: data.injuries,
    address: data.address,
    onboardingCompleted: true,
    updatedAt: new Date(),
  }).where(eq(users.id, session.userId));

  if (data.weight_kg) {
    await db.insert(bodyStats).values({
      userId: session.userId,
      weightKg: data.weight_kg.toString(),
      recordedAt: sql`CURRENT_DATE`,
    }).onConflictDoUpdate({
      target: [bodyStats.userId, bodyStats.recordedAt],
      set: { weightKg: data.weight_kg.toString() },
    });
  }

  return { success: true };
}

export async function checkOnboarding(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const result = await db.select({ onboardingCompleted: users.onboardingCompleted })
    .from(users)
    .where(eq(users.id, session.userId));
  return result[0]?.onboardingCompleted === true;
}
