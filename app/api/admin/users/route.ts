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

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.trim();

  if (!email) {
    return NextResponse.json({ error: 'email query parameter required' }, { status: 400 });
  }

  const monthYear = new Date().toISOString().slice(0, 7);

  let usedThisMonth = 0;
  let totalPapers = 0;
  let isPro = false;
  let recentHistory: any[] = [];

  // Check pro status from Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = await getRedis();
      const proVal = await redis.get<string>(`pro:${email}`);
      isPro = proVal === 'true';
    } catch {}
  }

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);

      const usageRows = await sql`
        SELECT paper_count FROM usage_tracking
        WHERE user_email = ${email} AND month_year = ${monthYear}
      ` as any[];
      usedThisMonth = (usageRows[0] as any)?.paper_count ?? 0;

      const totalRows = await sql`
        SELECT COUNT(*) as count FROM paper_history
        WHERE user_email = ${email}
      ` as any[];
      totalPapers = Number((totalRows[0] as any)?.count ?? 0);

      const histRows = await sql`
        SELECT job_id, paper_title, arxiv_id, difficulty_score, created_at
        FROM paper_history
        WHERE user_email = ${email}
        ORDER BY created_at DESC
        LIMIT 10
      ` as any[];
      recentHistory = histRows.map((r: any) => ({
        jobId: r.job_id,
        paperTitle: r.paper_title,
        arxivId: r.arxiv_id,
        difficultyScore: r.difficulty_score,
        createdAt: r.created_at,
      }));
    } catch (e) {
      console.error('Admin users DB error:', e);
    }
  } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = await getRedis();
      const usageKey = `usage:${email}:${monthYear}`;
      const val = await redis.get<number>(usageKey) ?? 0;
      usedThisMonth = typeof val === 'number' ? val : parseInt(String(val), 10) || 0;

      const histRaw = await redis.get<string>(`history:${email}`);
      if (histRaw) {
        const hist: any[] = typeof histRaw === 'string' ? JSON.parse(histRaw) : histRaw;
        recentHistory = hist.slice(0, 10);
        totalPapers = hist.length;
      }
    } catch (e) {
      console.error('Admin users Redis error:', e);
    }
  }

  return NextResponse.json({
    email,
    usedThisMonth,
    totalPapers,
    isPro,
    recentHistory,
  });
}
