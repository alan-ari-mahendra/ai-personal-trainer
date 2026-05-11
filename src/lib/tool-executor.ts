import { saveWorkoutLog } from '@/tools/save-workout';

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
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
