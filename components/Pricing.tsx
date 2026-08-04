'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    tagline: 'Kick the tires on a few papers.',
    price: '$0',
    period: 'forever',
    cta: 'Get started',
    plan: null,
    highlighted: false,
    features: [
      '5 paper analyses / month',
      'Full extraction + difficulty score',
      'Generated starter code',
      'Architecture diagram',
      'Push to GitHub',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For researchers replicating at pace.',
    price: 'GHS 12',
    period: '/ month',
    cta: 'Upgrade to Pro',
    plan: 'pro',
    highlighted: true,
    badge: '✦ Most popular',
    features: [
      'Unlimited paper analyses',
      'Priority extraction queue',
      'Full searchable history',
      'API access',
      'Email support',
    ],
  },
  {
    name: 'Team',
    tagline: 'For labs and teams shipping together.',
    price: 'GHS 39',
    period: '/ month',
    cta: 'Upgrade to Team',
    plan: 'team',
    highlighted: false,
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared workspace history',
      'Higher rate limits',
      'Priority support',
    ],
  },
];

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (plan: string | null) => {
    if (!plan) {
      router.push('/auth/signin');
      return;
    }
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(plan);
    setError(null);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Redirect to Paystack hosted checkout
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">Pricing</p>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
            Start free, scale when you need
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">No credit card required to get started.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: p.highlighted ? -6 : -3, transition: { duration: 0.2 } }}
              className={`relative flex flex-col rounded-2xl p-7 border transition-all ${
                p.highlighted
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-600 shadow-2xl shadow-indigo-500/25 scale-[1.03]'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-700 shadow-sm whitespace-nowrap">
                    {p.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-5">
                <h3 className={`font-bold text-lg mb-0.5 ${p.highlighted ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {p.name}
                </h3>
                <p className={`text-sm ${p.highlighted ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {p.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="mb-7">
                <span className={`text-5xl font-extrabold tracking-tight ${p.highlighted ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {p.price}
                </span>
                <span className={`ml-1.5 text-sm font-medium ${p.highlighted ? 'text-indigo-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {p.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      p.highlighted ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-950/50'
                    }`}>
                      <Check size={10} className={p.highlighted ? 'text-white' : 'text-indigo-500'} />
                    </div>
                    <span className={`text-sm ${p.highlighted ? 'text-indigo-50' : 'text-zinc-600 dark:text-zinc-300'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                onClick={() => handleUpgrade(p.plan)}
                disabled={loading === p.plan}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed ${
                  p.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white hover:shadow-md'
                }`}
              >
                {loading === p.plan ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Redirecting...
                  </>
                ) : p.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-8">
          Payments processed securely by{' '}
          <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
            Paystack
          </a>
          . Supports card, mobile money (MTN, Vodafone, AirtelTigo), and bank transfer.
        </p>
      </div>
    </section>
  );
}
