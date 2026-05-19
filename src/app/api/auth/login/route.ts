import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

    const result = await db.select({
      id: users.id,
      passwordHash: users.passwordHash,
    }).from(users).where(eq(users.email, email));

    if (result.length === 0) {
      return Response.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await verifyPassword(password, result[0].passwordHash);
    if (!valid) {
      return Response.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    await setSession(result[0].id);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
