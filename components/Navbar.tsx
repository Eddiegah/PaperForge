'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { PaperForgeWordmark } from './Logo';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, ChevronDown, Plus, Home } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine if we're inside the app (not on landing page)
  const isAppPage = pathname.startsWith('/dashboard') ||
                    pathname.startsWith('/processing') ||
                    pathname.startsWith('/auth');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href={session ? '/dashboard' : '/'} className="flex items-center flex-shrink-0">
          <PaperForgeWordmark />
        </Link>

        {/* Nav links - landing page vs app */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          {isAppPage ? (
            // App navigation
            <>
              <Link href="/dashboard"
                className={`flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${pathname === '/dashboard' ? 'text-zinc-900 dark:text-zinc-100 font-medium' : ''}`}>
                <Home size={14} />
                Dashboard
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                <Plus size={14} />
                New analysis
              </Link>
            </>
          ) : (
            // Landing page navigation
            <>
              <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">How it works</a>
              <a href="#features"     className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a>
              <a href="#pricing"      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a>
              <a href="#faq"          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</a>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm text-zinc-700 dark:text-zinc-300 hidden sm:block max-w-[100px] truncate font-medium">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} className="text-zinc-400" />
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
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-20 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-400">Signed in as</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{session.user?.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <LayoutDashboard size={14} className="text-zinc-400" />
                          Dashboard
                        </Link>
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <Plus size={14} className="text-zinc-400" />
                          New analysis
                        </Link>
                      </div>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
                        <button
                          onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth/signin"
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
