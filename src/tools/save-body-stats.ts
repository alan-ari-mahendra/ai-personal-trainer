import { sql } from '@/lib/db';

interface SaveBodyStatsInput {
  userId: string;
  weightKg: number;
  waistCm: number | null;
  notes: string | null;
}

export async function saveBodyStats(input: SaveBodyStatsInput) {
  try {
    const result = await sql`
      INSERT INTO body_stats (user_id, weight_kg, waist_cm, notes, recorded_at)
      VALUES (${input.userId}, ${input.weightKg}, ${input.waistCm},
              ${input.notes}, CURRENT_DATE)
      ON CONFLICT (user_id, recorded_at)
      DO UPDATE SET
        weight_kg = EXCLUDED.weight_kg,
        waist_cm = COALESCE(EXCLUDED.waist_cm, body_stats.waist_cm),
        notes = EXCLUDED.notes
      RETURNING id, weight_kg, waist_cm, recorded_at
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveBodyStats error:', error);
    return { success: false, error: 'Gagal menyimpan body stats' };
  }
}
