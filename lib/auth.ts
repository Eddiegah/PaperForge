import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { sendWelcomeEmail } from './emails/send';

// Track welcomed users in memory (good enough for serverless - each instance tracks its own)
const welcomedUsers = new Set<string>();

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user user:email repo' },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Send welcome email on first sign-in (best effort - never blocks auth)
      if (user.email && !welcomedUsers.has(user.email)) {
        welcomedUsers.add(user.email);
        sendWelcomeEmail(user.email, user.name || 'there').catch(() => {});
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (token.githubAccessToken) {
        (session as any).githubAccessToken = token.githubAccessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider === 'github' && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
  },
});
