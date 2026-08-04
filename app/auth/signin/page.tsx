'use client';

import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { PaperForgeLogo } from '@/components/Logo';
import { Mail, Eye, EyeOff, GitBranch, ArrowRight, CheckCircle, Lock } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'email-sent' | 'forgot';

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleOAuth = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading('email');

    // Send magic link (passwordless)
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send sign-in link. Try GitHub or Google.');
      } else {
        setMode('email-sent');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('forgot');
    // Send magic link as password reset
    try {
      await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setForgotSent(true);
    } catch {}
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30
      dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px]
          bg-indigo-100/50 dark:bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="relative w-full max-w-sm">

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
          rounded-2xl shadow-xl shadow-zinc-200/60 dark:shadow-black/30 overflow-hidden">

          {/* Logo header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-zinc-100 dark:border-zinc-800">
            <PaperForgeLogo size={40} className="mx-auto" />
            <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">PaperForge</h1>
            <p className="mt-1 text-zinc-400 text-xs">Sign in to start analyzing papers</p>
          </div>

          <div className="px-8 py-6">
            <AnimatePresence mode="wait">

              {/* Email sent state */}
              {mode === 'email-sent' && (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
                    <CheckCircle size={26} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Check your inbox</h3>
                    <p className="text-sm text-zinc-500">We sent a sign-in link to</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{email}</p>
                  </div>
                  <p className="text-xs text-zinc-400">Link expires in 15 minutes. Check your spam folder if you don't see it.</p>
                  <button onClick={() => { setMode('signin'); setEmail(''); }}
                    className="text-xs text-indigo-500 hover:underline">
                    Use a different method
                  </button>
                </motion.div>
              )}

              {/* Forgot password */}
              {mode === 'forgot' && (
                <motion.form key="forgot" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleForgot} className="space-y-4">
                  <button type="button" onClick={() => { setMode('signin'); setForgotSent(false); }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                    Back to sign in
                  </button>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Reset access</h3>
                    <p className="text-xs text-zinc-400">Enter your email and we will send a sign-in link.</p>
                  </div>
                  {forgotSent ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm text-center">
                      Sign-in link sent to {email}
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="Email address" required
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800
                            border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100
                            placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <button type="submit" disabled={loading === 'forgot'}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm disabled:opacity-60 transition-colors">
                        {loading === 'forgot' ? 'Sending...' : 'Send sign-in link'}
                      </button>
                    </>
                  )}
                </motion.form>
              )}

              {/* Main sign-in / sign-up */}
              {(mode === 'signin' || mode === 'signup') && (
                <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                  {/* Sign in / Sign up toggle */}
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {mode === 'signin' ? 'Not registered yet? ' : 'Already have an account? '}
                      <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                        className="text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>

                  {/* Google */}
                  <button onClick={() => handleOAuth('google')} disabled={!!loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                      border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800
                      hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200
                      font-medium text-sm disabled:opacity-60 transition-all shadow-sm">
                    {loading === 'google' ? <Spinner dark /> : <GoogleIcon />}
                    {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="text-xs text-zinc-400">or</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Email address" required
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800
                          border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100
                          placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Password</label>
                        {mode === 'signin' && (
                          <button type="button" onClick={() => { setMode('forgot'); setForgotSent(false); }}
                            className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Password" required
                          className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800
                            border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100
                            placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button type="submit" disabled={loading === 'email' || !email || !password}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                        text-white font-bold text-sm disabled:opacity-60 transition-colors
                        flex items-center justify-center gap-2">
                      {loading === 'email' ? <Spinner /> : null}
                      {loading === 'email' ? 'Please wait...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </button>
                  </form>

                  {/* GitHub - highlighted as required for push feature */}
                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button onClick={() => handleOAuth('github')} disabled={!!loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                        bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white
                        text-white dark:text-zinc-900 font-medium text-sm
                        disabled:opacity-60 transition-all">
                      {loading === 'github' ? <Spinner /> : <GitBranch size={15} />}
                      {loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center mt-1.5">
                      Required to push generated code to GitHub
                    </p>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-zinc-400 text-xs mt-4">Honest research acceleration</p>
      </motion.div>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg className={`animate-spin w-4 h-4 ${dark ? 'text-zinc-700' : 'text-white'}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
