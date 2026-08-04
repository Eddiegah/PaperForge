'use client';

import { useState } from 'react';

const venues = [
  { name: 'NeurIPS',          weight: 'font-bold' },
  { name: 'ICML',             weight: 'font-semibold' },
  { name: 'ICLR',             weight: 'font-semibold' },
  { name: 'CVPR',             weight: 'font-bold' },
  { name: 'ECCV',             weight: 'font-normal' },
  { name: 'ACL',              weight: 'font-semibold' },
  { name: 'EMNLP',            weight: 'font-normal' },
  { name: 'AAAI',             weight: 'font-bold' },
  { name: 'Hugging Face',     weight: 'font-normal' },
  { name: 'Papers with Code', weight: 'font-normal' },
  { name: 'arXiv',            weight: 'font-bold',   special: true },
  { name: 'ICCV',             weight: 'font-semibold' },
  { name: 'OpenReview',       weight: 'font-normal' },
  { name: 'Google Research',  weight: 'font-normal' },
  { name: 'Meta AI',          weight: 'font-normal' },
  { name: 'DeepMind',         weight: 'font-semibold' },
];

// Triple for seamless loop
const items = [...venues, ...venues, ...venues];

export default function VenueMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-10 border-y border-zinc-100 dark:border-zinc-800/60 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/20">
      <p className="text-center text-[9px] font-semibold tracking-[0.3em] text-zinc-400 dark:text-zinc-600 uppercase mb-6">
        Replicating work from
      </p>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-50/80 dark:from-zinc-900/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-50/80 dark:from-zinc-900/20 to-transparent z-10 pointer-events-none" />

        <div
          className="flex items-center gap-10 w-max"
          style={{ animation: paused ? 'none' : 'marquee 45s linear infinite' }}
        >
          {items.map((v, i) => (
            <span
              key={i}
              className={`
                text-sm select-none whitespace-nowrap cursor-default
                transition-colors duration-200
                ${v.special
                  ? 'font-serif italic text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  : `${v.weight} text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300`
                }
              `}
            >
              {v.name}
            </span>
          ))}
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
