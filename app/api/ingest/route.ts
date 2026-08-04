import { NextRequest, NextResponse } from 'next/server';
import { generateJobId, createJob, updateJob } from '@/lib/jobStore';
import { extractTextFromPdf, fetchArxivPaper } from '@/lib/ingest';
import { extractTechnicalSpec } from '@/lib/extractSpec';
import { computeDifficultyScore } from '@/lib/difficultyScore';
import { generateRepoCode } from '@/lib/generateCode';
import { generateMermaidDiagram } from '@/lib/generateDiagram';

export const maxDuration = 300;

async function processPaper(jobId: string, rawText: string, pdfUrl?: string) {
  try {
    await updateJob(jobId, {
      status: 'extracting',
      progress: 15,
      statusMessage: 'Extracting architecture, training recipe, and evaluation details...',
    });

    const { metadata, technicalSpec } = await extractTechnicalSpec(rawText);
    if (pdfUrl) metadata.pdfUrl = pdfUrl;

    await updateJob(jobId, {
      status: 'analyzing',
      progress: 50,
      statusMessage: 'Computing Replication Difficulty Score...',
      paperMetadata: metadata,
      technicalSpec,
    });

    const difficultyScore = computeDifficultyScore(technicalSpec);

    await updateJob(jobId, {
      progress: 65,
      statusMessage: 'Generating architecture diagram...',
      difficultyScore,
    });

    const architectureDiagram = await generateMermaidDiagram(
      metadata.title,
      technicalSpec.modelArchitecture,
      rawText.slice(0, 8000)
    );

    await updateJob(jobId, {
      status: 'generating',
      progress: 75,
      statusMessage: 'Generating starter code with ambiguity annotations...',
      architectureDiagram,
    });

    const generatedCode = await generateRepoCode(metadata, technicalSpec, difficultyScore);

    await updateJob(jobId, {
      status: 'complete',
      progress: 100,
      statusMessage: 'Done. Review the ambiguity flags before relying on this code.',
      generatedCode,
      completedAt: new Date(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateJob(jobId, {
      status: 'failed',
      progress: 0,
      statusMessage: 'Processing failed.',
      error: message,
    });
  }
}

export async function POST(req: NextRequest) {
  const jobId = generateJobId();
  await createJob(jobId);

  const contentType = req.headers.get('content-type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file field in form data' }, { status: 400 });
      }
      if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
      }

      await updateJob(jobId, { status: 'uploading', progress: 5, statusMessage: 'Reading PDF...' });

      // Start processing in background using waitUntil if available, otherwise run inline
      const buffer = await file.arrayBuffer();
      const rawText = await extractTextFromPdf(buffer);
      await updateJob(jobId, { progress: 10, statusMessage: 'PDF parsed. Starting extraction...' });

      // Return jobId immediately, then process
      const response = NextResponse.json({ jobId }, { status: 202 });

      // Use the after() API or just await — Vercel Fluid Compute keeps function alive
      processPaper(jobId, rawText).catch(async (error) => {
        await updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

      return response;
    } else {
      const body = await req.json();
      const arxivId = body.arxivId?.trim();

      if (!arxivId) {
        return NextResponse.json({ error: 'Missing arxivId' }, { status: 400 });
      }

      await updateJob(jobId, {
        status: 'uploading',
        progress: 5,
        statusMessage: 'Fetching paper from arXiv...',
      });

      const { text, pdfUrl } = await fetchArxivPaper(arxivId);
      await updateJob(jobId, {
        progress: 10,
        statusMessage: 'Paper fetched. Starting extraction...',
        paperMetadata: { title: '', authors: [], abstract: '', arxivId, pdfUrl },
      });

      // Return jobId immediately, then process
      const response = NextResponse.json({ jobId }, { status: 202 });

      processPaper(jobId, text, pdfUrl).catch(async (error) => {
        await updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

      return response;
    }
  } catch (error) {
    await updateJob(jobId, {
      status: 'failed',
      progress: 0,
      statusMessage: 'Processing failed.',
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
