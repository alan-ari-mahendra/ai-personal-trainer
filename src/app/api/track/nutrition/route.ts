import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    const body = await req.json();

    const { meal_type, items } = body as {
      meal_type: string;
      items: Array<{
        food_name: string;
        portion_size: string | null;
        calories: number | null;
        protein_g: number | null;
        carbs_g: number | null;
        fat_g: number | null;
      }>;
    };

    if (!meal_type || !items || items.length === 0) {
      return Response.json(
        { error: 'meal_type and at least 1 item required' },
        { status: 400 },
      );
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(meal_type)) {
      return Response.json({ error: 'Invalid meal_type' }, { status: 400 });
    }

    // Insert each item as separate row
    const inserted = [];
    for (const item of items) {
      if (!item.food_name?.trim()) continue;

      const result = await sql`
        INSERT INTO meals (user_id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size)
        VALUES (${userId}, ${meal_type}, ${item.food_name.trim()},
                ${item.calories}, ${item.protein_g},
                ${item.carbs_g}, ${item.fat_g},
                ${item.portion_size})
        RETURNING id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, created_at
      `;
      inserted.push(result[0]);
    }

    return Response.json({ success: true, data: inserted });
  } catch (error) {
    console.error('Save nutrition error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
