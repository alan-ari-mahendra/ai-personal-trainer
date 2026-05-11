import { sql } from '@/lib/db';

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
    const result = await sql`
      INSERT INTO meals (user_id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, notes)
      VALUES (${input.userId}, ${input.mealType}, ${input.foodName},
              ${input.calories}, ${input.proteinG},
              ${input.carbsG}, ${input.fatG},
              ${input.portionSize}, ${input.notes})
      RETURNING id, meal_type, food_name, calories, protein_g
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveNutritionLog error:', error);
    return { success: false, error: 'Gagal menyimpan meal' };
  }
}
