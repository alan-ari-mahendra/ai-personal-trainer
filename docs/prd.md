Berikut adalah **PRD v2.0 — Developer Edition**.

Versi ini **dibersihkan dari noise marketing**, difokuskan pada **spesifikasi teknis yang bisa langsung diimplementasikan**, menggunakan **Next.js standard** (tanpa Edge complexity), dan siap pakai sebagai **pedoman coding**.

---

# 🏋️ FitAI — Technical Specification Document v2.0

> **Status:** Ready for Development  
> **Stack:** Next.js 16 (App Router) + Neon DB (Serverless Postgres) + `@neondatabase/serverless` + Groq AI  
> **Auth:** Custom (bcrypt + JWT httpOnly cookie + Neon DB)  
> **Styling:** Tailwind CSS + shadcn/ui

---

## 📋 DAFTAR ISI SPESIFIKASI

1. [Project Setup & Dependencies](#1-project-setup--dependencies)
2. [Folder Structure](#2-folder-structure)
3. [Database Schema](#3-database-schema-neon-db)
4. [Database Client Configuration](#4-database-client-configuration)
5. [API Routes Specification](#5-api-routes-specification)
6. [AI Tools Definition (Groq Function Calling)](#6-ai-tools-definition-groq-function-calling)
7. [Frontend Components Architecture](#7-frontend-components-architecture)
8. [Authentication Flow](#8-authentication-flow)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Environment Variables](#10-environment-variables)

---

## 1. Project Setup & Dependencies

### Init Command

```bash
npx create-next-app@latest fitai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd fitai

# Core dependencies
npm install @neondatabase/serverless groq-sdk bcryptjs jose zod react-hook-form date-fns lucide-react recharts

# Type defs
npm install -D @types/bcryptjs

# UI components
npx shadcn@latest init
npx shadcn@latest add button input card dialog scroll-area avatar badge toast
```

### `package.json` (Key deps)

```json
{
  "dependencies": {
    "next": "^16.x",
    "react": "^19.x",
    "@neondatabase/serverless": "^0.x",
    "groq-sdk": "^0.x",
    "bcryptjs": "^2.x",
    "jose": "^5.x",
    "zod": "^3.x",
    "date-fns": "^3.x"
  }
}
```

---

## 2. Folder Structure

```
fitai/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Route group auth (login/register)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (main)/                    # Route group utama (requires auth)
│   │   │   ├── layout.tsx             # Sidebar/Header wrapper
│   │   │   ├── chat/
│   │   │   │   └── page.tsx           # Halaman chat utama
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Halaman analytics
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts           # POST: Chat with AI (streaming)
│   │   │   ├── workouts/
│   │   │   │   └── route.ts           # GET: List workouts
│   │   │   ├── analytics/
│   │   │   │   └── route.ts           # GET: Aggregated stats
│   │   │   └── health/
│   │   │       └── route.ts           # GET: Health check
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Redirect to /chat or /login
│   │   └── globals.css
│   │
│   ├── lib/
│   │   ├── db.ts                      # Neon client initialization
│   │   ├── utils.ts                   # cn() helper, formatDate, etc.
│   │   ├── groq.ts                    # Groq client + tool definitions
│   │   └── constants.ts               # App constants
│   │
│   ├── tools/                         # AI Tool implementations
│   │   ├── save-workout.ts
│   │   ├── save-cardio.ts
│   │   ├── save-nutrition.ts
│   │   ├── save-body-stats.ts
│   │   └── get-analytics.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn components (auto-generated)
│   │   ├── chat/
│   │   │   ├── chat-container.tsx     # Main chat orchestrator
│   │   │   ├── message-list.tsx       # Scrollable message list
│   │   │   ├── message-bubble.tsx     # User/AI message variant
│   │   │   ├── chat-input.tsx         # Input + send button
│   │   │   └── typing-indicator.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── workout-chart.tsx
│   │   │   └── progress-chart.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       └── header.tsx
│   │
│   ├── hooks/
│   │   ├── use-chat.ts                # Chat state management hook
│   │   └── use-user.ts                # User data fetching hook
│   │
│   └── types/
│       ├── database.ts                # Infer types dari schema (manual)
│       ├── groq.ts                    # Tool schemas (Zod)
│       └── api.ts                     # Request/Response types
│
├── .env.local.example
├── schema.sql                         # Database migration file
└── README.md
```

---

## 3. Database Schema (Neon DB)

**File:** `schema.sql`  
**Eksekusi di:** Neon Console → SQL Editor atau `psql`

```sql
-- ============================================================
-- FITAI SCHEMA - Neon PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    VARCHAR(100),
    goal            VARCHAR(50) DEFAULT 'maintenance' 
                    CHECK (goal IN ('bulking', 'cutting', 'maintenance', 'health')),
    activity_level  VARCHAR(20) DEFAULT 'moderate'
                    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- WORKOUTS (Strength Training)
-- ============================================================
CREATE TABLE workouts (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_name   VARCHAR(100) NOT NULL,
    weight_kg       DECIMAL(6,2),
    sets            INTEGER NOT NULL DEFAULT 1,
    reps            INTEGER NOT NULL DEFAULT 1,
    duration_min    INTEGER,
    notes           TEXT,
    rpe             INTEGER CHECK (rpe BETWEEN 1 AND 10),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, created_at DESC);
CREATE INDEX idx_workouts_exercise ON workouts(exercise_name);

-- ============================================================
-- CARDIO LOGS
-- ============================================================
CREATE TABLE cardio_logs (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL 
                    CHECK (type IN ('running', 'cycling', 'swimming', 'walking', 'hiit', 'other')),
    distance_km     DECIMAL(6,2),
    duration_min    INTEGER NOT NULL,
    pace_min_km     DECIMAL(4,2),
    calories_burned INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cardio_user_date ON cardio_logs(user_id, created_at DESC);

-- ============================================================
-- MEALS (Nutrition)
-- ============================================================
CREATE TABLE meals (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type       VARCHAR(20) NOT NULL 
                    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name       TEXT NOT NULL,
    calories        INTEGER,
    protein_g       DECIMAL(5,1),
    carbs_g         DECIMAL(5,1),
    fat_g           DECIMAL(5,1),
    portion_size    VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meals_user_date ON meals(user_id, created_at DESC);

-- ============================================================
-- BODY STATS
-- ============================================================
CREATE TABLE body_stats (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg       DECIMAL(5,2) NOT NULL,
    waist_cm        DECIMAL(5,2),
    notes           TEXT,
    recorded_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    
    CONSTRAINT unique_weight_per_day UNIQUE (user_id, recorded_at)
);

CREATE INDEX idx_body_stats_user_date ON body_stats(user_id, recorded_at DESC);

-- ============================================================
-- CHAT HISTORY (Context Retention)
-- ============================================================
CREATE TABLE chat_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL 
                    CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL,
    tool_calls      JSONB,
    tokens_used     INTEGER,
    model_used      VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_date ON chat_history(user_id, created_at DESC);
CREATE INDEX idx_chat_user_role ON chat_history(user_id, created_at DESC) 
    WHERE role != 'system';
```

---

## 4. Database Client Configuration

**File:** `src/lib/db.ts`

```typescript
import { neon } from '@neondatabase/serverless';

/**
 * Neon Serverless Driver
 * 
 * Cara kerja:
 * - Mode HTTP (default): Setiap query = 1 HTTP request ke Neon
 * - Tidak perlu connection pool (tidak ada persistent TCP)
 * - Cocok untuk serverless/Next.js API routes
 * - Auto-retry pada cold start
 */

export const sql = neon(process.env.DATABASE_URL!);

// Helper untuk transaction (jika butuh multiple writes atomic)
export async function transaction<T>(callback: (tx: typeof sql) => Promise<T>) {
  // Neon mendukung transaction via sql.begin() jika menggunakan driver dengan ws mode
  // Untuk HTTP mode sederhana, gunakan single query dulu
  // Upgrade ke ws mode jika butuh complex transaction:
  // import { neon } from '@neondatabase/serverless';
  // const sql = neon(process.env.DATABASE_URL!, { fullResults: true });
  return callback(sql);
}
```

---

## 5. API Routes Specification

### 5.1 POST `/api/chat` — Main Chat Endpoint

**Purpose:** Menerima pesan user, proses via Groq AI, eksekusi tools, stream response balik.

**Request:**
```typescript
interface ChatRequest {
  message: string;           // Pesan user dalam bahasa alami
  conversationId?: string;   // ID conversation (opsional, untuk history)
}
```

**Response:** `ReadableStream` (Server-Sent Events / Streaming)

**Implementation:**

```typescript
// src/app/api/chat/route.ts
import { groq } from '@/lib/groq';
import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);

    const { message } = await req.json();

    // 1. Simpan pesan user ke DB
    await sql`
      INSERT INTO chat_history (user_id, role, content)
      VALUES (${userId}, 'user', ${message})
    `;

    // 2. Ambil 20 pesan terakhir untuk context
    const history = await sql`
      SELECT role, content 
      FROM chat_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    const messages = formatMessagesForGroq(history.reverse());

    // 3. Call Groq dengan streaming + function calling
    const stream = await groq.chat.completions.create({
      messages,
      tools: getToolDefinitions(), // Definisi tools (lihat section 6)
      tool_choice: "auto",
      stream: true,
      temperature: 0.7,
    });

    // 4. Stream response ke client + handle tool calls
    return new Response(
      createStreamProcessor(stream, userId),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper: Process stream dan handle tool calls
async function* createStreamProcessor(stream: any, userId: string) {
  let toolCallBuffer: any[] = [];
  let currentToolCall: any = null;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    
    // Jika ada tool call, kumpulkan dulu
    if (delta?.tool_calls) {
      // Handle tool call accumulation...
      yield processToolCalls(toolCallBuffer, userId);
    } else if (delta?.content) {
      // Stream text biasa ke client
      yield `data: ${JSON.stringify({ content: delta.content })}\n\n`;
    }
  }

  yield 'data: [DONE]\n\n';
}
```

### 5.2 GET `/api/workouts` — Fetch Workout History

```typescript
// src/app/api/workouts/route.ts
import { sql } from '@/lib/db';
import { getUserId } from '@/lib/api-auth';

export async function GET(request: Request) {
  const userId = getUserId(request);

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit')) || 10;
  const offset = Number(searchParams.get('offset')) || 0;

  const workouts = await sql`
    SELECT 
      w.*,
      EXTRACT(EPOCH FROM w.created_at)::int as timestamp
    FROM workouts w
    WHERE w.user_id = ${userId}
    ORDER BY w.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return Response.json({ data: workouts });
}
```

### 5.3 GET `/api/analytics/overview` — Dashboard Stats

```typescript
// src/app/api/analytics/overview/route.ts
import { sql } from '@/lib/db';
import { getUserId } from '@/lib/api-auth';

export async function GET(req: Request) {
  const userId = getUserId(req);

  // Parallel fetch semua metrics
  const [workoutStats, nutritionStats, cardioStats, latestWeight] = await Promise.all([
    // Workouts this week
    sql`SELECT COUNT(*) as count, SUM(sets*reps) as volume FROM workouts 
        WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'`,
    
    // Nutrition today
    sql`SELECT COALESCE(SUM(calories), 0) as calories, COALESCE(SUM(protein_g), 0) as protein 
        FROM meals WHERE user_id = ${userId} AND DATE(created_at) = CURRENT_DATE`,
    
    // Cardio this week
    sql`SELECT COUNT(*) as sessions, SUM(duration_min) as total_min FROM cardio_logs 
        WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'`,
    
    // Latest weight
    sql`SELECT weight_kg, recorded_at FROM body_stats 
        WHERE user_id = ${userId} ORDER BY recorded_at DESC LIMIT 1`
  ]);

  return Response.json({
    weeklyWorkouts: workoutStats[0],
    todayNutrition: nutritionStats[0],
    weeklyCardio: cardioStats[0],
    latestWeight: latestWeight[0]
  });
}
```

---

## 6. AI Tools Definition (Groq Function Calling)

**File:** `src/lib/groq.ts`

```typescript
import Groq from 'groq-sdk';
import { saveWorkoutLog } from '@/tools/save-workout';
import { saveCardioLog } from '@/tools/save-cardio';
import { saveNutritionLog } from '@/tools/save-nutrition';
import { saveBodyStats } from '@/tools/save-body-stats';
import { getUserAnalytics } from '@/tools/get-analytics';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt yang memandu perilaku AI
export const SYSTEM_PROMPT = `Kamu adalah FitAI, asisten fitness pribadi yang ceria dan profesional.
Kamu berbicara bahasa Indonesia yang santai tapi informatif.
Kamu memiliki kemampuan untuk mencatat data fitness user melalui function calling.

Aturan penting:
1. Selalu konfirmasi data yang sudah dicatat dengan emoji yang sesuai
2. Berikan insight singkat setelah pencatatan (volume, pace, estimasi kalori)
3. Jika user tidak memberikan data yang cukup, minta klarifikasi
4. Gunakan RPE 1-10 hanya jika user menyebutkan intensitas
5. Format angka desimal dengan titik (.) bukan koma`;

// Definisi tools yang tersedia untuk AI
export function getToolDefinitions() {
  return [
    {
      type: "function" as const,
      function: {
        name: "save_workout_log",
        description: "Simpan log latihan gym/strength training. Panggil ketika user menyebutkan latihan angkat beban.",
        parameters: {
          type: "object",
          properties: {
            exercise_name: { type: "string", description: "Nama latihan (Bench Press, Squat, Deadlift, dll)" },
            weight_kg: { type: "number", description: "Beban kg. Null jika bodyweight." },
            sets: { type: "integer", description: "Jumlah set" },
            reps: { type: "integer", description: "Jumlah repetisi per set" },
            rpe: { type: "integer", description: "Intensitas 1-10. Opsional." },
            notes: { type: "string", description: "Catatan opsional" }
          },
          required: ["exercise_name", "sets", "reps"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "save_cardio_log",
        description: "Simpan log aktivitas cardio (lari, sepeda, renang, dll).",
        parameters: {
          type: "object",
          properties: {
            type: { 
              type: "string", 
              enum: ["running", "cycling", "swimming", "walking", "hiit", "other"],
              description: "Jenis aktivitas"
            },
            distance_km: { type: "number", description: "Jarak km. Opsional untuk HIIT." },
            duration_min: { type: "integer", description: "Durasi menit" },
            notes: { type: "string" }
          },
          required: ["type", "duration_min"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "save_nutrition_log",
        description: "Simpan log makanan/minuman user.",
        parameters: {
          type: "object",
          properties: {
            meal_type: { 
              type: "string", 
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Waktu makan"
            },
            food_name: { type: "string", description: "Nama makanan" },
            calories: { type: "number", description: "Kalori. Opsional." },
            protein_g: { type: "number", description: "Protein gram. Opsional." },
            portion_size: { type: "string", description: "Ukuran porsi. Opsional." }
          },
          required: ["meal_type", "food_name"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "save_body_stats",
        description: "Update berat badan user.",
        parameters: {
          type: "object",
          properties: {
            weight_kg: { type: "number", description: "Berat badan kg" },
            notes: { type: "string", description: "Kondisi pencatatan" }
          },
          required: ["weight_kg"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_user_analytics",
        description: "Ambil data analitik user untuk menjawab pertanyaan tentang progress.",
        parameters: {
          type: "object",
          properties: {
            period: { 
              type: "string", 
              enum: ["today", "week", "month"],
              description: "Periode waktu"
            },
            metric: { 
              type: "string", 
              enum: ["all", "workouts", "nutrition", "cardio", "weight"],
              description: "Metrik yang dianalisis"
            }
          },
          required: ["period", "metric"]
        }
      }
    }
  ];
}

// Executor: Memetakan nama tool ke fungsi implementasi
export async function executeToolCall(toolName: string, args: any, userId: string) {
  switch (toolName) {
    case 'save_workout_log':
      return await saveWorkoutLog({ ...args, userId });
    
    case 'save_cardio_log':
      return await saveCardioLog({ ...args, userId });
    
    case 'save_nutrition_log':
      return await saveNutritionLog({ ...args, userId });
    
    case 'save_body_stats':
      return await saveBodyStats({ ...args, userId });
    
    case 'get_user_analytics':
      return await getUserAnalytics({ ...args, userId });
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export { groq };
```

---

## 7. Tools Implementation Detail

**File:** `src/tools/save-workout.ts` (Contoh lengkap)

```typescript
import { sql } from '@/lib/db';

interface SaveWorkoutInput {
  userId: string;
  exerciseName: string;
  weightKg?: number | null;
  sets: number;
  reps: number;
  rpe?: number | null;
  notes?: string | null;
}

export async function saveWorkoutLog(input: SaveWorkoutInput) {
  try {
    const result = await sql`
      INSERT INTO workouts (
        user_id, 
        exercise_name, 
        weight_kg, 
        sets, 
        reps, 
        rpe, 
        notes, 
        created_at
      ) VALUES (
        ${input.userId},
        ${input.exerciseName},
        ${input.weightKg ?? null},
        ${input.sets},
        ${input.reps},
        ${input.rpe ?? null},
        ${input.notes ?? null},
        NOW()
      )
      RETURNING 
        id, 
        exercise_name, 
        weight_kg, 
        sets, 
        reps,
        (sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as total_volume
    `;

    const saved = result[0];
    
    return {
      success: true,
      data: {
        id: saved.id,
        exercise: saved.exercise_name,
        weight: saved.weight_kg,
        sets: saved.sets,
        reps: saved.reps,
        volume: Number(saved.total_volume)
      }
    };
  } catch (error) {
    console.error('[TOOL] saveWorkoutLog error:', error);
    return { success: false, error: 'Gagal menyimpan workout' };
  }
}
```

**File:** `src/tools/get-analytics.ts` (Contoh kompleks)

```typescript
import { sql } from '@/lib/db';

export async function getUserAnalytics(params: {
  userId: string;
  period: 'today' | 'week' | 'month';
  metric: 'all' | 'workouts' | 'nutrition' | 'cardio' | 'weight';
}) {
  const { userId, period, metric } = params;
  
  // Tentukan date filter
  const periodMap = {
    today: "DATE(created_at) = CURRENT_DATE",
    week: "created_at >= NOW() - INTERVAL '7 days'",
    month: "created_at >= NOW() - INTERVAL '30 days'"
  };
  const dateFilter = periodMap[period];

  // Jika metric specific, ambil hanya yang relevan
  if (metric === 'workouts') {
    const data = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(sets * reps) as total_reps,
        SUM(sets * reps * COALESCE(weight_kg, 0))::decimal(12,2) as total_volume,
        COUNT(DISTINCT exercise_name) as unique_exercises,
        MAX(weight_kg) as heaviest_lift
      FROM workouts 
      WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}
    `;
    return { metric: 'workouts', period, data: data[0] };
  }

  if (metric === 'nutrition') {
    const data = await sql`
      SELECT 
        COUNT(*) as total_meals,
        COALESCE(SUM(calories), 0) as total_calories,
        COALESCE(SUM(protein_g), 0)::decimal(8,1) as total_protein,
        COALESCE(AVG(calories), 0)::decimal(8,1) as avg_per_meal
      FROM meals 
      WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}
    `;
    return { metric: 'nutrition', period, data: data[0] };
  }

  if (metric === 'cardio') {
    const data = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(distance_km), 0)::decimal(6,2) as total_distance,
        COALESCE(SUM(duration_min), 0) as total_minutes,
        COALESCE(SUM(calories_burned), 0) as total_calories_burned
      FROM cardio_logs 
      WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}
    `;
    return { metric: 'cardio', period, data: data[0] };
  }

  if (metric === 'weight') {
    const data = await sql`
      SELECT 
        COUNT(*) as entries,
        MIN(weight_kg)::decimal(5,2) as min_weight,
        MAX(weight_kg)::decimal(5,2) as max_weight,
        AVG(weight_kg)::decimal(5,2) as avg_weight,
        (MAX(weight_kg) - MIN(weight_kg))::decimal(5,2) as change_kg
      FROM body_stats 
      WHERE user_id = ${userId} 
        AND recorded_at >= CASE 
          WHEN ${period} = 'today' THEN CURRENT_DATE
          WHEN ${period} = 'week' THEN CURRENT_DATE - 7
          WHEN ${period} = 'month' THEN CURRENT_DATE - 30
        END
    `;
    return { metric: 'weight', period, data: data[0] };
  }

  // Default: all metrics (parallel queries)
  const [workouts, nutrition, cardio, weight] = await Promise.all([
    sql`SELECT COUNT(*) as c, SUM(sets*reps*COALESCE(weight_kg,0))::decimal as v FROM workouts WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}`,
    sql`SELECT COALESCE(SUM(calories),0) as cal, COALESCE(SUM(protein_g),0)::decimal as pro FROM meals WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}`,
    sql`SELECT COUNT(*) as c, SUM(duration_min) as m FROM cardio_logs WHERE user_id = ${userId} AND ${sql.unsafe(dateFilter)}`,
    sql`SELECT AVG(weight_kg)::decimal as avg_w FROM body_stats WHERE user_id = ${userId} AND recorded_at >= CASE WHEN ${period}='week' THEN CURRENT_DATE-7 ELSE CURRENT_DATE-30 END`
  ]);

  return {
    metric: 'all',
    period,
    data: {
      workouts: workouts[0],
      nutrition: nutrition[0],
      cardio: cardio[0],
      weight: weight[0]
    }
  };
}
```

---

## 8. Frontend Components Architecture

### 8.1 Chat Page (Main Feature)

**File:** `src/app/(main)/chat/page.tsx`

```tsx
'use client';

import { ChatContainer } from '@/components/chat/chat-container';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ChatContainer />
    </div>
  );
}
```

**File:** `src/components/chat/chat-container.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { useChat } from '@/hooks/use-chat';

export function ChatContainer() {
  const {
    messages,
    isLoading,
    sendMessage,
    isStreaming
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-lg">FitAI Coach</h2>
        <p className="text-xs text-muted-foreground">Online • Powered by Llama 3</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <p className="text-lg mb-2">🏋️ Halo! Saya FitAI</p>
            <p>Catat latihan kamu dengan bahasa alami.</p>
            <p className="text-sm mt-2">Contoh: &quot;Tadi bench press 80kg 4 set 12 rep&quot;</p>
          </div>
        )}
        
        <MessageList messages={messages} />
        
        {(isStreaming || isLoading) && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={sendMessage} 
        disabled={isStreaming || isLoading} 
      />
    </div>
  );
}
```

### 8.2 Custom Hook: `use-chat.ts`

**File:** `src/hooks/use-chat.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    // Optimistic update: tambahkan pesan user ke UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantContent = '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        metadata: { toolCalls: [] }
      };

      // Tambahkan placeholder message untuk streaming
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.content) {
                  assistantContent += parsed.content;
                  
                  // Update message secara real-time
                  setMessages(prev => 
                    prev.map(m => 
                      m.id === assistantMessage.id 
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
                
                if (parsed.toolCallResult) {
                  // Handle tool call metadata jika perlu ditampilkan
                  console.log('Tool executed:', parsed.toolCallResult);
                }
              } catch (e) {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Send message error:', error);
      // Tambahkan error message ke chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Coba lagi ya!',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  return { messages, isLoading, isStreaming, sendMessage };
}
```

---

## 9. Authentication Flow

**Approach:** Custom auth — bcrypt password hashing + JWT (jose) di httpOnly cookie + Neon DB.

> Detail lengkap implementasi auth ada di `docs/milestones/m2-auth.md`

**Middleware:** `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/health'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('fitai_session')?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('fitai_session');
    return response;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)']
};
```

**Layout Wrapper:** `src/app/layout.tsx`

```tsx
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## 10. Error Handling Strategy

### Global Error Boundary

**File:** `src/app/error-boundary.tsx`

```tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button 
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
```

### API Error Handler Utility

**File:** `src/lib/api-utils.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.statusCode },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Zod validation helper
import { ZodError } from 'zod';

export function fromZodError(error: ZodError): { field: string; message: string }[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}
```

---

## 11. Environment Variables Template

**File:** `.env.local.example`

```bash
# ==========================================
# FITAI ENVIRONMENT VARIABLES
# Copy this file to .env.local and fill in
# ==========================================

# DATABASE (Neon)
# Format: postgresql://username:password@ep-region-name.project-owner.aws.neon.tech/dbname?sslmode=require
DATABASE_URL="postgresql://your_username:your_password@ep-cool-name.us-east-2.aws.neon.tech/fitai?sslmode=require"

# AUTHENTICATION (Custom JWT)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="random-string-min-32-chars"

# AI (Groq)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
# Model options: llama3-70b-8192 (smart), llama3-8b-8192 (fast), mixtral-8x7b-32768 (balanced)
GROQ_MODEL=llama3-70b-8192

# APP (Optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Development Checklist (Run Order)

Setelah clone repo / init project, ikuti urutan ini:

### Phase 1: Infrastructure (Day 1)
- [ ] Setup Neon DB, jalankan `schema.sql`, copy connection string
- [ ] Generate JWT_SECRET untuk auth
- [ ] Setup Groq account, dapatkan API key
- [ ] Isi `.env.local` dengan semua keys
- [ ] Jalankan `npm run dev`, pastikan tidak error

### Phase 2: Core Integration (Day 2)
- [ ] Buat `src/lib/db.ts`, test koneksi ke Neon dengan endpoint `/api/health`
- [ ] Buat `src/middleware.ts`, test auth redirect
- [ ] Implementasi 1 tool dulu (`save-workout`) + test manual via curl/Postman
- [ ] Implementasi `/api/chat` tanpa streaming dulu, pastikan Groq bisa panggil tool

### Phase 3: UI & Streaming (Day 3-4)
- [ ] Build Chat UI (message list, input, bubble)
- [ ] Implementasi streaming di `/api/chat`
- [ ] Hubungkan `use-chat` hook ke UI
- [ ] Test end-to-end: User ketik → AI jawab → Data masuk Neon

### Phase 4: Complete Features (Day 5-7)
- [ ] Implementasi semua 5 tools
- [ ] Build Dashboard page (fetch `/api/analytics`)
- [ ] Styling polish (dark mode, responsive)

---