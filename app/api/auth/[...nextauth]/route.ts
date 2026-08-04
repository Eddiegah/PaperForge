import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

// Required for Vercel Edge/Serverless
export const runtime = 'nodejs';
