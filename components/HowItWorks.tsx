'use client';

import { motion } from 'framer-motion';
import { Upload, ScanSearch, BarChart3, Code2 } from 'lucide-react';

const steps = [
  {
    n: '01',
    title: 'Upload or paste',
    desc: 'Drop a PDF or paste an arXiv link. PaperForge fetches and parses the full paper text instantly.',
    Icon: Upload,
    from: 'from-blue-600/20', to: 'to-indigo-600/10', num: 'text-blue-400', border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20 text-blue-300',
  },
  {
    n: '02',
    title: 'AI extracts the spec',
    desc: 'Every field - architecture, dataset, optimizer, metrics - extracted with a confidence level: high, medium, low, or missing.',
    Icon: ScanSearch,
    from: 'from-violet-600/20', to: 'to-purple-600/10', num: 'text-violet-400', border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20 text-violet-300',
  },
  {
    n: '03',
    title: 'Difficulty score computed',
    desc: 'A 1-10 Replication Difficulty Score from real signals - not a guess. Every ambiguous field listed with a specific reason.',
    Icon: BarChart3,
    from: 'from-amber-600/20', to: 'to-orange-600/10', num: 'text-amber-400', border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20 text-amber-300',
  },
  {
    n: '04',
    title: 'Honest code generated',
    desc: 'model.py, train.py, data_loader.py with inline comments on every assumption. Push to GitHub in one click.',
    Icon: Code2,
    from: 'from-emerald-600/20', to: 'to-green-600/10', num: 'text-emerald-400', border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How it works</h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Four steps from paper to honest, annotated starter code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${s.from} ${s.to}
                border ${s.border} bg-zinc-900 overflow-hidden group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                  <s.Icon size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold tracking-widest uppercase mb-1.5 ${s.num}`}>{s.n}</p>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 leading-snug">{s.title}</h3>
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
