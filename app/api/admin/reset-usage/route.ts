import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gahedmunderic@gmail.com';

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let email: string;
  let newCount: number;

  try {
    const body = await req.json();
    email = body.email?.trim();
    newCount = typeof body.newCount === 'number' ? body.newCount : 0;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const monthYear = new Date().toISOString().slice(0, 7);

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`
        INSERT INTO usage_tracking (user_email, month_year, paper_count)
        VALUES (${email}, ${monthYear}, ${newCount})
        ON CONFLICT (user_email, month_year)
        DO UPDATE SET paper_count = ${newCount}
      `;
      return NextResponse.json({ success: true, email, newCount });
    } catch (e) {
      console.error('reset-usage DB error:', e);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = await getRedis();
      const key = `usage:${email}:${monthYear}`;
      await redis.set(key, newCount, { ex: 60 * 60 * 24 * 60 });
      return NextResponse.json({ success: true, email, newCount });
    } catch (e) {
      console.error('reset-usage Redis error:', e);
      return NextResponse.json({ error: 'Redis error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'No storage configured' }, { status: 500 });
}
