import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ used: 0, limit: 5, monthYear: '' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const monthYear = new Date().toISOString().slice(0, 7);

  try {
    const rows = await sql`
      SELECT paper_count FROM usage_tracking
      WHERE user_email = ${session.user.email} AND month_year = ${monthYear}
    `;
    const used = (rows[0] as any)?.paper_count ?? 0;
    return NextResponse.json({ used, limit: 5, monthYear });
  } catch {
    return NextResponse.json({ used: 0, limit: 5, monthYear });
  }
}
