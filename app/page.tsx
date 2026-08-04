import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PaperForgeLogo } from '@/components/Logo';
import LandingUpload from '@/components/LandingUpload';
import VenueMarquee from '@/components/VenueMarquee';
import HowItWorks from '@/components/HowItWorks';
import DashboardPreview from '@/components/DashboardPreview';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import AnimatedHero from '@/components/AnimatedHero';
import { BarChart3, AlertTriangle, Code2, GitBranch, GitBranchPlus, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      <Navbar />
      <AnimatedHero />
      <VenueMarquee />
      <HowItWorks />
      <DashboardPreview />
      <FeaturesSection />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      Icon: BarChart3,
      title: 'Replication Difficulty Score',
      desc: 'A 1-10 score computed from per-field confidence - not a guess. Tells you exactly how clear the paper is.',
      accent: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/8 dark:to-violet-500/8',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      iconColor: 'text-indigo-500',
      highlight: true,
    },
    {
      Icon: AlertTriangle,
      title: 'Per-field ambiguity flags',
      desc: 'Every field shows high/medium/low/missing confidence with a specific reason.',
      accent: '', border: 'border-zinc-100 dark:border-zinc-800', iconColor: 'text-amber-500',
    },
    {
      Icon: Code2,
      title: 'Annotated starter code',
      desc: 'model.py, train.py, data_loader.py with inline comments on every inferred value.',
      accent: '', border: 'border-zinc-100 dark:border-zinc-800', iconColor: 'text-blue-500',
    },
    {
      Icon: GitBranch,
      title: 'Architecture diagram',
      desc: 'Auto-generated flowchart of the model architecture. Estimated nodes clearly labeled.',
      accent: '', border: 'border-zinc-100 dark:border-zinc-800', iconColor: 'text-violet-500',
    },
    {
      Icon: GitBranchPlus,
      title: 'One-click GitHub export',
      desc: 'Sign in with GitHub and push the generated repo instantly - no manual token needed.',
      accent: '', border: 'border-zinc-100 dark:border-zinc-800', iconColor: 'text-emerald-500',
    },
    {
      Icon: Target,
      title: 'Honest scope',
      desc: 'Designed for standard ML/AI papers. Unusual formats get lower confidence scores - correct behavior.',
      accent: '', border: 'border-zinc-100 dark:border-zinc-800', iconColor: 'text-rose-500',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
            What you actually get
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            No smoke. No magic. A strong scaffold and a clear list of what to verify.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group p-5 rounded-2xl border transition-all duration-200 cursor-default
                hover:-translate-y-1 hover:shadow-md
                ${f.highlight
                  ? `bg-gradient-to-br ${f.accent} ${f.border}`
                  : `bg-white dark:bg-zinc-900 ${f.border} hover:border-indigo-200 dark:hover:border-indigo-800/60`
                }`}
            >
              <div className={`mb-3 ${f.iconColor}`}>
                <f.Icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 text-sm sm:text-base">
                {f.title}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Try it on a paper you know
        </h2>
        <p className="text-indigo-100 mb-8 leading-relaxed text-sm sm:text-base">
          The best test is a paper in your own area. Judge whether the difficulty score
          correctly flags what was actually ambiguous.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-600
            font-bold rounded-2xl hover:bg-indigo-50 transition-all duration-150
            shadow-xl shadow-indigo-900/30 text-sm"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800 py-10 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <PaperForgeLogo size={20} />
          <span>PaperForge</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <a href="#how-it-works" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">How it works</a>
          <a href="#features"     className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Features</a>
          <a href="#pricing"      className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Pricing</a>
          <a href="#faq"          className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">FAQ</a>
          <Link href="/auth/signin" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
