import { Resend } from 'resend';
import { welcomeEmailHtml, welcomeEmailText } from './welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set - skipping welcome email');
    return;
  }

  // Resend's test address - works for any recipient in test mode
  // Once you verify a domain, change to: hello@yourdomain.com
  const from = process.env.RESEND_FROM_EMAIL || 'PaperForge <onboarding@resend.dev>';

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: `Welcome to PaperForge, ${name?.split(' ')[0] || 'there'}!`,
      html: welcomeEmailHtml(name),
      text: welcomeEmailText(name),
    });
    console.log(`Welcome email sent to ${to}:`, result);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendMagicLinkEmail(to: string, magicUrl: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set - magic link URL:', magicUrl);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'PaperForge <onboarding@resend.dev>';

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Sign in to PaperForge',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:22px;font-weight:800;color:#18181b;">Paper<span style="color:#4f46e5;">Forge</span></span>
          </div>
          <div style="background:#f9f9fb;border-radius:16px;padding:32px;text-align:center;">
            <h2 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 8px;">Sign in to PaperForge</h2>
            <p style="color:#71717a;font-size:14px;line-height:1.6;margin:0 0 28px;">
              Click the button below to sign in. This link expires in 15 minutes.
            </p>
            <a href="${magicUrl}"
              style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#ffffff;
              text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">
              Sign in to PaperForge
            </a>
            <p style="color:#a1a1aa;font-size:12px;margin-top:24px;">
              If you did not request this, ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw error;
  }
}
