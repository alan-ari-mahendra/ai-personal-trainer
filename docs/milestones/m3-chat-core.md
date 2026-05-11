# Milestone 3: Chat Core (API + 1 Tool, Non-Streaming)

> **Dependencies:** M2 (auth)  
> **Output:** User bisa kirim pesan, AI jawab, workout tersimpan di DB

---

## Scope

Implementasi `/api/chat` tanpa streaming dulu. Satu tool (`save_workout_log`) berfungsi end-to-end. Fokus: Groq integration, tool call handling, chat history.

## Tasks

### 3.1 Groq Client

**File:** `src/lib/groq.ts`

```typescript
import Groq from 'groq-sdk';

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';

export const SYSTEM_PROMPT = `Kamu adalah FitAI, asisten fitness pribadi yang ceria dan profesional.
Kamu berbicara bahasa Indonesia yang santai tapi informatif.
Kamu memiliki kemampuan untuk mencatat data fitness user melalui function calling.

Aturan:
1. Selalu konfirmasi data yang sudah dicatat
2. Berikan insight singkat setelah pencatatan (volume, estimasi kalori)
3. Jika user tidak memberikan data cukup, minta klarifikasi
4. Gunakan RPE 1-10 hanya jika user menyebutkan intensitas
5. Format angka desimal dengan titik (.) bukan koma`;
```

### 3.2 Tool Definition + Implementation

**File:** `src/lib/tool-definitions.ts`

```typescript
// Tool definitions untuk Groq function calling
// Sama seperti PRD section 6, tapi hanya save_workout_log dulu

export function getToolDefinitions() {
  return [
    {
      type: "function" as const,
      function: {
        name: "save_workout_log",
        description: "Simpan log latihan gym/strength training.",
        parameters: {
          type: "object",
          properties: {
            exercise_name: { type: "string", description: "Nama latihan" },
            weight_kg: { type: "number", description: "Beban kg. Null jika bodyweight." },
            sets: { type: "integer", description: "Jumlah set" },
            reps: { type: "integer", description: "Jumlah repetisi per set" },
            rpe: { type: "integer", description: "Intensitas 1-10. Opsional." },
            notes: { type: "string", description: "Catatan opsional" }
          },
          required: ["exercise_name", "sets", "reps"]
        }
      }
    }
  ];
}
```

**File:** `src/tools/save-workout.ts` — sama seperti PRD section 7.

### 3.3 Tool Executor

**File:** `src/lib/tool-executor.ts`

```typescript
import { saveWorkoutLog } from '@/tools/save-workout';

export async function executeToolCall(toolName: string, args: Record<string, unknown>, userId: string) {
  switch (toolName) {
    case 'save_workout_log':
      return saveWorkoutLog({ ...args, userId } as any);
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
```

### 3.4 Chat API Route (Non-Streaming)

**File:** `src/app/api/chat/route.ts`

```typescript
import { groq, GROQ_MODEL, SYSTEM_PROMPT } from '@/lib/groq';
import { getToolDefinitions } from '@/lib/tool-definitions';
import { executeToolCall } from '@/lib/tool-executor';
import { getUserId } from '@/lib/api-auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const userId = getUserId(req);
  const { message } = await req.json();

  // 1. Simpan pesan user
  await sql`
    INSERT INTO chat_history (user_id, role, content)
    VALUES (${userId}, 'user', ${message})
  `;

  // 2. Ambil 20 pesan terakhir
  const history = await sql`
    SELECT role, content FROM chat_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 20
  `;

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.reverse().map(h => ({ role: h.role, content: h.content }))
  ];

  // 3. Call Groq
  let completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    tools: getToolDefinitions(),
    tool_choice: 'auto',
    temperature: 0.7,
  });

  let assistantMessage = completion.choices[0].message;

  // 4. Handle tool calls (loop sampai tidak ada tool call lagi)
  while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    // Tambahkan assistant message ke history
    messages.push(assistantMessage);

    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeToolCall(toolCall.function.name, args, userId);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    // Call Groq again with tool results
    completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools: getToolDefinitions(),
      tool_choice: 'auto',
      temperature: 0.7,
    });

    assistantMessage = completion.choices[0].message;
  }

  const responseContent = assistantMessage.content || '';

  // 5. Simpan response ke chat history
  await sql`
    INSERT INTO chat_history (user_id, role, content, model_used)
    VALUES (${userId}, 'assistant', ${responseContent}, ${GROQ_MODEL})
  `;

  return Response.json({ content: responseContent });
}
```

### 3.5 Types

**File:** `src/types/api.ts`

```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  content: string;
}
```

## Acceptance Criteria

- [ ] `POST /api/chat` dengan `{ "message": "bench press 80kg 4 set 12 rep" }` → AI response yang konfirmasi workout
- [ ] Data workout masuk ke tabel `workouts` di Neon DB
- [ ] Chat history tersimpan (user message + assistant response)
- [ ] Tool call loop bekerja — Groq panggil tool, terima result, generate final response
- [ ] Kalau pesan biasa (bukan workout), AI tetap jawab normal tanpa tool call
- [ ] Auth required — request tanpa cookie return 401

## Known Limitations (akan di-fix di M4)

- Response tidak streaming — user harus tunggu sampai selesai
- Hanya 1 tool (save_workout_log)
- Belum ada UI — test via curl/Postman
