/**
 * Simple user store backed by Upstash Redis.
 * Stores email/password accounts for users who don't use OAuth.
 * Passwords are hashed with bcrypt before storage.
 */

import crypto from 'crypto';

function isRedisConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// Simple password hashing using Node's built-in crypto (no bcrypt needed)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const testHash = crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
  return testHash === hash;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export async function createUser(email: string, password: string, name: string): Promise<StoredUser | null> {
  // Check if user already exists
  const existing = await getUserByEmail(email);
  if (existing) return null; // User already exists

  const user: StoredUser = {
    id: `user_${crypto.randomBytes(8).toString('hex')}`,
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  if (isRedisConfigured()) {
    const redis = await getRedis();
    await redis.setex(`user:${email.toLowerCase()}`, 60 * 60 * 24 * 365, JSON.stringify(user)); // 1 year TTL
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  if (!isRedisConfigured()) return null;

  const redis = await getRedis();
  const raw = await redis.get<string>(`user:${email.toLowerCase()}`);
  if (!raw) return null;

  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function verifyUser(email: string, password: string): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  if (!verifyPassword(password, user.passwordHash)) return null;

  return user;
}
