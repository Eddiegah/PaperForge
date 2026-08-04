'use client';

import { motion } from 'framer-motion';
import LandingUpload from './LandingUpload';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] as any },
});

export default function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 min-h-[90vh] flex items-center">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px]
          bg-gradient-radial from-indigo-100/70 via-violet-50/30 to-transparent
          dark:from-indigo-600/12 dark:via-violet-600/6 dark:to-transparent blur-3xl" />
        {/* Side accents */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-100/60 dark:bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-600/6 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0
          bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)]
          dark:bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)]
          bg-[size:52px_52px]" />
      </div>

      {/* Floating badges — decorative */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute left-4 sm:left-12 top-1/3 hidden lg:flex items-center gap-2
          px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
          shadow-lg shadow-zinc-100 dark:shadow-black/30 float"
      >
        <span className="text-lg">📊</span>
        <div>
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Score: 2/10</p>
          <p className="text-[10px] text-emerald-500">Very clear paper</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="absolute right-4 sm:right-12 top-1/4 hidden lg:flex items-center gap-2
          px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
          shadow-lg shadow-zinc-100 dark:shadow-black/30"
        style={{ animation: 'float 4.5s ease-in-out infinite 0.8s' }}
      >
        <span className="text-lg">💻</span>
        <div>
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">model.py generated</p>
          <p className="text-[10px] text-zinc-400"># NOTE comments included</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute right-8 sm:right-16 bottom-1/3 hidden lg:flex items-center gap-2
          px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
          shadow-lg shadow-zinc-100 dark:shadow-black/30"
        style={{ animation: 'float 5s ease-in-out infinite 1.5s' }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Pushed to GitHub ✓</p>
      </motion.div>

      {/* Main content */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full
          bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800
          text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-sm
          hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Honest research-to-code acceleration
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-5xl sm:text-6xl md:text-[72px] font-extrabold tracking-tight
            text-zinc-900 dark:text-white leading-[1.04] mb-6"
        >
          From paper<br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              to honest code
            </span>
            {/* Underline accent */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 origin-left rounded-full opacity-60"
            />
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p {...fadeUp(0.3)}
          className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Paste an arXiv link or upload a PDF. PaperForge extracts the technical spec,
          scores how replicable it is, and generates annotated starter code —
          with{' '}
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">every ambiguity flagged honestly</span>.
        </motion.p>

        {/* Upload zone */}
        <motion.div {...fadeUp(0.45)}>
          <LandingUpload />
        </motion.div>

        {/* Subtle disclaimer */}
        <motion.p {...fadeUp(0.55)}
          className="mt-5 text-xs text-zinc-400 dark:text-zinc-500">
          LLM extraction accuracy ~35–40%. The{' '}
          <span className="text-indigo-500 dark:text-indigo-400 font-medium">Replication Difficulty Score</span>{' '}
          tells you exactly what to verify.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {[
            { v: '35–40%', l: 'State-of-art accuracy' },
            { v: '1–10',   l: 'Grounded difficulty score' },
            { v: '# NOTE', l: 'Inline ambiguity flags' },
            { v: '< 90s',  l: 'Extraction time' },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80
                border border-zinc-100 dark:border-zinc-800
                hover:border-indigo-200 dark:hover:border-indigo-800
                hover:shadow-md transition-all cursor-default"
            >
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">{s.v}</div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
