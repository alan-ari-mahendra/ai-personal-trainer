import { saveWorkoutLog } from '@/tools/save-workout';
import { saveCardioLog } from '@/tools/save-cardio';
import { saveNutritionLog } from '@/tools/save-nutrition';
import { saveBodyStats } from '@/tools/save-body-stats';
import { getUserAnalytics } from '@/tools/get-analytics';

/**
 * Execute a tool call. Groq sends snake_case args matching tool definitions,
 * mapped here to camelCase TypeScript interfaces.
 */
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
) {
  switch (toolName) {
    case 'save_workout_log':
      return saveWorkoutLog({
        userId,
        exerciseName: args.exercise_name as string,
        weightKg: (args.weight_kg as number) ?? null,
        sets: args.sets as number,
        reps: args.reps as number,
        rpe: (args.rpe as number) ?? null,
        notes: (args.notes as string) ?? null,
      });

    case 'save_cardio_log':
      return saveCardioLog({
        userId,
        type: args.type as 'running' | 'cycling' | 'swimming' | 'walking' | 'hiit' | 'other',
        distanceKm: (args.distance_km as number) ?? null,
        durationMin: args.duration_min as number,
        notes: (args.notes as string) ?? null,
      });

    case 'save_nutrition_log':
      return saveNutritionLog({
        userId,
        mealType: args.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        foodName: args.food_name as string,
        calories: (args.calories as number) ?? null,
        proteinG: (args.protein_g as number) ?? null,
        carbsG: (args.carbs_g as number) ?? null,
        fatG: (args.fat_g as number) ?? null,
        portionSize: (args.portion_size as string) ?? null,
        notes: (args.notes as string) ?? null,
      });

    case 'save_body_stats':
      return saveBodyStats({
        userId,
        weightKg: args.weight_kg as number,
        waistCm: (args.waist_cm as number) ?? null,
        notes: (args.notes as string) ?? null,
      });

    case 'get_user_analytics':
      return getUserAnalytics({
        userId,
        period: args.period as 'today' | 'week' | 'month',
        metric: args.metric as 'all' | 'workouts' | 'nutrition' | 'cardio' | 'weight',
      });

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
