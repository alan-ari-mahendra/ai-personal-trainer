'use client';

import { useState, useCallback, useRef } from 'react';
import { Message } from '@/types/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const assistantId = generateId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);
    setIsLoading(true);
    setIsStreaming(true);

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
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
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);

          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + parsed.content }
                    : msg,
                ),
              );
            }
            // toolResult events are received but not rendered for now
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
        isError: true,
      };

      // Replace the empty assistant placeholder with the error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== assistantId);
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  return { messages, isLoading, isStreaming, sendMessage };
}
