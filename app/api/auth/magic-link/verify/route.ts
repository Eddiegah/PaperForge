import { NextRequest, NextResponse } from 'next/server';
import { pendingTokens } from '../route';
import { signIn } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const email = req.nextUrl.searchParams.get('email');
  const baseUrl = process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app';

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=InvalidLink`);
  }

  const pending = pendingTokens.get(token);

  if (!pending) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=LinkExpired`);
  }

  if (Date.now() > pending.expires) {
    pendingTokens.delete(token);
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=LinkExpired`);
  }

  if (pending.email !== email.toLowerCase()) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=InvalidLink`);
  }

  // Token is valid - clean it up
  pendingTokens.delete(token);

  // Sign the user in via NextAuth
  // Since we can't call signIn() from a route handler directly,
  // redirect to a special callback that handles the session creation
  const callbackUrl = `${baseUrl}/dashboard`;

  // For now redirect to dashboard with a session token via URL param
  // The user will need to sign in with their email via the form
  // This is a simplified flow - production would use NextAuth Email provider
  return NextResponse.redirect(
    `${baseUrl}/auth/magic-success?email=${encodeURIComponent(pending.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
}
