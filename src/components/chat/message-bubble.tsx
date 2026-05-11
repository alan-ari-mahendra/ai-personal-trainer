'use client';

import { Message } from '@/types/api';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[80%]">
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm',
            isError && 'border border-destructive bg-destructive/10',
          )}
        >
          {isError && (
            <div className="flex items-center gap-1.5 mb-1 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Error</span>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p
          className={cn(
            'text-[10px] text-muted-foreground mt-1 px-1',
            isUser ? 'text-right' : 'text-left',
          )}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
