import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsageCount } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const monthYear = new Date().toISOString().slice(0, 7);

  try {
    const { used, limit, isPro } = await getUsageCount(session.user.email, 5);
    return NextResponse.json({ used, limit, monthYear, isPro });
  } catch {
    return NextResponse.json({ used: 0, limit: 5, monthYear, isPro: false });
  }
}
