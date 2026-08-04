import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found. Please resubmit the paper.' },
      { status: 404 }
    );
  }

  // Strip heavy fields from polling response to prevent Chrome OOM crash.
  // Generated code (500KB+) and full technicalSpec are only needed once,
  // fetched via /api/result/[jobId] after completion.
  const { generatedCode, ...lightJob } = job as any;

  return NextResponse.json(lightJob);
}
