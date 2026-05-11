# Milestone 5: Chat UI

> **Dependencies:** M4 (streaming)  
> **Output:** Full chat interface — message list, input, streaming display, tool call indicators

---

## Scope

Semua chat frontend components. Hook `use-chat` connect ke streaming API. Layout dengan sidebar.

## Tasks

### 5.1 Layout Components

**File:** `src/app/(main)/layout.tsx`

```tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**File:** `src/components/layout/sidebar.tsx`

Spec:
- Logo + app name di atas
- Nav links: Chat (aktif), Dashboard, Settings
- User info + logout button di bawah
- Collapsible di mobile (responsive)
- Gunakan `lucide-react` icons: `MessageSquare`, `BarChart3`, `Settings`, `LogOut`

**File:** `src/components/layout/header.tsx`

Spec:
- Tampilkan nama halaman aktif
- Mobile menu toggle button
- Minimalis — tidak perlu banyak element

### 5.2 Chat Components

**File:** `src/components/chat/chat-container.tsx`

Spec sama seperti PRD section 8.1 — orchestrator yang menggunakan `useChat()` hook.

**File:** `src/components/chat/message-list.tsx`

```tsx
import { Message } from '@/types/api';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

**File:** `src/components/chat/message-bubble.tsx`

Spec:
- User message: align right, background primary
- Assistant message: align left, background muted
- Error message: border destructive, icon warning
- Support markdown rendering (bold, list, code) — cukup pakai regex sederhana atau `dangerouslySetInnerHTML` dengan sanitize, atau library `react-markdown` jika mau
- Timestamp kecil di bawah bubble

**File:** `src/components/chat/chat-input.tsx`

Spec:
- Textarea (bukan input) — support multi-line
- Send button (atau Enter untuk kirim, Shift+Enter untuk newline)
- Disabled state saat streaming
- Auto-focus on mount
- Auto-resize textarea based on content

**File:** `src/components/chat/typing-indicator.tsx`

Spec:
- 3 animated dots
- Muncul saat `isStreaming || isLoading`
- Align left (posisi assistant)

### 5.3 `use-chat` Hook

**File:** `src/hooks/use-chat.ts`

Sama seperti PRD section 8.2, dengan penyesuaian:
- Fetch ke `/api/chat` (no auth header needed — cookie otomatis)
- Parse SSE stream
- Handle `toolResult` events — simpan di message metadata
- Update message content secara real-time per chunk

### 5.4 Chat Page

**File:** `src/app/(main)/chat/page.tsx`

```tsx
'use client';

import { ChatContainer } from '@/components/chat/chat-container';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <ChatContainer />
    </div>
  );
}
```

### 5.5 Welcome State

Saat belum ada messages:
- Tampilkan greeting + contoh prompt
- Contoh prompt bisa diklik untuk auto-fill input
- Contoh: "Bench press 80kg 4x12", "Lari 5km 30 menit", "Makan nasi goreng"

## Acceptance Criteria

- [ ] Chat page render dengan sidebar, header, message area, input
- [ ] Ketik pesan → muncul di message list sebagai user bubble
- [ ] Response AI muncul secara streaming (huruf per huruf)
- [ ] Tool call result muncul di chat (badge/indicator)
- [ ] Enter kirim pesan, Shift+Enter newline
- [ ] Input disabled saat streaming
- [ ] Auto-scroll ke message terbaru
- [ ] Welcome state muncul saat belum ada messages
- [ ] Contoh prompt bisa diklik
- [ ] Responsive — sidebar collapse di mobile
- [ ] Logout button berfungsi (clear cookie, redirect ke `/login`)

## Component Tree

```
(main)/layout.tsx
├── Sidebar
│   ├── Logo
│   ├── NavLinks (Chat, Dashboard, Settings)
│   └── UserInfo + LogoutButton
├── Header
│   └── PageTitle + MobileMenuToggle
└── chat/page.tsx
    └── ChatContainer
        ├── ChatHeader ("FitAI Coach" + status)
        ├── MessageList
        │   └── MessageBubble[] (user | assistant | error)
        ├── TypingIndicator (conditional)
        └── ChatInput (textarea + send button)
```
