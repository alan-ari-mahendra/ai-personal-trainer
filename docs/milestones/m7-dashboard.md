# Milestone 7: Dashboard & Analytics

> **Dependencies:** M5 (chat UI — layout ready), M6 (all tools — data exists)  
> **Output:** Dashboard page dengan stats cards dan charts

---

## Scope

Analytics API endpoints + dashboard UI. Menampilkan ringkasan workout, nutrisi, cardio, dan berat badan dalam bentuk cards dan charts.

## Tasks

### 7.1 Analytics API

**File:** `src/app/api/analytics/overview/route.ts`

Sama seperti PRD section 5.3 — parallel fetch workout stats, nutrition stats, cardio stats, latest weight. Gunakan `getUserId(req)` dari `api-auth.ts`.

**File:** `src/app/api/analytics/chart/route.ts`

```typescript
import { sql } from '@/lib/db';
import { getUserId } from '@/lib/api-auth';

export async function GET(req: Request) {
  const userId = getUserId(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'workouts'; // workouts | weight | calories
  const days = Number(searchParams.get('days')) || 30;

  if (type === 'weight') {
    const data = await sql`
      SELECT recorded_at as date, weight_kg as value
      FROM body_stats
      WHERE user_id = ${userId}
        AND recorded_at >= CURRENT_DATE - ${days}
      ORDER BY recorded_at ASC
    `;
    return Response.json({ data });
  }

  if (type === 'calories') {
    const data = await sql`
      SELECT DATE(created_at) as date, SUM(calories) as value
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
    SELECT DATE(created_at) as date,
           SUM(sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as value
    FROM workouts
    WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '1 day' * ${days}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return Response.json({ data });
}
```

**File:** `src/app/api/workouts/route.ts` — sama seperti PRD section 5.2.

### 7.2 Dashboard Components

**File:** `src/app/(main)/dashboard/page.tsx`

```tsx
import { StatsCards } from '@/components/dashboard/stats-cards';
import { WorkoutChart } from '@/components/dashboard/workout-chart';
import { ProgressChart } from '@/components/dashboard/progress-chart';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutChart />
        <ProgressChart />
      </div>
    </div>
  );
}
```

**File:** `src/components/dashboard/stats-cards.tsx`

Spec:
- 4 cards dalam grid (2x2 desktop, 1 kolom mobile)
- Cards:
  1. **Workouts minggu ini** — jumlah session + total volume
  2. **Kalori hari ini** — total kalori + protein
  3. **Cardio minggu ini** — jumlah session + total menit
  4. **Berat badan** — angka terbaru + tanggal
- Fetch dari `GET /api/analytics/overview`
- Loading skeleton saat fetch
- Gunakan shadcn `Card` component
- Icons dari `lucide-react`: `Dumbbell`, `Flame`, `Heart`, `Scale`

**File:** `src/components/dashboard/workout-chart.tsx`

Spec:
- Line/bar chart — workout volume per hari (30 hari terakhir)
- Fetch dari `GET /api/analytics/chart?type=workouts&days=30`
- Gunakan `recharts` library
- X-axis: tanggal, Y-axis: volume (kg)
- Responsive container

**File:** `src/components/dashboard/progress-chart.tsx`

Spec:
- Line chart — berat badan over time
- Fetch dari `GET /api/analytics/chart?type=weight&days=90`
- Tooltip show tanggal + berat
- Optional: tambah tab switcher (weight / calories)

### 7.3 Data Hook

**File:** `src/hooks/use-dashboard.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';

export function useDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then(res => res.json())
      .then(data => { setOverview(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { overview, loading };
}

export function useChartData(type: string, days: number) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/chart?type=${type}&days=${days}`)
      .then(res => res.json())
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, days]);

  return { data, loading };
}
```

## Acceptance Criteria

- [ ] Dashboard page accessible via sidebar nav
- [ ] 4 stats cards show real data dari DB
- [ ] Cards show loading skeleton saat fetching
- [ ] Workout volume chart render dengan data 30 hari
- [ ] Weight progress chart render dengan data 90 hari
- [ ] Empty state saat belum ada data (bukan error)
- [ ] Responsive layout — 2 kolom desktop, 1 kolom mobile
- [ ] Charts responsive — resize dengan container

## Empty State Handling

Semua chart dan card harus handle kasus data kosong:
- Cards: tampilkan "0" atau "—" bukan error
- Charts: tampilkan pesan "Belum ada data. Mulai catat di Chat!"
