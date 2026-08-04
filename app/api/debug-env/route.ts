import { NextResponse } from 'next/server';

// TEMPORARY debug endpoint — DELETE after fixing auth
// Visit: /api/debug-env to check if env vars are loaded
export async function GET() {
  return NextResponse.json({
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasGithubId: !!process.env.GITHUB_CLIENT_ID,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    googleIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 15) || 'MISSING',
  });
}
