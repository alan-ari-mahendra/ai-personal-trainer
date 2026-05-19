import { getGroq, GROQ_MODEL, SYSTEM_PROMPT, ONBOARDING_PROMPT } from '@/lib/groq';
import { getToolDefinitions } from '@/lib/tool-definitions';
import { executeToolCall } from '@/lib/tool-executor';
import { getUserId } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { chatHistory } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

type ChatMessage = {
  role: string;
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

export async function POST(req: Request) {
  let userId: string;
  let message: string;

  let mode: 'chat' | 'onboarding' = 'chat';

  try {
    userId = getUserId(req);
    const body = await req.json();
    message = body.message;
    if (body.mode === 'onboarding') mode = 'onboarding';
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const isOnboarding = mode === 'onboarding';

  // Only save to chat_history in normal chat mode
  if (!isOnboarding) {
    await db.insert(chatHistory).values({
      userId,
      role: 'user',
      content: message,
    });
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: isOnboarding ? ONBOARDING_PROMPT : SYSTEM_PROMPT },
  ];

  if (!isOnboarding) {
    // Fetch last 20 messages for context
    const history = await db.select({
      role: chatHistory.role,
      content: chatHistory.content,
    }).from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(desc(chatHistory.createdAt))
      .limit(20);
    messages.push(
      ...history.reverse().map((h) => ({
        role: h.role,
        content: h.content,
      })),
    );
  }

  // Add current user message
  messages.push({ role: 'user', content: message });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const finalContent = isOnboarding
          ? await processOnboardingStream(messages, controller, encoder)
          : await processWithToolLoop(messages, userId, controller, encoder);

        // Only save to chat_history in normal chat mode
        if (!isOnboarding) {
          await db.insert(chatHistory).values({
            userId,
            role: 'assistant',
            content: finalContent,
            modelUsed: GROQ_MODEL,
          });
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream error' })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Stream Groq responses, handle tool calls mid-stream, loop until pure text.
 * Returns the final accumulated text content.
 */
async function processWithToolLoop(
  messages: ChatMessage[],
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Promise<string> {
  const groq = getGroq();
  let finalContent = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: messages as Parameters<
        typeof groq.chat.completions.create
      >[0]['messages'],
      tools: getToolDefinitions(),
      tool_choice: 'auto',
      stream: true,
      temperature: 0.7,
    });

    let contentBuffer = '';
    const toolCalls = new Map<
      number,
      { id: string; name: string; arguments: string }
    >();
    let hasToolCalls = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      // Accumulate + stream text content
      if (delta?.content) {
        contentBuffer += delta.content;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: delta.content })}\n\n`,
          ),
        );
      }

      // Accumulate tool call chunks
      if (delta?.tool_calls) {
        hasToolCalls = true;
        for (const tc of delta.tool_calls) {
          const existing = toolCalls.get(tc.index) || {
            id: '',
            name: '',
            arguments: '',
          };
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments)
            existing.arguments += tc.function.arguments;
          toolCalls.set(tc.index, existing);
        }
      }
    }

    // No tool calls — done
    if (!hasToolCalls) {
      finalContent = contentBuffer;
      break;
    }

    // Build assistant message with tool_calls
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: contentBuffer || null,
      tool_calls: [],
    };

    // Execute each tool call
    for (const [, tc] of toolCalls) {
      assistantMsg.tool_calls!.push({
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments },
      });

      const args = JSON.parse(tc.arguments);
      const result = await executeToolCall(tc.name, args, userId);

      // Notify client of tool result
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ toolResult: { tool: tc.name, result } })}\n\n`,
        ),
      );

      // Add tool result to messages for next Groq call
      messages.push(assistantMsg);
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  return finalContent;
}

/**
 * Simple streaming for onboarding — no tools, just stream text.
 */
async function processOnboardingStream(
  messages: ChatMessage[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Promise<string> {
  const groq = getGroq();
  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: messages as Parameters<
      typeof groq.chat.completions.create
    >[0]['messages'],
    stream: true,
    temperature: 0.7,
  });

  let content = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      content += delta;
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`),
      );
    }
  }
  return content;
}
