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

  if (contentType.includes('multipart/form-data')) {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file field in form data' }, { status: 400 });
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf'))
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });

    await updateJob(jobId, { status: 'uploading', progress: 5, statusMessage: 'Reading PDF...' });

    file.arrayBuffer()
      .then((buffer) => extractTextFromPdf(buffer))
      .then((rawText) => {
        updateJob(jobId, { progress: 10, statusMessage: 'PDF parsed. Starting extraction...' });
        return processPaper(jobId, rawText);
      })
      .catch(async (error) => {
        await updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return NextResponse.json({ jobId }, { status: 202 });
  } else {
    let body: { arxivId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const arxivId = body.arxivId?.trim();
    if (!arxivId) return NextResponse.json({ error: 'Missing arxivId' }, { status: 400 });

    await updateJob(jobId, { status: 'uploading', progress: 5, statusMessage: 'Fetching paper from arXiv...' });

    fetchArxivPaper(arxivId)
      .then(({ text, pdfUrl }) => {
        updateJob(jobId, {
          progress: 10,
          statusMessage: 'Paper fetched. Starting extraction...',
          paperMetadata: { title: '', authors: [], abstract: '', arxivId, pdfUrl },
        });
        return processPaper(jobId, text, pdfUrl);
      })
      .catch(async (error) => {
        await updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return NextResponse.json({ jobId }, { status: 202 });
  }
}
