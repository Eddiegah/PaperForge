'use client';

import { useRef, useState } from 'react';

const venues = [
  { name: 'NeurIPS',          emoji: '🧠', bg: 'bg-purple-50  dark:bg-purple-900/30',  border: 'border-purple-200 dark:border-purple-700/50',  text: 'text-purple-700 dark:text-purple-300' },
  { name: 'ICML',             emoji: '📊', bg: 'bg-blue-50    dark:bg-blue-900/30',    border: 'border-blue-200   dark:border-blue-700/50',    text: 'text-blue-700   dark:text-blue-300' },
  { name: 'ICLR',             emoji: '🔬', bg: 'bg-indigo-50  dark:bg-indigo-900/30',  border: 'border-indigo-200 dark:border-indigo-700/50',  text: 'text-indigo-700 dark:text-indigo-300' },
  { name: 'CVPR',             emoji: '👁️', bg: 'bg-sky-50     dark:bg-sky-900/30',     border: 'border-sky-200    dark:border-sky-700/50',     text: 'text-sky-700    dark:text-sky-300' },
  { name: 'ECCV',             emoji: '📷', bg: 'bg-cyan-50    dark:bg-cyan-900/30',    border: 'border-cyan-200   dark:border-cyan-700/50',    text: 'text-cyan-700   dark:text-cyan-300' },
  { name: 'ACL',              emoji: '💬', bg: 'bg-green-50   dark:bg-green-900/30',   border: 'border-green-200  dark:border-green-700/50',   text: 'text-green-700  dark:text-green-300' },
  { name: 'EMNLP',            emoji: '📝', bg: 'bg-teal-50    dark:bg-teal-900/30',    border: 'border-teal-200   dark:border-teal-700/50',    text: 'text-teal-700   dark:text-teal-300' },
  { name: 'AAAI',             emoji: '🤖', bg: 'bg-orange-50  dark:bg-orange-900/30',  border: 'border-orange-200 dark:border-orange-700/50',  text: 'text-orange-700 dark:text-orange-300' },
  { name: 'Hugging Face',     emoji: '🤗', bg: 'bg-yellow-50  dark:bg-yellow-900/30',  border: 'border-yellow-200 dark:border-yellow-700/50',  text: 'text-yellow-700 dark:text-yellow-600' },
  { name: 'Papers with Code', emoji: '{ }',bg: 'bg-zinc-50    dark:bg-zinc-800/60',    border: 'border-zinc-200   dark:border-zinc-700',        text: 'text-zinc-700   dark:text-zinc-300' },
  { name: 'arXiv',            emoji: '📄', bg: 'bg-red-50     dark:bg-red-900/30',     border: 'border-red-200    dark:border-red-700/50',     text: 'text-red-700    dark:text-red-300' },
  { name: 'ICCV',             emoji: '🎯', bg: 'bg-violet-50  dark:bg-violet-900/30',  border: 'border-violet-200 dark:border-violet-700/50',  text: 'text-violet-700 dark:text-violet-300' },
  { name: 'OpenReview',       emoji: '🔎', bg: 'bg-pink-50    dark:bg-pink-900/30',    border: 'border-pink-200   dark:border-pink-700/50',    text: 'text-pink-700   dark:text-pink-300' },
  { name: 'Google Research',  emoji: '🌐', bg: 'bg-blue-50    dark:bg-blue-900/30',    border: 'border-blue-200   dark:border-blue-700/50',    text: 'text-blue-700   dark:text-blue-300' },
];

// Triple so the loop is seamless
const items = [...venues, ...venues, ...venues];

export default function VenueMarquee() {
  const [paused, setPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-14 border-y border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
      <p className="text-center text-[10px] font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase mb-8">
        Papers from these venues &amp; sources
      </p>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setHoveredIdx(null); }}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

        {/* The scrolling track */}
        <div
          className="flex gap-3 w-max"
          style={{
            animation: paused
              ? 'none'
              : 'marquee 40s linear infinite',
          }}
        >
          {items.map((v, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`
                  group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-sm
                  cursor-default select-none whitespace-nowrap
                  ${v.bg} ${v.border}
                  transition-all duration-200
                  ${isHovered ? 'scale-110 shadow-lg -translate-y-0.5' : 'scale-100'}
                `}
              >
                <span className={`text-xl leading-none transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}>
                  {v.emoji}
                </span>
                <span className={`text-sm font-semibold ${v.text}`}>{v.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS keyframe via style tag */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
