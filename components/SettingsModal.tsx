'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  X, User, CreditCard, Users, Gift, Copy, Check,
  Moon, Sun, LogOut, Shield, Bell, ChevronRight
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

type Section = 'account' | 'subscriptions' | 'team' | 'refer';

export default function SettingsModal({ onClose }: Props) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // Generate a referral code from the user's email
  const referralCode = session?.user?.email
    ? session.user.email.split('@')[0].toUpperCase().slice(0, 6) +
      Math.abs(session.user.email.length * 7).toString(36).toUpperCase().slice(0, 3)
    : 'LOADING';

  const referralLink = `https://paper-forge-nu.vercel.app/?ref=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems: { id: Section; label: string; Icon: any }[] = [
    { id: 'account',       label: 'Manage account',  Icon: User },
    { id: 'subscriptions', label: 'Subscriptions',   Icon: CreditCard },
    { id: 'team',          label: 'Team',             Icon: Users },
    { id: 'refer',         label: 'Refer',            Icon: Gift },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
          rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex"
        style={{ minHeight: 420 }}
      >
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 p-4">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 px-2">
            Settings
          </p>
          <nav className="space-y-0.5">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
              rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200
              hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
          >
            <X size={16} />
          </button>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 520 }}>
            <AnimatePresence mode="wait">
              {activeSection === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Manage account</h2>
                  <p className="text-sm text-zinc-400 mb-6">Update your profile and preferences.</p>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
                    {session?.user?.image ? (
                      <img src={session.user.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{session?.user?.name || 'User'}</p>
                      <p className="text-sm text-zinc-400">{session?.user?.email}</p>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Appearance</p>
                    <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <button onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                          !isDark
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                        }`}>
                        <Sun size={14} /> Light
                      </button>
                      <button onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                          isDark
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                        }`}>
                        <Moon size={14} /> Dark
                      </button>
                    </div>
                  </div>

                  {/* Sign out */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === 'subscriptions' && (
                <motion.div key="subscriptions" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Subscriptions</h2>
                  <p className="text-sm text-zinc-400 mb-6">Manage your plan and billing.</p>

                  {/* Current plan */}
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 mb-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Free plan</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium">Current</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">5 paper analyses per month</p>
                  </div>

                  {/* Upgrade options */}
                  <div className="space-y-3">
                    {[
                      { name: 'Pro', price: '$15/mo', desc: 'Unlimited analyses, priority queue, full history', color: 'indigo' },
                      { name: 'Team', price: '$30/mo', desc: 'Everything in Pro plus up to 10 team members', color: 'violet' },
                    ].map((plan) => (
                      <button key={plan.name}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{plan.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{plan.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{plan.price}</span>
                          <ChevronRight size={14} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-400 mt-4 text-center">
                    Payments via Paystack. Account approval pending.
                  </p>
                </motion.div>
              )}

              {activeSection === 'team' && (
                <motion.div key="team" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Team</h2>
                  <p className="text-sm text-zinc-400 mb-6">Collaborate with your research team.</p>

                  <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mx-auto">
                      <Users size={20} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Team collaboration</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Upgrade to Team plan to invite colleagues, share paper histories, and collaborate on replications.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('subscriptions')}
                      className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                      Upgrade to Team →
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === 'refer' && (
                <motion.div key="refer" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Refer a friend</h2>
                  <p className="text-sm text-zinc-400 mb-6">Share PaperForge and earn rewards.</p>

                  {/* Hero card */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-800/40 text-center mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mx-auto mb-3">
                      <Gift size={20} className="text-indigo-500" />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Give friends a head start. Every researcher who joins with your link counts toward your rewards.
                    </p>
                  </div>

                  {/* Referral link */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2">Your referral link</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 truncate font-mono">
                        {referralLink}
                      </div>
                      <button
                        onClick={copyReferral}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-medium transition-colors flex-shrink-0"
                      >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-1">Friends referred</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">0</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-1">Your code</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-wider">{referralCode}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
