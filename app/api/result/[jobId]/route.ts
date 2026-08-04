import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

// Fetches the full job result including generated code.
// Called ONCE after job completion, not on every poll.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'complete') {
    return NextResponse.json({ error: 'Job not complete yet' }, { status: 400 });
  }

  return NextResponse.json(job);
}
