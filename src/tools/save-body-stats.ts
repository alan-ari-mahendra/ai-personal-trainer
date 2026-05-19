import { db } from '@/lib/db';
import { bodyStats } from '@/lib/schema';
import { sql } from 'drizzle-orm';

interface SaveBodyStatsInput {
  userId: string;
  weightKg: number;
  waistCm: number | null;
  notes: string | null;
}

export async function saveBodyStats(input: SaveBodyStatsInput) {
  try {
    const result = await db.insert(bodyStats).values({
      userId: input.userId,
      weightKg: input.weightKg.toString(),
      waistCm: input.waistCm?.toString() ?? null,
      notes: input.notes,
      recordedAt: sql`CURRENT_DATE`,
    }).onConflictDoUpdate({
      target: [bodyStats.userId, bodyStats.recordedAt],
      set: {
        weightKg: sql`EXCLUDED.weight_kg`,
        waistCm: sql`COALESCE(EXCLUDED.waist_cm, ${bodyStats.waistCm})`,
        notes: sql`EXCLUDED.notes`,
      },
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveBodyStats error:', error);
    return { success: false, error: 'Gagal menyimpan body stats' };
  }
}
