/**
 * POST /api/ingest
 *
 * Accepts a PDF upload (multipart/form-data with "file" field) or arXiv ID/URL
 * (JSON body with "arxivId" field).
 *
 * Returns immediately with a jobId. The extraction and code generation pipeline
 * runs asynchronously (non-blocking). The client polls /api/status/[jobId] for progress.
 *
 * Vercel timeout design:
 * This route returns the job ID in <1s. The processing logic is triggered as a
 * background async call within the same serverless function lifespan. With Vercel
 * Fluid Compute (Pro plan: up to 30 min, Hobby: up to 1 min), this works for most papers.
 * If you hit timeout issues consistently, the correct solution is a proper background
 * job queue (e.g., Inngest, Trigger.dev) — see README for details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateJobId, createJob, updateJob } from '@/lib/jobStore';
import { extractTextFromPdf, fetchArxivPaper } from '@/lib/ingest';
import { extractTechnicalSpec } from '@/lib/extractSpec';
import { computeDifficultyScore } from '@/lib/difficultyScore';
import { generateRepoCode } from '@/lib/generateCode';
import { generateMermaidDiagram } from '@/lib/generateDiagram';

// Vercel: configure max function duration (requires Pro plan for >60s)
export const maxDuration = 300; // 5 minutes — Fluid Compute Pro

async function processPaper(jobId: string, rawText: string, pdfUrl?: string) {
  try {
    // Step 1: Extracting technical specification
    updateJob(jobId, {
      status: 'extracting',
      progress: 15,
      statusMessage: 'Extracting architecture, training recipe, and evaluation details...',
    });

    const { metadata, technicalSpec } = await extractTechnicalSpec(rawText);

    if (pdfUrl) {
      metadata.pdfUrl = pdfUrl;
    }

    updateJob(jobId, {
      status: 'analyzing',
      progress: 50,
      statusMessage: 'Computing Replication Difficulty Score...',
      paperMetadata: metadata,
      technicalSpec,
    });

    // Step 2: Compute difficulty score from per-field confidence
    const difficultyScore = computeDifficultyScore(technicalSpec);

    updateJob(jobId, {
      progress: 65,
      statusMessage: 'Generating architecture diagram...',
      difficultyScore,
    });

    // Step 3: Generate Mermaid diagram
    const architectureDiagram = await generateMermaidDiagram(
      metadata.title,
      technicalSpec.modelArchitecture,
      rawText.slice(0, 8000) // Provide some raw text context
    );

    updateJob(jobId, {
      status: 'generating',
      progress: 75,
      statusMessage: 'Generating starter code repository with ambiguity annotations...',
      architectureDiagram,
    });

    // Step 4: Generate code
    const generatedCode = await generateRepoCode(metadata, technicalSpec, difficultyScore);

    // Step 5: Complete
    updateJob(jobId, {
      status: 'complete',
      progress: 100,
      statusMessage: 'Done. Review the ambiguity flags before relying on this code.',
      generatedCode,
      completedAt: new Date(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateJob(jobId, {
      status: 'failed',
      progress: 0,
      statusMessage: 'Processing failed.',
      error: message,
    });
  }
}

export async function POST(req: NextRequest) {
  const jobId = generateJobId();
  createJob(jobId);

  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    // PDF upload path
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file field in form data' }, { status: 400 });
    }

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    updateJob(jobId, {
      status: 'uploading',
      progress: 5,
      statusMessage: 'Reading PDF...',
    });

    // Kick off async processing — don't await it, return jobId immediately
    file
      .arrayBuffer()
      .then((buffer) => extractTextFromPdf(buffer))
      .then((rawText) => {
        updateJob(jobId, { progress: 10, statusMessage: 'PDF parsed. Starting extraction...' });
        return processPaper(jobId, rawText);
      })
      .catch((error) => {
        updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return NextResponse.json({ jobId }, { status: 202 });
  } else {
    // arXiv ID path
    let body: { arxivId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const arxivId = body.arxivId?.trim();
    if (!arxivId) {
      return NextResponse.json({ error: 'Missing "arxivId" field in request body' }, { status: 400 });
    }

    updateJob(jobId, {
      status: 'uploading',
      progress: 5,
      statusMessage: 'Fetching paper from arXiv...',
    });

    // Kick off async processing
    fetchArxivPaper(arxivId)
      .then(({ text, pdfUrl }) => {
        updateJob(jobId, {
          progress: 10,
          statusMessage: 'Paper fetched. Starting extraction...',
          paperMetadata: { title: '', authors: [], abstract: '', arxivId, pdfUrl },
        });
        return processPaper(jobId, text, pdfUrl);
      })
      .catch((error) => {
        updateJob(jobId, {
          status: 'failed',
          progress: 0,
          statusMessage: 'Processing failed.',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return NextResponse.json({ jobId }, { status: 202 });
  }
}
