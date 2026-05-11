@AGENTS.md

# AI Personal Trainer — Project Rules

## Git

- NEVER push to remote. Commit only when asked.

## shadcn/ui Components

- To add new shadcn components, use `npx shadcn@latest add <component> -y`.
- If the command fails (deprecated, registry error, etc.), tell the user to add it manually via the shadcn CLI. Do NOT write shadcn component files by hand.
- NEVER manually create or edit files inside `src/components/ui/`. Those are shadcn-managed.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Neon DB (`@neondatabase/serverless`) — no ORM
- Groq AI (`groq-sdk`) — LLM + function calling
- Auth: bcrypt + JWT (jose) + httpOnly cookie
- UI: shadcn/ui (Radix)

## File Tree

```
├── docs
│   ├── milestones
│   │   ├── m1-infrastructure.md
│   │   ├── m2-auth.md
│   │   ├── m3-chat-core.md
│   │   ├── m4-chat-streaming.md
│   │   ├── m5-chat-ui.md
│   │   ├── m6-all-tools.md
│   │   └── m7-dashboard.md
│   └── prd.md
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── api
│   │   │   └── health
│   │   │       └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   └── ui
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── scroll-area.tsx
│   │       └── sonner.tsx
│   └── lib
│       ├── db.ts
│       └── utils.ts
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── schema.sql
└── tsconfig.json
```
