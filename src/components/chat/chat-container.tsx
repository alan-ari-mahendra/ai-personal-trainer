'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { Dumbbell } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  'Bench press 80kg 4x12',
  'Lari 5km 30 menit',
  'Makan nasi goreng tadi siang',
];

export function ChatContainer() {
  const { messages, isLoading, isStreaming, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold">FitAI Coach</h1>
        <p className="text-xs text-muted-foreground">
          Online &middot; Powered by Llama 3
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Dumbbell className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Halo! Saya FitAI
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Catat latihan kamu dengan bahasa alami.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              {isStreaming && <div className="mt-4"><TypingIndicator /></div>}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
