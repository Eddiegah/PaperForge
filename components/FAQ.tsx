'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Is the generated code guaranteed to reproduce the paper?',
    a: 'No — and we say so clearly. The generated code is an honest, annotated starting scaffold. Current LLM-based paper-to-code approaches achieve roughly 35–40% end-to-end accuracy. The Replication Difficulty Score and # NOTE comments exist specifically to flag where the code makes assumptions, so you know exactly what to verify before trusting the output.',
  },
  {
    q: 'What is the Replication Difficulty Score?',
    a: 'It\'s a 1–10 score computed from real signals — the proportion of extracted fields that the paper stated explicitly (high confidence) vs. those that are ambiguous, inferred, or missing. It is not an LLM guess. A score of 1–3 means the paper is exceptionally clear. A score of 7–10 means significant manual verification will be needed.',
  },
  {
    q: 'What types of papers work best?',
    a: 'Standard ML/AI papers with a conventional structure — methodology, datasets, training details, evaluation results. Papers from NeurIPS, ICML, ICLR, CVPR, ACL and similar venues tend to extract well. Highly unconventional formats, non-ML domains, or papers that rely entirely on diagrams will get lower confidence scores — which is the correct honest behavior.',
  },
  {
    q: 'Can I use arXiv links?',
    a: 'Yes. Paste any arXiv ID (e.g. 1706.03762) or full arXiv URL (e.g. https://arxiv.org/abs/1706.03762). PaperForge fetches the PDF directly from arXiv\'s public API — no download needed.',
  },
  {
    q: 'What does "Push to GitHub" do?',
    a: 'If you signed in with GitHub, PaperForge uses your GitHub OAuth token to create a new repository under your account and push all generated files (model.py, train.py, data_loader.py, README.md, requirements.txt) in one click. No personal access token needed.',
  },
  {
    q: 'What AI model powers the extraction?',
    a: 'PaperForge uses Claude (Anthropic) for all extraction and code generation tasks. Extraction uses Claude Opus for maximum accuracy. Diagram generation uses Claude Haiku for speed.',
  },
  {
    q: 'How long does extraction take?',
    a: 'Typically 30–90 seconds for a standard paper. The page shows real progress states reflecting genuinely completed steps — not decorative fake progress. You can safely leave the tab open while it runs.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'Payments are processed by Paystack, which supports Visa/Mastercard, mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money), and bank transfer — making it accessible across Ghana and the rest of West Africa.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel at any time from your account settings. You keep access until the end of your billing period. No lock-in, no cancellation fees.',
  },
  {
    q: 'Is my paper data stored?',
    a: 'Paper text is sent to Claude for extraction and not stored permanently on our servers beyond the duration of your session. Generated code and analysis results are stored per-job in memory and linked to your account history.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${isOpen ? 'bg-zinc-50/80 dark:bg-zinc-900/50' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
      >
        <span className={`font-medium text-sm sm:text-base transition-colors ${
          isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white'
        }`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
        }`}>
          {isOpen ? <Minus size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-3">
            Questions, answered
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Everything you need to know about PaperForge.
          </p>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
        >
          {faqs.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 mt-8">
          Still have questions?{' '}
          <a
            href="mailto:support@paperforge.app"
            className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hover:underline"
          >
            Email us →
          </a>
        </p>
      </div>
    </section>
  );
}
