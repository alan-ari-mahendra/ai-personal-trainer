# FitAI — Phase 2: AI-Assisted Form Tracking

> **Status:** Ready for Development
> **Depends on:** Phase 1 (M1–M7 complete)
> **Stack:** Same — Next.js 16 + Neon DB + Groq AI + Tailwind + shadcn/ui

---

## Konsep Utama

Phase 1 = chat-centric (semua lewat chat).
Phase 2 = **form-based tracking** dengan AI bantu isi form.

**Flow inti:**

```
User buka halaman tracker
  → Ketik deskripsi natural language di text area
  → Klik "Parse with AI"
  → Groq parse → auto-fill form fields
  → User review / koreksi form
  → Klik Save → data masuk DB
```

AI tidak langsung save. AI hanya **mengisi form**. User punya kontrol penuh untuk edit sebelum save.

---

## Halaman Aplikasi (Final)

| Path | Fungsi | Phase |
|------|--------|-------|
| `/landing` | Marketing landing page | 1 ✓ |
| `/login`, `/register` | Auth | 1 ✓ |
| `/chat` | Tanya-jawab AI (progress, saran, jadwal) | 1 ✓ |
| `/dashboard` | Stats cards + charts | 1 ✓ (update di P2) |
| `/track/nutrition` | **Form tracking makanan** | **2** |
| `/track/workout` | **Form tracking gym** | **2** |
| `/track/cardio` | **Form tracking cardio/lari** | **2** |

Sidebar navigation update: Chat, Nutrition, Workout, Cardio, Dashboard.

---

## Milestones Phase 2

### P2-M1: AI Parse API

### P2-M2: Nutrition Tracker Page

### P2-M3: Workout Tracker Page

### P2-M4: Cardio Tracker Page

### P2-M5: History & Dashboard Update

---

## P2-M1: AI Parse API

**Endpoint:** `POST /api/parse`

Satu endpoint universal untuk parse natural language ke structured data. Beda dari `/api/chat` — ini tidak save ke DB, hanya return structured JSON.

**Request:**

```typescript
interface ParseRequest {
  type: 'nutrition' | 'workout' | 'cardio';
  input: string; // natural language dari user
}
```

**Response:**

```typescript
// type === 'nutrition'
interface NutritionParseResult {
  items: Array<{
    food_name: string;
    portion_size: string;
    calories: number | null;    // estimasi AI
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }>;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // AI tebak dari jam
}

// type === 'workout'
interface WorkoutParseResult {
  exercises: Array<{
    exercise_name: string;
    sets: number;
    reps: number;
    weight_kg: number | null;
    rpe: number | null;
    notes: string | null;
  }>;
}

// type === 'cardio'
interface CardioParseResult {
  type: 'running' | 'cycling' | 'swimming' | 'walking' | 'hiit' | 'other';
  distance_km: number | null;
  duration_min: number | null;
  notes: string | null;
}
```

**Implementasi:**

```typescript
// src/app/api/parse/route.ts
// 1. Terima input + type
// 2. Build prompt yang specific per type
// 3. Groq call dengan response_format: json
// 4. Return parsed JSON (TIDAK save ke DB)
```

**System prompt per type:**

- **Nutrition:** "Parse deskripsi makanan user. Estimasi kalori dan macro per item. Tentukan meal_type dari jam saat ini: 05-10 = breakfast, 11-14 = lunch, 15-17 = snack, 18-22 = dinner. Return JSON."
- **Workout:** "Parse deskripsi latihan gym. Extract exercise name, sets, reps, weight. Jika user bilang '4x12' artinya 4 set 12 rep. Return JSON array."
- **Cardio:** "Parse deskripsi aktivitas cardio. Extract type, jarak, durasi. Return JSON."

**Groq JSON mode:**

```typescript
const completion = await groq.chat.completions.create({
  model: GROQ_MODEL,
  messages: [...],
  response_format: { type: "json_object" },
  temperature: 0.3, // lower = more consistent parsing
});
```

---

## P2-M2: Nutrition Tracker Page

**Path:** `/track/nutrition`

### UI Layout

```
┌─────────────────────────────────────────┐
│ 🍽️ Catat Makanan                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Deskripsikan makanan kamu...    │    │
│  │                                 │    │
│  │ "saya makan sosis 2 biji dan   │    │
│  │  kentang goreng 100gram"        │    │
│  └─────────────────────────────────┘    │
│  [✨ Parse with AI]                     │
│                                         │
│  ── Form (muncul setelah parse) ──────  │
│                                         │
│  Waktu Makan: [Snack ▾]                │
│                                         │
│  Item 1:                                │
│  Nama:    [Sosis        ] Porsi: [2 biji]│
│  Kalori:  [150          ] Protein: [12g] │
│  Karbo:   [2g           ] Lemak:   [10g] │
│                                         │
│  Item 2:                                │
│  Nama:    [Kentang Goreng] Porsi: [100g]│
│  Kalori:  [312          ] Protein: [3g]  │
│  Karbo:   [41g          ] Lemak:   [15g] │
│                                         │
│  [+ Tambah Item]                        │
│                                         │
│  Total: 462 kcal | 15g P | 43g C | 25g F│
│                                         │
│  [💾 Simpan]                            │
│                                         │
├─────────────────────────────────────────┤
│ History Hari Ini                        │
│ ┌───────────────────────────────────┐   │
│ │ 🌅 Breakfast — 08:30             │   │
│ │ Nasi goreng (450 kcal, 15g P)    │   │
│ │ Teh manis (80 kcal)              │   │
│ ├───────────────────────────────────┤   │
│ │ 🌞 Lunch — 12:15                 │   │
│ │ Ayam geprek (550 kcal, 35g P)    │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Komponen

| File | Fungsi |
|------|--------|
| `src/app/(main)/track/nutrition/page.tsx` | Page |
| `src/components/track/ai-input.tsx` | Shared textarea + parse button (reusable) |
| `src/components/track/nutrition-form.tsx` | Editable nutrition form (multi-item) |
| `src/components/track/nutrition-history.tsx` | History hari ini |

### Flow Detail

1. User ketik di textarea
2. Klik "Parse with AI" → `POST /api/parse { type: 'nutrition', input: '...' }`
3. Loading state (spinner di button)
4. Response → populate form fields
5. `meal_type` auto-set dari jam, tapi editable via dropdown
6. User bisa:
   - Edit semua field
   - Hapus item
   - Tambah item manual
7. Klik "Simpan" → `POST /api/track/nutrition` (save semua items ke `meals` table)
8. Form reset, history refresh
9. History hari ini muncul di bawah (grouped by meal_type)

### Save API

**Endpoint:** `POST /api/track/nutrition`

```typescript
interface SaveNutritionRequest {
  meal_type: string;
  items: Array<{
    food_name: string;
    portion_size: string | null;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }>;
}
// Insert each item as separate row in meals table
```

**Endpoint:** `GET /api/track/nutrition/today`

```typescript
// Return meals grouped by meal_type for today
// Used by nutrition-history component
```

---

## P2-M3: Workout Tracker Page

**Path:** `/track/workout`

### UI Layout

```
┌─────────────────────────────────────────┐
│ 🏋️ Catat Latihan                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Deskripsikan latihan kamu...    │    │
│  │                                 │    │
│  │ "bench press 4x12 80kg, squat  │    │
│  │  3x10 60kg, bicep curl 3x15"   │    │
│  └─────────────────────────────────┘    │
│  [✨ Parse with AI]                     │
│                                         │
│  ── Form ──────────────────────────────  │
│                                         │
│  Exercise 1:                            │
│  Nama:  [Bench Press   ] Beban: [80 kg] │
│  Set:   [4             ] Rep:   [12   ] │
│  RPE:   [—             ] Notes: [     ] │
│                                         │
│  Exercise 2:                            │
│  Nama:  [Squat         ] Beban: [60 kg] │
│  Set:   [3             ] Rep:   [10   ] │
│                                         │
│  Exercise 3:                            │
│  Nama:  [Bicep Curl    ] Beban: [— kg ] │
│  Set:   [3             ] Rep:   [15   ] │
│                                         │
│  [+ Tambah Exercise]                    │
│                                         │
│  Total Volume: 6,420 kg                 │
│                                         │
│  [💾 Simpan]                            │
│                                         │
├─────────────────────────────────────────┤
│ History Hari Ini                        │
│ ┌───────────────────────────────────┐   │
│ │ Bench Press — 4×12 @ 80kg        │   │
│ │ Squat — 3×10 @ 60kg              │   │
│ │ Total: 5,640 kg volume            │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Save API

**Endpoint:** `POST /api/track/workout`

```typescript
interface SaveWorkoutRequest {
  exercises: Array<{
    exercise_name: string;
    weight_kg: number | null;
    sets: number;
    reps: number;
    rpe: number | null;
    notes: string | null;
  }>;
}
// Insert each exercise as separate row in workouts table
```

**Endpoint:** `GET /api/track/workout/today`

---

## P2-M4: Cardio Tracker Page

**Path:** `/track/cardio`

### UI Layout

```
┌─────────────────────────────────────────┐
│ 🏃 Catat Cardio                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Deskripsikan aktivitas kamu...  │    │
│  │                                 │    │
│  │ "lari pagi 5km 30 menit"       │    │
│  └─────────────────────────────────┘    │
│  [✨ Parse with AI]                     │
│                                         │
│  ── Form ──────────────────────────────  │
│                                         │
│  Tipe:     [Running ▾          ]        │
│  Jarak:    [5          ] km             │
│  Durasi:   [30         ] menit          │
│  Pace:     5:00 /km (auto-calc)         │
│  Kalori:   ~240 kcal (auto-calc)        │
│  Notes:    [                   ]        │
│                                         │
│  [💾 Simpan]                            │
│                                         │
├─────────────────────────────────────────┤
│ History Minggu Ini                      │
│ ┌───────────────────────────────────┐   │
│ │ Sen — Running 5km, 30min          │   │
│ │ Rab — Cycling 15km, 45min         │   │
│ │ Jum — HIIT 20min                  │   │
│ │ Total: 40km, 95min                │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Save API

**Endpoint:** `POST /api/track/cardio`

```typescript
interface SaveCardioRequest {
  type: string;
  distance_km: number | null;
  duration_min: number;
  notes: string | null;
}
// Pace + calories auto-calculated server-side (like M6 tool)
```

**Endpoint:** `GET /api/track/cardio/week`

---

## P2-M5: History, Dashboard Update & Navigation

### Sidebar Update

```
Sidebar Nav:
├── 🍽️ Nutrition    → /track/nutrition
├── 🏋️ Workout      → /track/workout
├── 🏃 Cardio       → /track/cardio
├── 💬 Chat         → /chat
├── 📊 Dashboard    → /dashboard
└── ⚙️ Settings     → /settings
```

### Dashboard Update

Tambah ringkasan hari ini di atas stats cards:

```
┌─────────────────────────────────────┐
│ Hari Ini (Senin, 12 Mei 2026)      │
│                                     │
│ 🍽️ 1,200 kcal (3 meals logged)     │
│ 🏋️ 2 exercises, 4,800 kg volume    │
│ 🏃 5km run, 30 min                 │
└─────────────────────────────────────┘
```

### History per tracker

Setiap tracker page punya history section:
- **Nutrition:** history hari ini, grouped by meal_type
- **Workout:** history hari ini
- **Cardio:** history minggu ini

---

## Shared Components

### `src/components/track/ai-input.tsx`

Reusable component — textarea + "Parse with AI" button.

```typescript
interface AiInputProps {
  placeholder: string;
  type: 'nutrition' | 'workout' | 'cardio';
  onParsed: (result: any) => void;
}
```

- Textarea dengan placeholder contextual
- Button "✨ Parse with AI"
- Loading state saat parse
- Error state jika parse gagal
- Bisa juga skip AI → langsung isi form manual

### Form pattern

Semua form pakai `react-hook-form` + `zod` validation:
- Controlled inputs
- Validation on save
- Auto-calculate derived fields (volume, pace, total calories)

---

## API Structure (Phase 2)

| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/api/parse` | AI parse natural language → JSON |
| POST | `/api/track/nutrition` | Save meal items |
| GET | `/api/track/nutrition/today` | Get today's meals |
| POST | `/api/track/workout` | Save workout exercises |
| GET | `/api/track/workout/today` | Get today's workouts |
| POST | `/api/track/cardio` | Save cardio session |
| GET | `/api/track/cardio/week` | Get this week's cardio |

Phase 1 APIs tetap ada (chat, analytics, etc.)

---

## Database

Tidak ada schema change. Semua table dari Phase 1 sudah cukup:
- `meals` — nutrition tracking
- `workouts` — workout tracking
- `cardio_logs` — cardio tracking
- `body_stats` — weight tracking
- `chat_history` — chat Q&A

---

## File Structure (Phase 2 additions)

```
src/
├── app/
│   ├── (main)/
│   │   ├── track/
│   │   │   ├── nutrition/page.tsx
│   │   │   ├── workout/page.tsx
│   │   │   └── cardio/page.tsx
│   │   ├── chat/page.tsx          (existing)
│   │   ├── dashboard/page.tsx     (update)
│   │   └── layout.tsx             (existing)
│   └── api/
│       ├── parse/route.ts         (NEW — AI parse)
│       └── track/
│           ├── nutrition/
│           │   ├── route.ts       (POST save)
│           │   └── today/route.ts (GET history)
│           ├── workout/
│           │   ├── route.ts
│           │   └── today/route.ts
│           └── cardio/
│               ├── route.ts
│               └── week/route.ts
├── components/
│   ├── track/
│   │   ├── ai-input.tsx           (shared AI textarea)
│   │   ├── nutrition-form.tsx
│   │   ├── nutrition-history.tsx
│   │   ├── workout-form.tsx
│   │   ├── workout-history.tsx
│   │   ├── cardio-form.tsx
│   │   └── cardio-history.tsx
│   └── dashboard/                 (update)
└── hooks/
    └── use-parse.ts               (AI parse hook)
```

---

## Implementation Order

```
P2-M1: AI Parse API          → /api/parse + use-parse hook
P2-M2: Nutrition Tracker      → page + form + history + save API
P2-M3: Workout Tracker        → page + form + history + save API
P2-M4: Cardio Tracker         → page + form + history + save API
P2-M5: Nav update + Dashboard → sidebar update + dashboard today summary
```

Setiap milestone independent setelah M1. M2/M3/M4 bisa parallel.
