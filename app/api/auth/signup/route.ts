import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const user = await createUser(
    email,
    password,
    name || email.split('@')[0]
  );

  if (!user) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }

  return NextResponse.json({ success: true, email: user.email, name: user.name });
}
