# Milestone 1: Infrastructure Setup

> **Dependencies:** None  
> **Output:** Project running di localhost, DB connected, health check OK

---

## Scope

Setup project Next.js, koneksi Neon DB, jalankan schema, environment variables, dan health check endpoint.

## Tasks

### 1.1 Init Project

```bash
npx create-next-app@latest fitai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd fitai

# Core dependencies
npm install @neondatabase/serverless groq-sdk zod react-hook-form date-fns lucide-react recharts bcryptjs jose

# Type defs
npm install -D @types/bcryptjs

# UI components
npx shadcn@latest init
npx shadcn@latest add button input card dialog scroll-area avatar badge toast label
```

### 1.2 Setup Neon DB

1. Buat project di [Neon Console](https://console.neon.tech)
2. Copy connection string
3. Jalankan `schema.sql` di SQL Editor

**Schema update — tambah password field di users table:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    VARCHAR(100),
    goal            VARCHAR(50) DEFAULT 'maintenance' 
                    CHECK (goal IN ('bulking', 'cutting', 'maintenance', 'health')),
    activity_level  VARCHAR(20) DEFAULT 'moderate'
                    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

> Tabel lain (workouts, cardio_logs, meals, body_stats, chat_history) tetap sama seperti PRD.

### 1.3 Environment Variables

**File:** `.env.local`

```bash
# DATABASE (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/fitai?sslmode=require"

# AUTH (Custom JWT)
JWT_SECRET="random-string-min-32-chars-gunakan-openssl-rand"
# generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# AI (Groq)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL=llama3-70b-8192

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.4 Database Client

**File:** `src/lib/db.ts`

```typescript
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);
```

### 1.5 Health Check Endpoint

**File:** `src/app/api/health/route.ts`

```typescript
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as time`;
    return Response.json({ status: 'ok', db: result[0].time });
  } catch (error) {
    return Response.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
```

## Acceptance Criteria

- [ ] `npm run dev` start tanpa error
- [ ] `GET /api/health` return `{ status: 'ok', db: '<timestamp>' }`
- [ ] Semua tabel exist di Neon DB (check via SQL Editor)
- [ ] `.env.local` terisi semua values
- [ ] `.env.local` masuk `.gitignore`
