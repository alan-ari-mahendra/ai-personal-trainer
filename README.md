# FitAI — AI Personal Trainer

AI-powered fitness assistant. Track workouts, nutrition, and cardio with natural language — AI parses your input into structured forms, you review and save.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** Neon PostgreSQL (`@neondatabase/serverless`)
- **AI:** Groq SDK (Llama 3) — function calling + JSON parse
- **Auth:** bcrypt + JWT (jose) + httpOnly cookie
- **UI:** Tailwind CSS v4 + shadcn/ui + Recharts
- **No ORM** — raw SQL via Neon serverless driver

## Features

### Phase 1 — Chat-based

- AI chat with streaming (SSE)
- 5 AI tools: workout, cardio, nutrition, body stats, analytics
- Dashboard with stats cards + charts (Recharts)
- Auth (register/login/logout) with JWT session

### Phase 2 — Form-based Tracking

- **Nutrition Tracker** (`/track/nutrition`) — describe meals in natural language, AI fills editable form with estimated macros
- **Workout Tracker** (`/track/workout`) — describe exercises, AI fills sets/reps/weight form
- **Cardio Tracker** (`/track/cardio`) — describe activity, AI fills type/distance/duration form
- AI parse endpoint (`/api/parse`) — Groq JSON mode, returns structured data without saving
- User reviews AI-filled form, edits, then saves

### Other

- Landing page (`/landing`)
- Today's history per tracker
- Dashboard with weekly/monthly analytics

## Setup

### 1. Install

```bash
npm install
```

### 2. Database

Create a [Neon](https://neon.tech) database. Run `schema.sql` in Neon SQL Editor to create tables.

### 3. Environment

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Random 32+ char string |
| `GROQ_API_KEY` | Groq API key (starts with `gsk_`) |
| `GROQ_MODEL` | Model ID (default: `llama3-70b-8192`) |

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register     Auth pages
│   ├── (main)/
│   │   ├── chat/                  AI chat page
│   │   ├── dashboard/             Stats + charts
│   │   └── track/
│   │       ├── nutrition/         Meal tracking
│   │       ├── workout/           Gym tracking
│   │       └── cardio/            Cardio tracking
│   ├── api/
│   │   ├── auth/                  Login/register/logout/me
│   │   ├── chat/                  Streaming AI chat
│   │   ├── parse/                 AI natural language → JSON
│   │   ├── track/                 Save nutrition/workout/cardio
│   │   ├── analytics/             Overview + chart data
│   │   └── health/                Health check
│   └── landing/                   Marketing landing page
├── components/
│   ├── ui/                        shadcn/ui (auto-generated)
│   ├── chat/                      Chat UI components
│   ├── dashboard/                 Stats cards + charts
│   ├── layout/                    Sidebar + header
│   └── track/                     AI input + forms + history
├── hooks/                         use-chat, use-parse, use-dashboard
├── tools/                         AI tool implementations
├── lib/                           DB, auth, Groq, utils
└── types/                         TypeScript interfaces
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/chat` | AI chat (SSE stream) |
| POST | `/api/parse` | AI parse natural language → JSON |
| POST | `/api/track/nutrition` | Save meals |
| GET | `/api/track/nutrition/today` | Today's meals |
| POST | `/api/track/workout` | Save exercises |
| GET | `/api/track/workout/today` | Today's workouts |
| POST | `/api/track/cardio` | Save cardio |
| GET | `/api/track/cardio/week` | This week's cardio |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/chart` | Chart data |
| GET | `/api/workouts` | Workout list |
