# Milestone 4: Chat Streaming (SSE)

> **Dependencies:** M3 (chat core)  
> **Output:** Response AI di-stream ke client via Server-Sent Events

---

## Scope

Upgrade `/api/chat` dari response biasa ke streaming. Handle tool calls mid-stream. Client menerima teks secara incremental.

## Tasks

### 4.1 Update Chat API — Streaming Response

**File:** `src/app/api/chat/route.ts` (replace M3 version)

Alur streaming dengan tool calls:

```
User message
    → Groq stream start
    → Jika ada tool_calls di stream:
        1. Kumpulkan semua tool call chunks
        2. Execute tools
        3. Send tool results kembali ke Groq (stream baru)
        4. Stream response final ke client
    → Jika pure text:
        1. Stream langsung ke client chunk by chunk
    → Save final content ke chat_history
```

**Implementation pattern:**

```typescript
export async function POST(req: Request) {
  const userId = getUserId(req);
  const { message } = await req.json();

  // ... save user message & build history (sama seperti M3) ...

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const finalContent = await processWithToolLoop(messages, userId, controller, encoder);

        // Save assistant response
        await sql`
          INSERT INTO chat_history (user_id, role, content, model_used)
          VALUES (${userId}, 'assistant', ${finalContent}, ${GROQ_MODEL})
        `;

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 4.2 Tool Call Accumulation dari Stream

Tool calls datang di stream dalam chunks. Harus dikumpulkan dulu sebelum execute.

```typescript
async function processWithToolLoop(
  messages: any[],
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<string> {
  let finalContent = '';

  while (true) {
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools: getToolDefinitions(),
      tool_choice: 'auto',
      stream: true,
      temperature: 0.7,
    });

    let contentBuffer = '';
    let toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
    let hasToolCalls = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const finishReason = chunk.choices[0]?.finish_reason;

      // Accumulate text content
      if (delta?.content) {
        contentBuffer += delta.content;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`)
        );
      }

      // Accumulate tool calls
      if (delta?.tool_calls) {
        hasToolCalls = true;
        for (const tc of delta.tool_calls) {
          const existing = toolCalls.get(tc.index) || { id: '', name: '', arguments: '' };
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments) existing.arguments += tc.function.arguments;
          toolCalls.set(tc.index, existing);
        }
      }
    }

    // Jika tidak ada tool calls, selesai
    if (!hasToolCalls) {
      finalContent = contentBuffer;
      break;
    }

    // Execute tool calls
    const assistantMsg: any = { role: 'assistant', tool_calls: [] };
    const toolResults: any[] = [];

    for (const [_, tc] of toolCalls) {
      assistantMsg.tool_calls.push({
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments },
      });

      const args = JSON.parse(tc.arguments);
      const result = await executeToolCall(tc.name, args, userId);

      // Notify client tool executed
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ toolResult: { tool: tc.name, result } })}\n\n`)
      );

      toolResults.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    // Tambahkan ke messages dan loop kembali
    messages.push(assistantMsg, ...toolResults);
  }

  return finalContent;
}
```

### 4.3 SSE Event Format

Client akan menerima events dalam format:

```
data: {"content":"Oke, saya catat..."}

data: {"content":" bench press"}

data: {"toolResult":{"tool":"save_workout_log","result":{"success":true,"data":{...}}}}

data: {"content":"Workout sudah dicatat! 💪"}

data: [DONE]
```

## Acceptance Criteria

- [ ] Response di-stream — teks muncul incremental, bukan sekaligus
- [ ] Tool calls di-handle mid-stream — tool execute, result dikirim ke Groq, response final di-stream
- [ ] Multiple tool calls dalam satu turn berfungsi
- [ ] Client menerima `toolResult` event saat tool selesai execute
- [ ] Stream ditutup dengan `[DONE]`
- [ ] Chat history tetap tersimpan (full final content)
- [ ] Error mid-stream di-handle — client dapat error event, stream ditutup

## Testing

```bash
# curl streaming test
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: fitai_session=<token>" \
  -d '{"message":"bench press 80kg 4x12"}'
```
