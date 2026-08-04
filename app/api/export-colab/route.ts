/**
 * POST /api/export-colab
 *
 * Generates a Jupyter notebook (.ipynb) from a completed job and returns it
 * as a downloadable file.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';
import { generateColab } from '@/lib/generateColab';

export async function POST(req: NextRequest) {
  let body: { jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { jobId } = body;
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  if (job.status !== 'complete') {
    return NextResponse.json(
      { error: 'Job is not complete yet. Please wait for processing to finish.' },
      { status: 400 }
    );
  }
  if (!job.generatedCode || job.generatedCode.files.length === 0) {
    return NextResponse.json({ error: 'No generated code found for this job' }, { status: 400 });
  }

  const notebook = generateColab(
    job.generatedCode,
    job.paperMetadata ?? { title: 'Research Paper', authors: [], abstract: '' },
    job.difficultyScore
  );

  const json = JSON.stringify(notebook, null, 2);
  const filename = job.paperMetadata?.title
    ? job.paperMetadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60) + '.ipynb'
    : 'notebook.ipynb';

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ipynb+json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
