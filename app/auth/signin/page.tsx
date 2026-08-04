'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PaperForgeLogo } from '@/components/Logo';

export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <PaperForgeLogo size={56} />
            <h1 className="mt-4 text-2xl font-bold text-zinc-100 tracking-tight">
              PaperForge
            </h1>
            <p className="mt-1.5 text-zinc-400 text-sm text-center">
              Turn research papers into honest, annotated starter code
            </p>
          </div>

          {/* Sign in buttons */}
          <div className="space-y-3">
            <SignInButton
              provider="github"
              label="Continue with GitHub"
              loading={loading === 'github'}
              onClick={() => handleSignIn('github')}
              icon={<GitHubIcon />}
              className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            />
            <SignInButton
              provider="google"
              label="Continue with Google"
              loading={loading === 'google'}
              onClick={() => handleSignIn('google')}
              icon={<GoogleIcon />}
              className="bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900"
            />
          </div>

          {/* Divider + note */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs text-center leading-relaxed">
              By signing in you agree to use this tool responsibly.
              Generated code is a starting scaffold — always verify against the original paper.
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Honest research acceleration · Not one-click magic
        </p>
      </motion.div>
    </div>
  );
}

function SignInButton({
  label,
  loading,
  onClick,
  icon,
  className,
}: {
  provider: string;
  label: string;
  loading: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        icon
      )}
      {loading ? 'Connecting...' : label}
    </button>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
