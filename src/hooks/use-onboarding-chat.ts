'use client';

import { useState, useCallback, useRef } from 'react';

export interface OnboardingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formUpdates?: Record<string, unknown>;
}

interface UseOnboardingChatReturn {
  messages: OnboardingMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const FORM_DATA_REGEX =
  /---FORM_DATA---\n?([\s\S]*?)\n?---END_FORM_DATA---\n?/;

function extractFormData(raw: string): {
  displayContent: string;
  formUpdates: Record<string, unknown> | undefined;
} {
  const match = raw.match(FORM_DATA_REGEX);
  if (!match) return { displayContent: raw, formUpdates: undefined };

  try {
    const parsed = JSON.parse(match[1]);
    const displayContent = raw
      .replace(FORM_DATA_REGEX, '')
      .trim();
    return { displayContent, formUpdates: parsed.form_updates ?? parsed };
  } catch {
    return { displayContent: raw, formUpdates: undefined };
  }
}

export function useOnboardingChat(
  onFormUpdate: (updates: Record<string, unknown>) => void,
): UseOnboardingChatReturn {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMessage: OnboardingMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
      };

      const assistantId = generateId();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setIsStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let fullContent = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, mode: 'onboarding' }),
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            const data = trimmedLine.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                // During streaming show raw content (markers will be cleaned up after)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: fullContent }
                      : msg,
                  ),
                );
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        // Stream complete — extract form data and clean display content
        const { displayContent, formUpdates } = extractFormData(fullContent);

        if (formUpdates) {
          onFormUpdate(formUpdates);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: displayContent, formUpdates }
              : msg,
          ),
        );
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;

        const errorMessage: OnboardingMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan. Silakan coba lagi.',
        };

        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== assistantId);
          return [...filtered, errorMessage];
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [onFormUpdate],
  );

  return { messages, isStreaming, sendMessage };
}
