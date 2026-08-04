'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PaperForgeLogo } from '@/components/Logo';
import { Eye, EyeOff, Mail, Lock, GitBranch } from 'lucide-react';

export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [mode, setMode] = useState<'options' | 'email'>('options');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleOAuth = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading('email');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(null);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30
      dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px]
          bg-indigo-100/60 dark:bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
          rounded-2xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/30">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <PaperForgeLogo size={44} />
            <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              PaperForge
            </h1>
            <p className="mt-1 text-zinc-400 text-xs text-center">
              Sign in to start analyzing papers
            </p>
          </div>

          {mode === 'options' ? (
            <div className="space-y-3">
              {/* GitHub */}
              <button
                onClick={() => handleOAuth('github')}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                  bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white
                  text-white dark:text-zinc-900 font-medium text-sm
                  disabled:opacity-60 transition-all border border-zinc-800 dark:border-zinc-200"
              >
                {loading === 'github' ? <Spinner /> : <GitBranch size={16} />}
                {loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
              </button>

              {/* Google */}
              <button
                onClick={() => handleOAuth('google')}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                  bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm
                  disabled:opacity-60 transition-all border border-zinc-200 shadow-sm"
              >
                {loading === 'google' ? <Spinner dark /> : <GoogleIcon />}
                {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-xs text-zinc-400">or</span>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              </div>

              {/* Email option */}
              <button
                onClick={() => setMode('email')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                  bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700
                  text-zinc-700 dark:text-zinc-300 font-medium text-sm
                  transition-all border border-zinc-200 dark:border-zinc-700"
              >
                <Mail size={16} />
                Continue with email
              </button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => { setMode('options'); setError(''); }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-2 flex items-center gap-1"
              >
                Back to sign-in options
              </button>

              <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-2">
                <button type="button" onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${!isSignUp ? 'bg-zinc-900 dark:bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-500'}`}>
                  Sign in
                </button>
                <button type="button" onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${isSignUp ? 'bg-zinc-900 dark:bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-500'}`}>
                  Sign up
                </button>
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                    bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                    text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
                    bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                    text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button type="button"
                    className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading === 'email'}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                  text-white font-semibold text-sm disabled:opacity-60 transition-colors
                  flex items-center justify-center gap-2"
              >
                {loading === 'email' ? <Spinner /> : null}
                {loading === 'email' ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>

              <p className="text-center text-xs text-zinc-400 mt-2">
                Note: Email sign-in requires account setup. Use GitHub or Google for instant access.
              </p>
            </motion.form>
          )}

          <p className="text-zinc-400 text-xs text-center mt-6 leading-relaxed">
            By signing in you agree to use this tool responsibly.
          </p>
        </div>

        <p className="text-center text-zinc-400 text-xs mt-5">
          Honest research acceleration
        </p>
      </motion.div>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg className={`animate-spin w-4 h-4 ${dark ? 'text-zinc-800' : 'text-white'}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
