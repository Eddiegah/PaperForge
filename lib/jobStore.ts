/**
 * Job store backed by Upstash Redis.
 * Works correctly across Vercel's serverless function instances —
 * unlike the previous in-memory store which lost jobs between requests.
 *
 * Setup:
 * 1. Go to https://upstash.com and create a free Redis database
 * 2. Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * 3. Add both to Vercel environment variables
 *
 * Falls back to in-memory store if Upstash env vars are not set (local dev).
 */

import { ProcessingJob } from '@/types';

// ── In-memory fallback for local dev ─────────────────────────────
const memStore = new Map<string, ProcessingJob>();

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

const JOB_TTL = 60 * 60 * 2; // 2 hours

// ── Public API ────────────────────────────────────────────────────

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function createJob(id: string): Promise<ProcessingJob> {
  const job: ProcessingJob = {
    id,
    status: 'uploading',
    progress: 0,
    statusMessage: 'Receiving paper...',
    createdAt: new Date(),
  };

  if (isRedisConfigured()) {
    const redis = await getRedis();
    await redis.setex(`job:${id}`, JOB_TTL, JSON.stringify(job));
  } else {
    memStore.set(id, job);
  }

  return job;
}

export async function getJob(id: string): Promise<ProcessingJob | null> {
  if (isRedisConfigured()) {
    const redis = await getRedis();
    const raw = await redis.get<string>(`job:${id}`);
    if (!raw) return null;
    const job = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Restore Date object
    job.createdAt = new Date(job.createdAt);
    if (job.completedAt) job.completedAt = new Date(job.completedAt);
    return job as ProcessingJob;
  }
  return memStore.get(id) || null;
}

export async function updateJob(
  id: string,
  updates: Partial<ProcessingJob>
): Promise<ProcessingJob | null> {
  const job = await getJob(id);
  if (!job) return null;

  const updated = { ...job, ...updates };

  if (isRedisConfigured()) {
    const redis = await getRedis();
    await redis.setex(`job:${id}`, JOB_TTL, JSON.stringify(updated));
  } else {
    memStore.set(id, updated);
  }

  return updated;
}
