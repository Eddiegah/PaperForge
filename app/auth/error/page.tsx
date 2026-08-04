'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaperForgeLogo } from '@/components/Logo';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid.',
  OAuthSignin: 'Could not start the sign-in process. Try again.',
  OAuthCallback: 'Could not complete sign-in. The callback URL may be misconfigured.',
  OAuthCreateAccount: 'Could not create your account.',
  EmailCreateAccount: 'Could not create your account.',
  Callback: 'Could not complete sign-in callback.',
  OAuthAccountNotLinked: 'This email is already linked to another account.',
  Default: 'An error occurred during sign-in. Please try again.',
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <PaperForgeLogo size={48} />
        </div>
        <div className="bg-zinc-900 border border-red-800/50 rounded-2xl p-8 space-y-4">
          <div className="text-3xl">⚠️</div>
          <h1 className="text-xl font-bold text-zinc-100">Sign-in failed</h1>
          <p className="text-zinc-400 text-sm">{message}</p>
          {error && (
            <p className="text-zinc-600 text-xs font-mono">Error code: {error}</p>
          )}
        </div>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors text-sm"
        >
          ← Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <ErrorContent />
    </Suspense>
  );
}
