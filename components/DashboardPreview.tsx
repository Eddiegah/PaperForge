'use client';

import { motion } from 'framer-motion';

export default function DashboardPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-zinc-950 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">Dashboard</p>
          <h2 className="text-4xl font-bold text-white mb-3">Everything in one view</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Difficulty score, extracted spec, annotated code, and GitHub export — all without leaving the page.
          </p>
        </div>

        {/* Mock browser window */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <div className="flex-1 mx-4">
              <div className="bg-zinc-700/60 rounded-md px-3 py-1 text-xs text-zinc-400 font-mono text-center max-w-xs mx-auto">
                paperforge.app/processing/job_...
              </div>
            </div>
          </div>

          {/* Mock dashboard content */}
          <div className="grid grid-cols-12 min-h-[420px]">
            {/* Left sidebar */}
            <div className="col-span-3 border-r border-zinc-800 p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">History</p>
              {[
                { title: 'Attention Is All You Need', score: 2, time: '2m ago', color: 'bg-emerald-500' },
                { title: 'CLIP: Learning Transferable...', score: 3, time: '1h ago', color: 'bg-emerald-500' },
                { title: 'GPT-3: Language Models...', score: 6, time: '3h ago', color: 'bg-amber-500' },
                { title: 'Diffusion Models Beat GANs', score: 7, time: 'yesterday', color: 'bg-orange-500' },
              ].map((item, i) => (
                <div key={i} className={`p-2.5 rounded-lg cursor-pointer transition-colors ${i === 0 ? 'bg-zinc-700/60' : 'hover:bg-zinc-800/60'}`}>
                  <p className="text-xs text-zinc-200 font-medium truncate leading-snug mb-1">{item.title}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-zinc-500">{item.score}/10 · {item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center panel */}
            <div className="col-span-5 p-5 border-r border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Current paper</p>
              <h3 className="text-sm font-bold text-white leading-snug mb-1">Attention Is All You Need</h3>
              <p className="text-[11px] text-zinc-500 mb-4">Vaswani et al. · 2017</p>

              {/* Score gauge mini */}
              <div className="bg-zinc-800/60 rounded-xl p-4 mb-4 flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#3f3f46" strokeWidth="12" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12"
                      strokeLinecap="round" strokeDasharray="239" strokeDashoffset="191" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-400">2</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-300 mb-0.5">Replication Difficulty</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Paper is exceptionally clear. Most details stated explicitly.</p>
                </div>
              </div>

              {/* Clarity bars */}
              {[
                { label: 'Model Architecture', pct: 100, color: 'bg-emerald-500' },
                { label: 'Dataset',            pct: 80,  color: 'bg-emerald-500' },
                { label: 'Training Recipe',    pct: 85,  color: 'bg-emerald-500' },
                { label: 'Evaluation',         pct: 90,  color: 'bg-emerald-500' },
              ].map((b) => (
                <div key={b.label} className="mb-2">
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5">
                    <span>{b.label}</span><span className="text-emerald-400">{b.pct}%</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right panel — code */}
            <div className="col-span-4 p-0 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-800/30">
                {['model.py', 'train.py', 'README.md'].map((f, i) => (
                  <button key={f} className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${i === 0 ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-4 font-mono text-[10px] leading-relaxed text-zinc-400 overflow-hidden">
                <p><span className="text-purple-400">import</span> <span className="text-zinc-200">torch</span></p>
                <p><span className="text-purple-400">import</span> <span className="text-zinc-200">torch.nn as nn</span></p>
                <p className="mt-2 text-zinc-600"># Transformer architecture</p>
                <p><span className="text-blue-400">class</span> <span className="text-yellow-300">Transformer</span><span className="text-zinc-300">(nn.Module):</span></p>
                <p className="pl-4"><span className="text-blue-400">def</span> <span className="text-green-400">__init__</span><span className="text-zinc-300">(self,</span></p>
                <p className="pl-8 text-zinc-300">d_model<span className="text-zinc-500">=</span><span className="text-orange-400">512</span>,</p>
                <p className="pl-8 text-zinc-300">nhead<span className="text-zinc-500">=</span><span className="text-orange-400">8</span>,</p>
                <p className="pl-8 text-zinc-600"># NOTE: num_layers from §3.1</p>
                <p className="pl-8 text-zinc-300">num_layers<span className="text-zinc-500">=</span><span className="text-orange-400">6</span><span className="text-zinc-300">):</span></p>
                <p className="pl-4 mt-1 text-zinc-300">super().__init__()</p>
                <p className="pl-4 text-zinc-600 mt-2"># Encoder stack</p>
                <p className="pl-4 text-zinc-300">self.encoder = nn.TransformerEncoder(</p>
                <p className="pl-8 text-zinc-300">nn.TransformerEncoderLayer(</p>
                <p className="pl-12 text-zinc-300">d_model, nhead</p>
                <p className="pl-8 text-zinc-300">), num_layers</p>
                <p className="pl-4 text-zinc-300">)</p>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">5 files generated</span>
                <button className="text-[11px] px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
                  Push to GitHub
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
