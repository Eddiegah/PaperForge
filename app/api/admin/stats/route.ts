import { NextResponse } from 'next/server';
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

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const monthYear = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);

  // Try Postgres first
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      const [usersThisMonth] = await sql`
        SELECT COUNT(DISTINCT user_email) as count
        FROM usage_tracking
        WHERE month_year = ${monthYear}
      ` as any[];

      const [papersThisMonth] = await sql`
        SELECT COALESCE(SUM(paper_count), 0) as count
        FROM usage_tracking
        WHERE month_year = ${monthYear}
      ` as any[];

      const [papersToday] = await sql`
        SELECT COUNT(*) as count
        FROM paper_history
        WHERE created_at::date = ${today}::date
      ` as any[];

      const [totalUsers] = await sql`
        SELECT COUNT(DISTINCT user_email) as count
        FROM paper_history
      ` as any[];

      return NextResponse.json({
        totalUsersThisMonth: Number(usersThisMonth?.count ?? 0),
        totalPapersThisMonth: Number(papersThisMonth?.count ?? 0),
        totalPapersToday: Number(papersToday?.count ?? 0),
        totalUsers: Number(totalUsers?.count ?? 0),
      });
    } catch (e) {
      console.error('Admin stats DB error:', e);
    }
  }

  // Fallback: Redis — we can only estimate from keys
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = await getRedis();
      const usageKeys = await redis.keys(`usage:*:${monthYear}`);
      let totalPapersThisMonth = 0;
      const uniqueUsers = new Set<string>();

      for (const key of usageKeys) {
        const val = await redis.get<number>(key);
        const count = typeof val === 'number' ? val : parseInt(String(val), 10) || 0;
        totalPapersThisMonth += count;
        // key format: usage:{email}:{monthYear}
        const email = key.split(':').slice(1, -1).join(':');
        uniqueUsers.add(email);
      }

      return NextResponse.json({
        totalUsersThisMonth: uniqueUsers.size,
        totalPapersThisMonth,
        totalPapersToday: 0, // not trackable without DB
        totalUsers: uniqueUsers.size,
      });
    } catch (e) {
      console.error('Admin stats Redis error:', e);
    }
  }

  return NextResponse.json({
    totalUsersThisMonth: 0,
    totalPapersThisMonth: 0,
    totalPapersToday: 0,
    totalUsers: 0,
  });
}
