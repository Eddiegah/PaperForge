'use client';

import { motion } from 'framer-motion';

const steps = [
  { n: '01', title: 'Upload or paste',         emoji: '📄', desc: 'Drop a PDF or paste an arXiv link. PaperForge fetches and parses the full paper text instantly.',                                                                 from: 'from-blue-600/20',   to: 'to-indigo-600/10',  num: 'text-blue-400',    border: 'border-blue-500/20' },
  { n: '02', title: 'Claude extracts the spec', emoji: '🔍', desc: 'Every field — architecture, dataset, optimizer, metrics — extracted with a confidence level: high, medium, low, or missing.',                                    from: 'from-violet-600/20', to: 'to-purple-600/10', num: 'text-violet-400',  border: 'border-violet-500/20' },
  { n: '03', title: 'Difficulty score computed',emoji: '📈', desc: 'A 1–10 Replication Difficulty Score from real signals — not an LLM guess. Every ambiguous field listed with a specific reason.',                                  from: 'from-amber-600/20',  to: 'to-orange-600/10',  num: 'text-amber-400',   border: 'border-amber-500/20' },
  { n: '04', title: 'Honest code generated',    emoji: '💻', desc: 'model.py, train.py, data_loader.py with # NOTE comments on every assumption. Architecture diagram. Push to GitHub in one click.',                                from: 'from-emerald-600/20',to: 'to-green-600/10',   num: 'text-emerald-400', border: 'border-emerald-500/20' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">Process</p>
          <h2 className="text-4xl font-bold text-white mb-3">How it works</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Four steps from paper to honest, annotated starter code.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${s.from} ${s.to}
                border ${s.border} bg-zinc-900
                cursor-default overflow-hidden group`}
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                transition-opacity duration-500 pointer-events-none shimmer" />

              <div className="flex items-start gap-4 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                >
                  {s.emoji}
                </motion.div>
                <div>
                  <p className={`text-xs font-bold tracking-widest uppercase mb-1.5 ${s.num}`}>{s.n}</p>
                  <h3 className="font-bold text-white text-lg mb-2 leading-snug">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
