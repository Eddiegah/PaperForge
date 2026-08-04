import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Store GitHub access token for OAuth-based GitHub export
      if (token.githubAccessToken) {
        (session as any).githubAccessToken = token.githubAccessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      // Capture GitHub OAuth access token when user signs in with GitHub
      if (account?.provider === 'github' && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
  },
});
