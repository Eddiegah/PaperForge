import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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
  let isPro: boolean;

  try {
    const body = await req.json();
    email = body.email?.trim();
    isPro = Boolean(body.isPro);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const redis = await getRedis();
    const key = `pro:${email}`;
    if (isPro) {
      // No TTL — pro status persists until explicitly removed
      await redis.set(key, 'true');
    } else {
      await redis.del(key);
    }
    return NextResponse.json({ success: true, email, isPro });
  } catch (e) {
    console.error('set-pro Redis error:', e);
    return NextResponse.json({ error: 'Redis error' }, { status: 500 });
  }
}
