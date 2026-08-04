import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserHistory } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = await getUserHistory(session.user.email, 20);
  return NextResponse.json(history);
}
