'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  Users, BarChart2, Shield, Search, RefreshCw,
  Crown, AlertTriangle, CheckCircle, XCircle, Loader2,
} from 'lucide-react';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'gahedmunderic@gmail.com';

interface Stats {
  totalUsersThisMonth: number;
  totalPapersThisMonth: number;
  totalPapersToday: number;
  totalUsers: number;
}

interface UserInfo {
  email: string;
  usedThisMonth: number;
  totalPapers: number;
  isPro: boolean;
  recentHistory: {
    jobId: string;
    paperTitle: string;
    arxivId: string | null;
    difficultyScore: number | null;
    createdAt: string;
  }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  const [searchEmail, setSearchEmail] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  const [resetCount, setResetCount] = useState('0');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const [proLoading, setProLoading] = useState(false);
  const [proMsg, setProMsg] = useState('');

  const [ingestEmail, setIngestEmail] = useState('');
  const [ingestArxivId, setIngestArxivId] = useState('');
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestMsg, setIngestMsg] = useState('');

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setStats(await res.json());
    } catch (e: any) {
      setStatsError(e.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadStats();
  }, [isAdmin, loadStats]);

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setUserLoading(true);
    setUserError('');
    setUserInfo(null);
    setResetMsg('');
    setProMsg('');
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail.trim())}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUserInfo(data);
      setResetCount(String(data.usedThisMonth));
    } catch (e: any) {
      setUserError(e.message);
    } finally {
      setUserLoading(false);
    }
  };

  const resetUsage = async () => {
    if (!userInfo) return;
    setResetLoading(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/admin/reset-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userInfo.email, newCount: parseInt(resetCount, 10) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResetMsg(`✓ Usage set to ${data.newCount} for ${data.email}`);
      setUserInfo(prev => prev ? { ...prev, usedThisMonth: data.newCount } : prev);
    } catch (e: any) {
      setResetMsg(`✗ ${e.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  const togglePro = async (targetIsPro: boolean) => {
    if (!userInfo) return;
    setProLoading(true);
    setProMsg('');
    try {
      const res = await fetch('/api/admin/set-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userInfo.email, isPro: targetIsPro }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setProMsg(`✓ ${data.email} is now ${data.isPro ? 'Pro' : 'Free tier'}`);
      setUserInfo(prev => prev ? { ...prev, isPro: data.isPro } : prev);
    } catch (e: any) {
      setProMsg(`✗ ${e.message}`);
    } finally {
      setProLoading(false);
    }
  };

  const triggerIngest = async () => {
    if (!ingestArxivId.trim()) return;
    setIngestLoading(true);
    setIngestMsg('');
    try {
      // We POST to the normal ingest endpoint; if an email is given it's
      // informational only — the job will use the admin session
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arxivId: ingestArxivId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setIngestMsg(`✓ Job created: ${data.jobId} — opening processing page…`);
      setTimeout(() => router.push(`/processing/${data.jobId}`), 1500);
    } catch (e: any) {
      setIngestMsg(`✗ ${e.message}`);
    } finally {
      setIngestLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <Shield size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Access denied</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Shield size={22} className="text-indigo-500" />
              Admin Panel
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{session?.user?.email}</span>
            </p>
          </div>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Usage Overview */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <BarChart2 size={14} />
            Usage Overview
          </h2>
          {statsError && (
            <p className="text-sm text-red-500 mb-3">{statsError}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Users this month', value: stats?.totalUsersThisMonth },
              { label: 'Papers this month', value: stats?.totalPapersThisMonth },
              { label: 'Papers today', value: stats?.totalPapersToday },
              { label: 'Total users', value: stats?.totalUsers },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  ) : (
                    item.value ?? '—'
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* User Management */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Users size={14} />
            User Management
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Search by email…"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchUser()}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <button
                onClick={searchUser}
                disabled={userLoading || !searchEmail.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {userLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                Search
              </button>
            </div>

            {userError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <XCircle size={14} /> {userError}
              </p>
            )}

            {/* User Info */}
            {userInfo && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Summary */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 min-w-[120px]">
                    <p className="text-xs text-zinc-400 mb-0.5">Used this month</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userInfo.usedThisMonth}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 min-w-[120px]">
                    <p className="text-xs text-zinc-400 mb-0.5">Total papers</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userInfo.totalPapers}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 min-w-[120px] flex items-center gap-2">
                    {userInfo.isPro ? (
                      <>
                        <Crown size={16} className="text-yellow-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-400 mb-0.5">Status</p>
                          <p className="text-sm font-bold text-yellow-500">Pro</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="text-zinc-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-400 mb-0.5">Status</p>
                          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Free</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Reset Usage */}
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Set usage count</label>
                    <input
                      type="number"
                      min={0}
                      value={resetCount}
                      onChange={e => setResetCount(e.target.value)}
                      className="w-24 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <button
                    onClick={resetUsage}
                    disabled={resetLoading}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {resetLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Apply
                  </button>
                  {resetMsg && (
                    <p className={`text-xs ${resetMsg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {resetMsg}
                    </p>
                  )}
                </div>

                {/* Pro Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => togglePro(!userInfo.isPro)}
                    disabled={proLoading}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                      userInfo.isPro
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {proLoading ? <Loader2 size={13} className="animate-spin" /> : <Crown size={13} />}
                    {userInfo.isPro ? 'Revoke Pro' : 'Grant Pro'}
                  </button>
                  {proMsg && (
                    <p className={`text-xs ${proMsg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {proMsg}
                    </p>
                  )}
                </div>

                {/* Recent History */}
                {userInfo.recentHistory.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Recent papers</p>
                    <div className="space-y-1.5">
                      {userInfo.recentHistory.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-800/60 rounded-lg px-3 py-2 gap-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300 truncate flex-1">{h.paperTitle}</span>
                          {h.difficultyScore != null && (
                            <span className="text-zinc-400 flex-shrink-0">Score {h.difficultyScore}</span>
                          )}
                          <span className="text-zinc-400 flex-shrink-0">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* System Controls */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            System Controls
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Trigger a paper analysis on behalf of any user. The job will run under the admin session.
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="email"
                placeholder="User email (informational)"
                value={ingestEmail}
                onChange={e => setIngestEmail(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="arXiv ID (e.g. 1706.03762)"
                value={ingestArxivId}
                onChange={e => setIngestArxivId(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                onClick={triggerIngest}
                disabled={ingestLoading || !ingestArxivId.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {ingestLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Trigger Analysis
              </button>
            </div>
            {ingestMsg && (
              <p className={`text-sm ${ingestMsg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {ingestMsg}
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
