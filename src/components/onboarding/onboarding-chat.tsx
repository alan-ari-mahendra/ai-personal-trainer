'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useOnboardingChat,
  type OnboardingMessage,
} from '@/hooks/use-onboarding-chat';

interface OnboardingChatProps {
  onFormUpdate: (updates: Record<string, unknown>) => void;
}

const FIELD_LABELS: Record<string, string> = {
  display_name: 'Nama',
  gender: 'Gender',
  age: 'Umur',
  height_cm: 'Tinggi',
  weight_kg: 'Berat',
  goal: 'Goal',
  activity_level: 'Level',
  exercise_history: 'Riwayat',
  injuries: 'Cedera',
  address: 'Alamat',
};

const GENDER_DISPLAY: Record<string, string> = {
  male: 'Pria',
  female: 'Wanita',
  other: 'Lainnya',
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (key === 'gender') return GENDER_DISPLAY[str] ?? str;
  if (key === 'height_cm') return `${str} cm`;
  if (key === 'weight_kg') return `${str} kg`;
  if (key === 'age') return `${str} tahun`;
  if (key === 'goal' || key === 'activity_level') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}

const HINTS = [
  'Sedentary, kerja kantoran',
  'Punya cedera lutut',
  'Goal bulking lean',
];

const GREETING: OnboardingMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Halo! Gue JASON. \u{1F44B} Ceritain aja tentang kamu \u2014 berat badan, tinggi, pengalaman olahraga, dan tujuan fitness kamu. Nanti gue bantu isi formnya otomatis!',
};

export function OnboardingChat({ onFormUpdate }: OnboardingChatProps) {
  const { messages, isStreaming, sendMessage } =
    useOnboardingChat(onFormUpdate);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allMessages = [GREETING, ...messages];

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [allMessages.length, messages[messages.length - 1]?.content]);

  function handleSend() {
    const value = input.trim();
    if (!value || isStreaming) return;
    setInput('');
    sendMessage(value);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleHint(hint: string) {
    setInput(hint);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            AI Assistant
          </span>
          <span className="inline-block h-2 w-2 rounded-full bg-lime-500" />
          <span className="text-xs text-lime-500">Live</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Chat Sama JASON
        </h2>
        <p className="text-sm text-zinc-500">
          Personal AI Trainer kamu siap bantu
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="space-y-4 p-6">
          {allMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isStreaming && (
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="inline-block h-2 w-2 rounded-full bg-lime-500" />
                <span>JASON lagi mikir</span>
                <span className="inline-flex gap-0.5">
                  <span className="animate-bounce text-lime-500 [animation-delay:0ms]">
                    .
                  </span>
                  <span className="animate-bounce text-lime-500 [animation-delay:150ms]">
                    .
                  </span>
                  <span className="animate-bounce text-lime-500 [animation-delay:300ms]">
                    .
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ceritain tentang kamu..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="h-11 w-11 shrink-0 bg-lime-500 text-zinc-950 hover:bg-lime-400 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Hint buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {HINTS.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => handleHint(hint)}
              className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-lime-500/40 hover:text-lime-500"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: OnboardingMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-zinc-800 px-4 py-3 text-sm text-zinc-100">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  const chipEntries = message.formUpdates
    ? Object.entries(message.formUpdates).filter(
        ([, v]) => v !== null && v !== undefined,
      )
    : [];

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        {/* Label */}
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-lime-500" />
          <span className="text-xs font-semibold text-lime-500">JASON</span>
        </div>

        {/* Bubble */}
        <div className="rounded-2xl rounded-tl-sm border-l-2 border-lime-500/60 bg-lime-500/5 px-4 py-3 text-sm text-zinc-200">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Form update chips */}
        {chipEntries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chipEntries.map(([key, value]) => {
              const label = FIELD_LABELS[key] ?? key;
              const display = formatValue(key, value);
              return (
                <button
                  key={key}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-lime-500/30 px-2.5 py-0.5 font-mono text-xs text-lime-500 transition-colors hover:bg-lime-500/10"
                >
                  <span>✅</span>
                  <span>
                    {label}: {display}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
