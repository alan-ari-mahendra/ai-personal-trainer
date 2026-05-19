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

/** Strip FORM_DATA markers from content for display (works mid-stream too) */
function stripMarkers(raw: string): string {
  // Full block present — remove it
  if (FORM_DATA_REGEX.test(raw)) {
    return raw.replace(FORM_DATA_REGEX, '').trim();
  }
  // Partial marker at end (still streaming) — hide from ---FORM_DATA--- onward
  const markerStart = raw.indexOf('---FORM_DATA---');
  if (markerStart !== -1) {
    return raw.slice(0, markerStart).trim();
  }
  // Partial "---" building up at end
  if (raw.endsWith('-') || raw.endsWith('--') || raw.endsWith('---')) {
    const dashStart = raw.lastIndexOf('---');
    if (dashStart > 0 && raw.length - dashStart <= 16) {
      return raw.slice(0, dashStart).trim();
    }
  }
  return raw;
}

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
  currentFormData?: Record<string, string>,
): UseOnboardingChatReturn {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<OnboardingMessage[]>([]);

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

      // Build last 6 conversation turns for context
      const history = messagesRef.current
        .filter((m) => m.content)
        .map((m) => ({ role: m.role as string, content: m.content }))
        .slice(-6);

      setMessages((prev) => {
        const next: OnboardingMessage[] = [
          ...prev,
          userMessage,
          { id: assistantId, role: 'assistant' as const, content: '' },
        ];
        messagesRef.current = next;
        return next;
      });
      setIsStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let fullContent = '';

      try {
        console.log('[Onboarding] Sending:', trimmed);
        console.log('[Onboarding] History:', history);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            mode: 'onboarding',
            history,
            formState: currentFormData,
          }),
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
                // Show content with markers stripped in real-time
                const display = stripMarkers(fullContent);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: display }
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
        console.log('[Onboarding] Raw response:', fullContent);
        const { displayContent, formUpdates } = extractFormData(fullContent);
        console.log('[Onboarding] Parsed form updates:', formUpdates);
        console.log('[Onboarding] Display content:', displayContent);

        if (formUpdates) {
          onFormUpdate(formUpdates);
        }

        setMessages((prev) => {
          const next = prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: displayContent, formUpdates }
              : msg,
          );
          messagesRef.current = next;
          return next;
        });
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
