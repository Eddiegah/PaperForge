'use client';

import { useState } from 'react';

const venues = [
  { name: 'NeurIPS',          abbr: 'N',   bg: 'bg-purple-100 dark:bg-purple-900/40',  border: 'border-purple-200 dark:border-purple-700/50',  text: 'text-purple-700 dark:text-purple-300',  abbText: 'text-purple-600 dark:text-purple-400' },
  { name: 'ICML',             abbr: 'IC',  bg: 'bg-blue-100 dark:bg-blue-900/40',      border: 'border-blue-200 dark:border-blue-700/50',      text: 'text-blue-700 dark:text-blue-300',      abbText: 'text-blue-600 dark:text-blue-400' },
  { name: 'ICLR',             abbr: 'IL',  bg: 'bg-indigo-100 dark:bg-indigo-900/40',  border: 'border-indigo-200 dark:border-indigo-700/50',  text: 'text-indigo-700 dark:text-indigo-300',  abbText: 'text-indigo-600 dark:text-indigo-400' },
  { name: 'CVPR',             abbr: 'CV',  bg: 'bg-sky-100 dark:bg-sky-900/40',        border: 'border-sky-200 dark:border-sky-700/50',        text: 'text-sky-700 dark:text-sky-300',        abbText: 'text-sky-600 dark:text-sky-400' },
  { name: 'ECCV',             abbr: 'EC',  bg: 'bg-cyan-100 dark:bg-cyan-900/40',      border: 'border-cyan-200 dark:border-cyan-700/50',      text: 'text-cyan-700 dark:text-cyan-300',      abbText: 'text-cyan-600 dark:text-cyan-400' },
  { name: 'ACL',              abbr: 'A',   bg: 'bg-green-100 dark:bg-green-900/40',    border: 'border-green-200 dark:border-green-700/50',    text: 'text-green-700 dark:text-green-300',    abbText: 'text-green-600 dark:text-green-400' },
  { name: 'EMNLP',            abbr: 'EM',  bg: 'bg-teal-100 dark:bg-teal-900/40',      border: 'border-teal-200 dark:border-teal-700/50',      text: 'text-teal-700 dark:text-teal-300',      abbText: 'text-teal-600 dark:text-teal-400' },
  { name: 'AAAI',             abbr: 'AA',  bg: 'bg-orange-100 dark:bg-orange-900/40',  border: 'border-orange-200 dark:border-orange-700/50',  text: 'text-orange-700 dark:text-orange-300',  abbText: 'text-orange-600 dark:text-orange-400' },
  { name: 'Hugging Face',     abbr: 'HF',  bg: 'bg-yellow-100 dark:bg-yellow-900/40',  border: 'border-yellow-200 dark:border-yellow-700/50',  text: 'text-yellow-700 dark:text-yellow-600',  abbText: 'text-yellow-700 dark:text-yellow-500' },
  { name: 'Papers with Code', abbr: 'PC',  bg: 'bg-zinc-100 dark:bg-zinc-800/60',      border: 'border-zinc-200 dark:border-zinc-700',          text: 'text-zinc-700 dark:text-zinc-300',      abbText: 'text-zinc-600 dark:text-zinc-400' },
  { name: 'arXiv',            abbr: 'aX',  bg: 'bg-red-100 dark:bg-red-900/40',        border: 'border-red-200 dark:border-red-700/50',        text: 'text-red-700 dark:text-red-300',        abbText: 'text-red-600 dark:text-red-400' },
  { name: 'ICCV',             abbr: 'ICV', bg: 'bg-violet-100 dark:bg-violet-900/40',  border: 'border-violet-200 dark:border-violet-700/50',  text: 'text-violet-700 dark:text-violet-300',  abbText: 'text-violet-600 dark:text-violet-400' },
  { name: 'OpenReview',       abbr: 'OR',  bg: 'bg-pink-100 dark:bg-pink-900/40',      border: 'border-pink-200 dark:border-pink-700/50',      text: 'text-pink-700 dark:text-pink-300',      abbText: 'text-pink-600 dark:text-pink-400' },
  { name: 'Google Research',  abbr: 'GR',  bg: 'bg-blue-100 dark:bg-blue-900/40',      border: 'border-blue-200 dark:border-blue-700/50',      text: 'text-blue-700 dark:text-blue-300',      abbText: 'text-blue-600 dark:text-blue-400' },
];

const items = [...venues, ...venues, ...venues];

export default function VenueMarquee() {
  const [paused, setPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-12 border-y border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
      <p className="text-center text-[10px] font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase mb-7">
        Papers from these venues and sources
      </p>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setHoveredIdx(null); }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-3 w-max"
          style={{ animation: paused ? 'none' : 'marquee 40s linear infinite' }}
        >
          {items.map((v, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border shadow-sm
                  cursor-default select-none whitespace-nowrap transition-all duration-200
                  ${v.bg} ${v.border}
                  ${isHovered ? 'scale-105 shadow-md -translate-y-0.5' : 'scale-100'}`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${v.abbText} bg-white/60 dark:bg-black/20`}>
                  {v.abbr}
                </div>
                <span className={`text-sm font-semibold ${v.text}`}>{v.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
