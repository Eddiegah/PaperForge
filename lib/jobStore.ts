/**
 * Simple in-memory job store for tracking async processing jobs.
 *
 * IMPORTANT NOTES:
 * - In serverless environments (Vercel), each function instance has its own memory.
 *   Jobs submitted to one instance may not be visible to another instance polling
 *   for status. For production scale, replace this with a database (Neon/Postgres) or
 *   a key-value store (Upstash Redis). This works fine for single-instance dev
 *   and low-traffic Vercel deployments where Fluid Compute keeps instances warm.
 * - Fluid Compute on Vercel Pro allows functions to run up to 30 minutes, which is
 *   sufficient for LLM-based paper extraction (typically 30-90 seconds).
 */

import { ProcessingJob } from '@/types';

// Global in-process store. Safe for use within a single serverless function invocation.
const jobStore = new Map<string, ProcessingJob>();

export function createJob(id: string): ProcessingJob {
  const job: ProcessingJob = {
    id,
    status: 'uploading',
    progress: 0,
    statusMessage: 'Receiving paper...',
    createdAt: new Date(),
  };
  jobStore.set(id, job);
  return job;
}

export function getJob(id: string): ProcessingJob | undefined {
  return jobStore.get(id);
}

export function updateJob(id: string, updates: Partial<ProcessingJob>): ProcessingJob | null {
  const job = jobStore.get(id);
  if (!job) return null;
  const updated = { ...job, ...updates };
  jobStore.set(id, updated);
  return updated;
}

export function getAllJobs(): ProcessingJob[] {
  return Array.from(jobStore.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
