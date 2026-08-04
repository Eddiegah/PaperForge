/**
 * POST /api/paystack/initialize
 * Initializes a Paystack transaction and returns the checkout URL.
 * The user is redirected to Paystack's hosted payment page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'You must be signed in to upgrade' }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = body; // 'pro' or 'team'

  const planCode =
    plan === 'pro'
      ? process.env.PAYSTACK_PRO_PLAN_CODE
      : process.env.PAYSTACK_TEAM_PLAN_CODE;

  if (!planCode || planCode.startsWith('PLN_pro_placeholder') || planCode.startsWith('PLN_team_placeholder')) {
    return NextResponse.json(
      { error: 'Plan not configured yet. Add your Paystack plan codes to the environment variables.' },
      { status: 500 }
    );
  }

  const amount = plan === 'pro' ? 1200 : 3900; // in pesewas (GHS 12 / GHS 39)

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount,
        plan: planCode,
        callback_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
        metadata: {
          user_email: session.user.email,
          plan,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: plan },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Paystack initialization failed' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Paystack. Check your secret key.' },
      { status: 500 }
    );
  }
}
