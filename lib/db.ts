/**
 * Neon Postgres database client.
 * Used for: user paper history, rate limiting.
 *
 * Setup: go to neon.tech, create a free project, copy the connection string.
 * Add DATABASE_URL to Vercel environment variables.
 *
 * Falls back gracefully if DATABASE_URL is not set (history won't persist).
 */

import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
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
  if (!sql) return;

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
  if (!sql) return [];

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
  const sql = getDb();
  // If no DB, always allow (graceful degradation)
  if (!sql) return { allowed: true, used: 0, limit: freeLimit };

  const monthYear = new Date().toISOString().slice(0, 7); // "2025-08"

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
