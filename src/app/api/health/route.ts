import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW() as time`);
    return Response.json({ status: 'ok', db: result.rows[0].time });
  } catch (error) {
    return Response.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
