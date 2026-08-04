/**
 * POST /api/auth/magic-link
 * Sends a magic sign-in link to the user's email.
 * Uses Resend to deliver the email.
 * The link contains a signed token that auto-signs the user in.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Store pending tokens in memory (replace with Redis for production)
// Token -> { email, expires }
const pendingTokens = new Map<string, { email: string; expires: number }>();

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

  pendingTokens.set(token, { email, expires });

  const baseUrl = process.env.AUTH_URL || 'https://paper-forge-nu.vercel.app';
  const magicUrl = `${baseUrl}/api/auth/magic-link/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Sign in to PaperForge',
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:24px;font-weight:800;color:#18181b;">Paper<span style="color:#4f46e5;">Forge</span></span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#18181b;margin-bottom:8px;">Sign in to PaperForge</h2>
          <p style="color:#71717a;font-size:14px;line-height:1.6;margin-bottom:28px;">
            Click the button below to sign in. This link expires in 15 minutes and can only be used once.
          </p>
          <a href="${magicUrl}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
            Sign in to PaperForge
          </a>
          <p style="color:#a1a1aa;font-size:12px;margin-top:24px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

// Export tokens map for verify route to use
export { pendingTokens };
