import { db } from '@/lib/db';
import { cardioLogs } from '@/lib/schema';

interface SaveCardioInput {
  userId: string;
  type: 'running' | 'cycling' | 'swimming' | 'walking' | 'hiit' | 'other';
  distanceKm: number | null;
  durationMin: number;
  notes: string | null;
}

const CAL_PER_MIN: Record<string, number> = {
  running: 8,
  cycling: 6,
  swimming: 7,
  walking: 4,
  hiit: 10,
  other: 6,
};

export async function saveCardioLog(input: SaveCardioInput) {
  try {
    const paceMinKm =
      input.distanceKm && input.distanceKm > 0
        ? +(input.durationMin / input.distanceKm).toFixed(2)
        : null;

    const caloriesBurned = Math.round(
      input.durationMin * (CAL_PER_MIN[input.type] || 6),
    );

    const result = await db.insert(cardioLogs).values({
      userId: input.userId,
      type: input.type,
      distanceKm: input.distanceKm?.toString() ?? null,
      durationMin: input.durationMin,
      paceMinKm: paceMinKm?.toString() ?? null,
      caloriesBurned,
      notes: input.notes,
    }).returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveCardioLog error:', error);
    return { success: false, error: 'Gagal menyimpan cardio' };
  }
}
