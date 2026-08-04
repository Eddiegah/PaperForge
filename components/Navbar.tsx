'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { PaperForgeWordmark } from './Logo';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center">
          <PaperForgeWordmark />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">How it works</a>
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm text-zinc-700 dark:text-zinc-300 hidden sm:block max-w-[120px] truncate">
                  {session.user?.name}
                </span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-400">Signed in as</p>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
