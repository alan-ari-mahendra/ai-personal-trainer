'use server';

import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

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
}

export async function saveOnboarding(data: OnboardingData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await sql`
    UPDATE users SET
      display_name = ${data.display_name},
      gender = ${data.gender},
      age = ${data.age},
      height_cm = ${data.height_cm},
      weight_kg = ${data.weight_kg},
      goal = ${data.goal},
      activity_level = ${data.activity_level},
      exercise_history = ${data.exercise_history},
      injuries = ${data.injuries},
      onboarding_completed = TRUE,
      updated_at = NOW()
    WHERE id = ${session.userId}
  `;

  if (data.weight_kg) {
    await sql`
      INSERT INTO body_stats (user_id, weight_kg, recorded_at)
      VALUES (${session.userId}, ${data.weight_kg}, CURRENT_DATE)
      ON CONFLICT (user_id, recorded_at) DO UPDATE SET weight_kg = ${data.weight_kg}
    `;
  }

  return { success: true };
}

export async function checkOnboarding(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const result = await sql`
    SELECT onboarding_completed FROM users WHERE id = ${session.userId}
  `;
  return result[0]?.onboarding_completed === true;
}
