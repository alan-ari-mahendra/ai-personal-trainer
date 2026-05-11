import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);

    const meals = await sql`
      SELECT id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, created_at
      FROM meals
      WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at ASC
    `;

    // Group by meal_type
    const grouped: Record<string, typeof meals> = {};
    for (const meal of meals) {
      const type = meal.meal_type as string;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(meal);
    }

    return Response.json({ data: grouped });
  } catch (error) {
    console.error('Nutrition today error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
