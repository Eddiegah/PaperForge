/**
 * POST /api/paystack/webhook
 * Paystack calls this endpoint when a payment event occurs.
 * Add this URL in Paystack dashboard: Settings → API Keys & Webhooks → Webhook URL
 * URL: https://your-domain.vercel.app/api/paystack/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature') || '';

  // Verify the webhook is genuinely from Paystack
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle successful charge
  if (event.event === 'charge.success' || event.event === 'subscription.create') {
    const { customer, plan, metadata } = event.data;
    const email = customer?.email || metadata?.user_email;
    const planCode = plan?.plan_code;

    console.log(`✅ Payment received from ${email} for plan ${planCode}`);

    // TODO: When you add a database, update the user's subscription status here:
    // await db.user.update({ where: { email }, data: { plan: 'pro', planExpiry: ... } });
  }

  if (event.event === 'subscription.disable') {
    const email = event.data?.customer?.email;
    console.log(`❌ Subscription cancelled for ${email}`);
    // TODO: Downgrade user to free plan in database
  }

  return NextResponse.json({ received: true });
}
