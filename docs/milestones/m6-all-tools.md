# Milestone 6: All Tools Implementation

> **Dependencies:** M3 (chat core — tool executor pattern)  
> **Output:** 5 tools lengkap — workout, cardio, nutrition, body stats, analytics

---

## Scope

Implementasi 4 tool sisanya + update tool definitions dan executor. Setelah M6, semua fitur data capture via chat berfungsi.

## Tasks

### 6.1 Tool Definitions Update

**File:** `src/lib/tool-definitions.ts`

Tambahkan semua 5 tool definitions dari PRD section 6:
- `save_workout_log` (sudah ada dari M3)
- `save_cardio_log`
- `save_nutrition_log`
- `save_body_stats`
- `get_user_analytics`

### 6.2 Tool Implementations

**File:** `src/tools/save-cardio.ts`

```typescript
import { sql } from '@/lib/db';

interface SaveCardioInput {
  userId: string;
  type: 'running' | 'cycling' | 'swimming' | 'walking' | 'hiit' | 'other';
  distanceKm?: number | null;
  durationMin: number;
  notes?: string | null;
}

export async function saveCardioLog(input: SaveCardioInput) {
  try {
    // Hitung pace jika ada distance
    const paceMinKm = input.distanceKm && input.distanceKm > 0
      ? +(input.durationMin / input.distanceKm).toFixed(2)
      : null;

    // Estimasi kalori (rough): ~8 cal/min running, ~6 cycling, ~7 swimming, ~4 walking, ~10 hiit
    const calPerMin: Record<string, number> = {
      running: 8, cycling: 6, swimming: 7, walking: 4, hiit: 10, other: 6
    };
    const caloriesBurned = Math.round(input.durationMin * (calPerMin[input.type] || 6));

    const result = await sql`
      INSERT INTO cardio_logs (user_id, type, distance_km, duration_min, pace_min_km, calories_burned, notes)
      VALUES (${input.userId}, ${input.type}, ${input.distanceKm ?? null}, ${input.durationMin},
              ${paceMinKm}, ${caloriesBurned}, ${input.notes ?? null})
      RETURNING id, type, distance_km, duration_min, pace_min_km, calories_burned
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveCardioLog error:', error);
    return { success: false, error: 'Gagal menyimpan cardio' };
  }
}
```

**File:** `src/tools/save-nutrition.ts`

```typescript
import { sql } from '@/lib/db';

interface SaveNutritionInput {
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  portionSize?: string | null;
  notes?: string | null;
}

export async function saveNutritionLog(input: SaveNutritionInput) {
  try {
    const result = await sql`
      INSERT INTO meals (user_id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, portion_size, notes)
      VALUES (${input.userId}, ${input.mealType}, ${input.foodName},
              ${input.calories ?? null}, ${input.proteinG ?? null},
              ${input.carbsG ?? null}, ${input.fatG ?? null},
              ${input.portionSize ?? null}, ${input.notes ?? null})
      RETURNING id, meal_type, food_name, calories, protein_g
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('[TOOL] saveNutritionLog error:', error);
    return { success: false, error: 'Gagal menyimpan meal' };
  }
}
```

**File:** `src/tools/save-body-stats.ts`

```typescript
import { sql } from '@/lib/db';

interface SaveBodyStatsInput {
  userId: string;
  weightKg: number;
  waistCm?: number | null;
  notes?: string | null;
}

export async function saveBodyStats(input: SaveBodyStatsInput) {
  try {
    // UPSERT — satu entry per hari
    const result = await sql`
      INSERT INTO body_stats (user_id, weight_kg, waist_cm, notes, recorded_at)
      VALUES (${input.userId}, ${input.weightKg}, ${input.waistCm ?? null},
              ${input.notes ?? null}, CURRENT_DATE)
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
```

**File:** `src/tools/get-analytics.ts` — sama seperti PRD section 7 (contoh kompleks).

### 6.3 Update Tool Executor

**File:** `src/lib/tool-executor.ts`

```typescript
import { saveWorkoutLog } from '@/tools/save-workout';
import { saveCardioLog } from '@/tools/save-cardio';
import { saveNutritionLog } from '@/tools/save-nutrition';
import { saveBodyStats } from '@/tools/save-body-stats';
import { getUserAnalytics } from '@/tools/get-analytics';

export async function executeToolCall(toolName: string, args: Record<string, unknown>, userId: string) {
  switch (toolName) {
    case 'save_workout_log':
      return saveWorkoutLog({ ...args, userId } as any);
    case 'save_cardio_log':
      return saveCardioLog({ ...args, userId } as any);
    case 'save_nutrition_log':
      return saveNutritionLog({ ...args, userId } as any);
    case 'save_body_stats':
      return saveBodyStats({ ...args, userId } as any);
    case 'get_user_analytics':
      return getUserAnalytics({ ...args, userId } as any);
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
```

### 6.4 Groq Argument Name Mapping

> **PENTING:** Groq mengirim arguments pakai snake_case (sesuai tool definition), tapi TypeScript interfaces pakai camelCase. Perlu mapping.

Opsi:
1. **Tool implementation terima snake_case** — ubah interface fields ke snake_case
2. **Map di executor** — convert keys sebelum pass

Rekomendasi: opsi 1 — buat interface match dengan tool definition supaya tidak ada transform layer.

## Acceptance Criteria

- [ ] "Lari 5km 30 menit" → `save_cardio_log` dipanggil, data masuk `cardio_logs`
- [ ] "Makan nasi goreng kalori 500" → `save_nutrition_log` dipanggil, data masuk `meals`
- [ ] "Berat badan 75kg" → `save_body_stats` dipanggil, data masuk `body_stats` (upsert per hari)
- [ ] "Progress minggu ini gimana?" → `get_user_analytics` dipanggil, AI summarize data
- [ ] Multiple tools dalam satu pesan ("bench press 80kg 4x12 terus lari 3km") → kedua tool dipanggil
- [ ] Tool args mapping benar (snake_case dari Groq → implementation)

## Testing Prompts

```
"Tadi bench press 80kg 4 set 12 rep"
"Lari pagi 5km 30 menit"
"Sarapan oatmeal protein 20g kalori 300"
"Berat badan hari ini 74.5kg"
"Gimana progress minggu ini?"
"Tadi push up 3 set 20 rep terus plank 3 menit"
```
