'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UsageBar() {
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => setUsage(d))
      .catch(() => {});
  }, []);

  if (!usage) return null;

  const pct = Math.min((usage.used / usage.limit) * 100, 100);
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-500';
  const textColor = pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400';

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Monthly usage</span>
        <span className={`text-xs font-bold ${textColor}`}>{usage.used}/{usage.limit}</span>
      </div>
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {pct >= 100 && (
        <p className="text-xs text-red-500 mt-2">
          Limit reached.{' '}
          <Link href="/#pricing" className="underline font-medium">Upgrade to Pro</Link>
          {' '}for unlimited analyses.
        </p>
      )}
      {pct < 100 && pct >= 80 && (
        <p className="text-xs text-amber-500 mt-2">
          Almost at limit.{' '}
          <Link href="/#pricing" className="underline font-medium">Upgrade to Pro</Link>
          {' '}for unlimited.
        </p>
      )}
    </div>
  );
}
