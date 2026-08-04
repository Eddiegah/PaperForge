import { Resend } from 'resend';
import { welcomeEmailHtml, welcomeEmailText } from './welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set - skipping welcome email');
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject: `Welcome to PaperForge, ${name?.split(' ')[0] || 'there'}!`,
      html: welcomeEmailHtml(name),
      text: welcomeEmailText(name),
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    // Never block sign-in if email fails
    console.error('Failed to send welcome email:', error);
  }
}
