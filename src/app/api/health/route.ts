import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as time`;
    return Response.json({ status: 'ok', db: result[0].time });
  } catch (error) {
    return Response.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
