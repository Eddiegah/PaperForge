import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendMagicLinkEmail } from '@/lib/emails/send';

// Store pending tokens in Redis if available, else in-memory
// Token -> { email, expires }
export const pendingTokens = new Map<string, { email: string; expires: number }>();

export async function POST(req: NextRequest) {
  let email = '';
  try {
    const body = await req.json();
    email = body.email?.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

  pendingTokens.set(token, { email, expires });

  const baseUrl = process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app';
  const magicUrl = `${baseUrl}/api/auth/magic-link/verify?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendMagicLinkEmail(email, magicUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email. Please try GitHub or Google sign-in.' },
      { status: 500 }
    );
  }
}
