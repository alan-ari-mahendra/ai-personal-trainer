import { db } from '@/lib/db';
import { meals } from '@/lib/schema';

interface SaveNutritionInput {
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  portionSize: string | null;
  notes: string | null;
}

export async function saveNutritionLog(input: SaveNutritionInput) {
  try {
    const result = await db.insert(meals).values({
      userId: input.userId,
      mealType: input.mealType,
      foodName: input.foodName,
      calories: input.calories,
      proteinG: input.proteinG?.toString() ?? null,
      carbsG: input.carbsG?.toString() ?? null,
      fatG: input.fatG?.toString() ?? null,
      portionSize: input.portionSize,
      notes: input.notes,
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveNutritionLog error:', error);
    return { success: false, error: 'Gagal menyimpan meal' };
  }
}
