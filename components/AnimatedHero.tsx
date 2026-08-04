'use client';

import { motion } from 'framer-motion';
import LandingUpload from './LandingUpload';
import { BarChart3, Code2, CheckCircle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] as any },
});

export default function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 min-h-[88vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]
          bg-gradient-radial from-indigo-100/60 via-violet-50/20 to-transparent
          dark:from-indigo-600/10 dark:via-violet-600/5 dark:to-transparent blur-3xl" />
        <div className="absolute inset-0
          bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)]
          dark:bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)]
          bg-[size:52px_52px]" />
      </div>

      {/* Floating badges - desktop only, reduced motion impact */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute left-8 top-1/3 hidden xl:flex items-center gap-2.5
          px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-700 shadow-lg"
        style={{ animation: 'float 4s ease-in-out infinite' }}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
          <BarChart3 size={15} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Score: 2/10</p>
          <p className="text-[10px] text-emerald-500 font-medium">Very clear paper</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="absolute right-8 top-1/4 hidden xl:flex items-center gap-2.5
          px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-700 shadow-lg"
        style={{ animation: 'float 4.5s ease-in-out infinite 0.8s' }}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <Code2 size={15} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">model.py generated</p>
          <p className="text-[10px] text-zinc-400">Inline annotations included</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="absolute right-12 bottom-1/3 hidden xl:flex items-center gap-2
          px-3 py-2 rounded-xl bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-700 shadow-lg"
        style={{ animation: 'float 5s ease-in-out infinite 1.5s' }}
      >
        <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Pushed to GitHub</p>
      </motion.div>

      {/* Main content */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0.1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full
            bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800
            text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Honest research-to-code acceleration
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight
            text-zinc-900 dark:text-white leading-[1.06] mb-5"
        >
          From paper<br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
            to honest code
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p {...fadeUp(0.3)}
          className="text-base sm:text-lg md:text-xl text-zinc-500 dark:text-zinc-400
            max-w-2xl mx-auto leading-relaxed mb-10">
          Paste an arXiv link or upload a PDF. PaperForge extracts the technical spec,
          scores how replicable it is, and generates annotated starter code with{' '}
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            every ambiguity flagged honestly
          </span>.
        </motion.p>

        {/* Upload zone */}
        <motion.div {...fadeUp(0.45)}>
          <LandingUpload />
        </motion.div>

        {/* Disclaimer */}
        <motion.p {...fadeUp(0.55)}
          className="mt-5 text-xs text-zinc-400 dark:text-zinc-500">
          LLM extraction accuracy ~35-40%. The{' '}
          <span className="text-indigo-500 dark:text-indigo-400 font-medium">
            Replication Difficulty Score
          </span>{' '}
          tells you exactly what to verify.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {[
            { v: '35-40%', l: 'State-of-art accuracy' },
            { v: '1-10',   l: 'Grounded difficulty score' },
            { v: 'inline', l: 'Ambiguity annotations' },
            { v: '< 90s',  l: 'Extraction time' },
          ].map((s) => (
            <div key={s.l}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80
                border border-zinc-100 dark:border-zinc-800
                hover:border-indigo-200 dark:hover:border-indigo-800
                transition-colors cursor-default"
            >
              <div className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">{s.v}</div>
              <div className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
