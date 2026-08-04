/**
 * GET /api/status/[jobId]
 *
 * Returns the current state of a processing job.
 * The frontend polls this endpoint every 2-3 seconds after submitting a paper.
 *
 * Returns genuine progress states reflecting actually-completed steps — not decorative
 * fake progress. If a step fails, the error is reported honestly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json(
      {
        error: `Job "${jobId}" not found. This may happen if the server restarted (serverless cold start). Please resubmit the paper.`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
}
