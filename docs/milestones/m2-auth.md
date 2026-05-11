# Milestone 2: Authentication (Custom — Neon DB)

> **Dependencies:** M1 (infrastructure)  
> **Output:** Register, login, logout, protected routes, session via JWT cookie

---

## Scope

Auth system custom tanpa third-party service. Password hashing pakai bcrypt, session pakai JWT di httpOnly cookie, middleware Next.js untuk route protection.

## Design Decisions

- **No third-party auth service** — semua data di Neon DB
- **JWT di httpOnly cookie** — aman dari XSS, otomatis dikirim tiap request
- **bcrypt** — industry standard password hashing
- **jose** — JWT library yang support Edge runtime Next.js (jsonwebtoken tidak support)

## Tasks

### 2.1 Auth Utility Library

**File:** `src/lib/auth.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'fitai_session';

// --- Password ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- JWT ---

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

// --- Session ---

export async function setSession(userId: string) {
  const token = await createToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// --- Get Current User ---

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const users = await sql`
    SELECT id, email, display_name, goal, activity_level
    FROM users WHERE id = ${session.userId}
  `;
  return users[0] ?? null;
}
```

### 2.2 Auth API Routes

**File:** `src/app/api/auth/register/route.ts`

```typescript
import { sql } from '@/lib/db';
import { hashPassword, setSession } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  displayName: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName } = registerSchema.parse(body);

    // Check existing user
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return Response.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const result = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email}, ${passwordHash}, ${displayName ?? null})
      RETURNING id
    `;

    await setSession(result[0].id);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Register error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/auth/login/route.ts`

```typescript
import { sql } from '@/lib/db';
import { verifyPassword, setSession } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return Response.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await verifyPassword(password, users[0].password_hash);
    if (!valid) {
      return Response.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    await setSession(users[0].id);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/auth/logout/route.ts`

```typescript
import { clearSession } from '@/lib/auth';

export async function POST() {
  await clearSession();
  return Response.json({ success: true });
}
```

**File:** `src/app/api/auth/me/route.ts`

```typescript
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return Response.json({ user });
}
```

### 2.3 Middleware — Route Protection

**File:** `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/health'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — skip auth
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check JWT cookie
  const token = req.cookies.get('fitai_session')?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Token invalid/expired — clear cookie dan redirect
    const response = pathname.startsWith('/api/')
      ? Response.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', req.url));
    // Delete cookie on invalid token
    if (response instanceof NextResponse) {
      response.cookies.delete('fitai_session');
    }
    return response;
  }

  // Inject userId ke header supaya API routes bisa akses
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)']
};
```

### 2.4 Auth Helper untuk API Routes

**File:** `src/lib/api-auth.ts`

```typescript
/**
 * Ambil userId dari request header (di-set oleh middleware).
 * Gunakan di semua API routes yang butuh auth.
 */
export function getUserId(req: Request): string {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new Error('Unauthorized — middleware should have caught this');
  return userId;
}
```

### 2.5 Auth Pages (UI)

**File:** `src/app/(auth)/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push('/chat');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold text-center">Login FitAI</h1>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <p className="text-sm text-center text-muted-foreground">
          Belum punya akun? <Link href="/register" className="text-primary underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
```

**File:** `src/app/(auth)/register/page.tsx` — mirror login, POST ke `/api/auth/register`, tambah field `displayName`.

### 2.6 Root Page Redirect

**File:** `src/app/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  redirect(session ? '/chat' : '/login');
}
```

## Acceptance Criteria

- [ ] `POST /api/auth/register` — buat user baru, set cookie, return success
- [ ] `POST /api/auth/register` — email duplicate return 409
- [ ] `POST /api/auth/login` — credentials valid → set cookie, return success
- [ ] `POST /api/auth/login` — credentials invalid → 401, no cookie
- [ ] `POST /api/auth/logout` — clear cookie
- [ ] `GET /api/auth/me` — return user data kalau authenticated, 401 kalau tidak
- [ ] `/chat` redirect ke `/login` kalau belum login
- [ ] `/login` bisa diakses tanpa auth
- [ ] Password tersimpan sebagai bcrypt hash (TIDAK plaintext)
- [ ] JWT expire setelah 7 hari
- [ ] Cookie httpOnly, secure di production

## Catatan

- Auth sepenuhnya custom — tidak pakai third-party auth service
- User ID = UUID dari tabel `users`, konsisten di seluruh app
- Middleware inject `x-user-id` header → API routes pakai `getUserId(req)`
