/**
 * Neon Postgres database client.
 * Used for: user paper history, rate limiting.
 *
 * Setup: go to neon.tech, create a free project, copy the connection string.
 * Add DATABASE_URL to Vercel environment variables.
 *
 * Falls back to Upstash Redis if DATABASE_URL is not set.
 */

import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

function isRedisConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

/**
 * Initialize tables if they don't exist.
 * Call this once on first use — Neon handles schema migrations.
 */
export async function initDb(): Promise<void> {
  const sql = getDb();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS paper_history (
        id          TEXT PRIMARY KEY,
        user_email  TEXT NOT NULL,
        job_id      TEXT NOT NULL,
        paper_title TEXT NOT NULL,
        arxiv_id    TEXT,
        difficulty_score INTEGER,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        user_email    TEXT NOT NULL,
        month_year    TEXT NOT NULL,  -- format: "2025-08"
        paper_count   INTEGER DEFAULT 0,
        PRIMARY KEY (user_email, month_year)
      )
    `;
  } catch (e) {
    console.error('DB init failed:', e);
  }
}

/** Save a completed paper analysis to history */
export async function saveToHistory(params: {
  userEmail: string;
  jobId: string;
  paperTitle: string;
  arxivId?: string;
  difficultyScore?: number;
}): Promise<void> {
  const sql = getDb();

  if (!sql) {
    // Fallback: save to Upstash Redis
    if (!isRedisConfigured()) return;
    try {
      const redis = await getRedis();
      const key = `history:${params.userEmail}`;
      const existing = await redis.get<string>(key);
      const history: any[] = existing
        ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
        : [];

      const entry = {
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        jobId: params.jobId,
        paperTitle: params.paperTitle,
        arxivId: params.arxivId ?? null,
        difficultyScore: params.difficultyScore ?? null,
        createdAt: new Date().toISOString(),
      };

      history.unshift(entry);
      const trimmed = history.slice(0, 20);
      await redis.set(key, JSON.stringify(trimmed));
    } catch (e) {
      console.error('saveToHistory (Redis) failed:', e);
    }
    return;
  }

  try {
    await initDb();
    await sql`
      INSERT INTO paper_history (id, user_email, job_id, paper_title, arxiv_id, difficulty_score)
      VALUES (
        ${`hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`},
        ${params.userEmail},
        ${params.jobId},
        ${params.paperTitle},
        ${params.arxivId ?? null},
        ${params.difficultyScore ?? null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (e) {
    console.error('saveToHistory failed:', e);
  }
}

/** Get a user's paper history (most recent first) */
export async function getUserHistory(userEmail: string, limit = 20): Promise<{
  id: string;
  jobId: string;
  paperTitle: string;
  arxivId: string | null;
  difficultyScore: number | null;
  createdAt: string;
}[]> {
  const sql = getDb();

  if (!sql) {
    // Fallback: read from Upstash Redis
    if (!isRedisConfigured()) return [];
    try {
      const redis = await getRedis();
      const key = `history:${userEmail}`;
      const raw = await redis.get<string>(key);
      if (!raw) return [];
      const history: any[] = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return history.slice(0, limit);
    } catch (e) {
      console.error('getUserHistory (Redis) failed:', e);
      return [];
    }
  }

  try {
    await initDb();
    const rows = await sql`
      SELECT id, job_id, paper_title, arxiv_id, difficulty_score, created_at
      FROM paper_history
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as any[];
    return rows.map((r: any) => ({
      id: r.id,
      jobId: r.job_id,
      paperTitle: r.paper_title,
      arxivId: r.arxiv_id,
      difficultyScore: r.difficulty_score,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.error('getUserHistory failed:', e);
    return [];
  }
}

/** Check and increment usage. Returns true if allowed, false if over limit. */
export async function checkAndIncrementUsage(
  userEmail: string,
  freeLimit = 5
): Promise<{ allowed: boolean; used: number; limit: number }> {
  // Check pro status via Redis first
  if (isRedisConfigured()) {
    try {
      const redis = await getRedis();
      const isPro = await redis.get<string>(`pro:${userEmail}`);
      if (isPro === 'true') {
        return { allowed: true, used: 0, limit: 999 };
      }
    } catch (e) {
      console.error('checkAndIncrementUsage (pro check) failed:', e);
    }
  }

  const sql = getDb();
  const monthYear = new Date().toISOString().slice(0, 7); // "2025-08"

  if (!sql) {
    // Fallback: use Upstash Redis as counter
    if (!isRedisConfigured()) return { allowed: true, used: 0, limit: freeLimit };

    try {
      const redis = await getRedis();
      const key = `usage:${userEmail}:${monthYear}`;
      const current = await redis.get<number>(key) ?? 0;
      const count = typeof current === 'number' ? current : parseInt(String(current), 10) || 0;

      if (count >= freeLimit) {
        return { allowed: false, used: count, limit: freeLimit };
      }

      // Set TTL to end of next month (~ 60 days) to auto-expire old keys
      await redis.set(key, count + 1, { ex: 60 * 60 * 24 * 60 });
      return { allowed: true, used: count + 1, limit: freeLimit };
    } catch (e) {
      console.error('checkAndIncrementUsage (Redis) failed:', e);
      return { allowed: true, used: 0, limit: freeLimit };
    }
  }

  try {
    await initDb();

    // Upsert usage row
    await sql`
      INSERT INTO usage_tracking (user_email, month_year, paper_count)
      VALUES (${userEmail}, ${monthYear}, 0)
      ON CONFLICT (user_email, month_year) DO NOTHING
    `;

    // Get current count
    const rows = await sql`
      SELECT paper_count FROM usage_tracking
      WHERE user_email = ${userEmail} AND month_year = ${monthYear}
    ` as any[];

    const current = (rows[0] as any)?.paper_count ?? 0;

    if (current >= freeLimit) {
      return { allowed: false, used: current, limit: freeLimit };
    }

    // Increment
    await sql`
      UPDATE usage_tracking
      SET paper_count = paper_count + 1
      WHERE user_email = ${userEmail} AND month_year = ${monthYear}
    `;

    return { allowed: true, used: current + 1, limit: freeLimit };
  } catch (e) {
    console.error('checkAndIncrementUsage failed:', e);
    // On DB error, allow the request (don't break the app)
    return { allowed: true, used: 0, limit: freeLimit };
  }
}

/** Get the current usage count for a user this month (read-only, no increment) */
export async function getUsageCount(
  userEmail: string,
  freeLimit = 5
): Promise<{ used: number; limit: number; isPro: boolean }> {
  // Check pro status
  let isPro = false;
  if (isRedisConfigured()) {
    try {
      const redis = await getRedis();
      const proVal = await redis.get<string>(`pro:${userEmail}`);
      isPro = proVal === 'true';
    } catch {}
  }

  if (isPro) return { used: 0, limit: 999, isPro: true };

  const monthYear = new Date().toISOString().slice(0, 7);
  const sql = getDb();

  if (!sql) {
    if (!isRedisConfigured()) return { used: 0, limit: freeLimit, isPro: false };
    try {
      const redis = await getRedis();
      const key = `usage:${userEmail}:${monthYear}`;
      const current = await redis.get<number>(key) ?? 0;
      const count = typeof current === 'number' ? current : parseInt(String(current), 10) || 0;
      return { used: count, limit: freeLimit, isPro: false };
    } catch {
      return { used: 0, limit: freeLimit, isPro: false };
    }
  }

  try {
    await initDb();
    const rows = await sql`
      SELECT paper_count FROM usage_tracking
      WHERE user_email = ${userEmail} AND month_year = ${monthYear}
    ` as any[];
    const used = (rows[0] as any)?.paper_count ?? 0;
    return { used, limit: freeLimit, isPro: false };
  } catch {
    return { used: 0, limit: freeLimit, isPro: false };
  }
}
