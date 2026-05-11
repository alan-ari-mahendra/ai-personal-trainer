import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'workouts';
    const days = Math.min(Number(searchParams.get('days')) || 30, 365);

    if (type === 'weight') {
      const data = await sql`
        SELECT recorded_at as date, weight_kg::decimal(5,2) as value
        FROM body_stats
        WHERE user_id = ${userId}
          AND recorded_at >= CURRENT_DATE - ${days}
        ORDER BY recorded_at ASC
      `;
      return Response.json({ data });
    }

    if (type === 'calories') {
      const data = await sql`
        SELECT DATE(created_at)::text as date, COALESCE(SUM(calories), 0)::int as value
        FROM meals
        WHERE user_id = ${userId}
          AND created_at >= NOW() - INTERVAL '1 day' * ${days}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      return Response.json({ data });
    }

    // Default: workout volume per day
    const data = await sql`
      SELECT DATE(created_at)::text as date,
             COALESCE(SUM(sets * reps * COALESCE(weight_kg, 0)), 0)::decimal(12,2) as value
      FROM workouts
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    return Response.json({ data });
  } catch (error) {
    console.error('Analytics chart error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
