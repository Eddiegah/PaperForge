/**
 * POST /api/github-export
 *
 * Creates a new GitHub repository and pushes the generated code files.
 * Requires a GitHub personal access token (passed in the request body —
 * never stored server-side beyond the duration of this request).
 *
 * Uses Octokit for GitHub API integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { getJob } from '@/lib/jobStore';

interface ExportRequest {
  jobId: string;
  githubToken: string;
  repoName: string;
  repoDescription?: string;
  isPrivate?: boolean;
}

export async function POST(req: NextRequest) {
  let body: ExportRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { jobId, githubToken, repoName, repoDescription, isPrivate = false } = body;

  if (!jobId || !githubToken || !repoName) {
    return NextResponse.json(
      { error: 'Missing required fields: jobId, githubToken, repoName' },
      { status: 400 }
    );
  }

  // Validate repo name
  if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
    return NextResponse.json(
      { error: 'Repository name can only contain letters, numbers, hyphens, underscores, and dots' },
      { status: 400 }
    );
  }

  const job = await getJob(jobId);
  if (!job || job.status !== 'complete') {
    return NextResponse.json(
      { error: 'Job not found or not complete. Processing must finish before exporting.' },
      { status: 400 }
    );
  }

  if (!job.generatedCode || job.generatedCode.files.length === 0) {
    return NextResponse.json({ error: 'No generated code files found in this job' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: githubToken });

  // Verify token works
  let authenticatedUser: string;
  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    authenticatedUser = user.login;
  } catch (error) {
    return NextResponse.json(
      { error: 'GitHub authentication failed. Check that your token has the "repo" scope.' },
      { status: 401 }
    );
  }

  // Create repository
  let repoUrl: string;
  try {
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description:
        repoDescription || `PaperForge scaffold: ${job.paperMetadata?.title || 'Research Paper'}`,
      private: isPrivate,
      auto_init: false,
    });
    repoUrl = repo.html_url;
  } catch (error: any) {
    if (error.status === 422) {
      return NextResponse.json(
        { error: `Repository "${repoName}" already exists on your GitHub account. Choose a different name.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create repository: ${error.message}` },
      { status: 500 }
    );
  }

  // Push files to the repo via the GitHub Contents API
  const commitErrors: string[] = [];
  for (const file of job.generatedCode.files) {
    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: authenticatedUser,
        repo: repoName,
        path: file.path,
        message: `Add ${file.path}`,
        content: Buffer.from(file.content, 'utf-8').toString('base64'),
      });
    } catch (error: any) {
      commitErrors.push(`Failed to commit ${file.path}: ${error.message}`);
    }
  }

  if (commitErrors.length > 0) {
    return NextResponse.json(
      {
        repoUrl,
        warnings: commitErrors,
        message: 'Repository created but some files failed to upload.',
      },
      { status: 207 }
    );
  }

  return NextResponse.json({ repoUrl, message: 'Repository created and all files pushed successfully.' });
}
