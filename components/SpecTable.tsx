'use client';

import { TechnicalSpec, ExtractedField } from '@/types';

interface Props { spec: TechnicalSpec; }

const chip: Record<string, string> = {
  high:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  medium:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  low:     'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  missing: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
};

function FieldRow({ label, field }: { label: string; field: ExtractedField<any> }) {
  const val = (() => {
    if (field.confidence.value === 'missing') return '—';
    if (Array.isArray(field.value)) return field.value.join(', ') || '—';
    if (typeof field.value === 'object' && field.value !== null)
      return Object.entries(field.value).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    return String(field.value) || '—';
  })();

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 w-44 align-top">{label}</td>
      <td className="py-3 px-4 text-sm text-zinc-800 dark:text-zinc-200 align-top leading-relaxed">{val}</td>
      <td className="py-3 px-4 w-20 align-top">
        <span className={`text-xs px-1.5 py-0.5 rounded-md border font-medium ${chip[field.confidence.value]}`}>
          {field.confidence.value}
        </span>
      </td>
    </tr>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-1">{title}</h3>
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full"><tbody>{children}</tbody></table>
      </div>
    </div>
  );
}

export default function SpecTable({ spec }: Props) {
  return (
    <div>
      <Section title="Model Architecture">
        <FieldRow label="Name" field={spec.modelArchitecture.name} />
        <FieldRow label="Type" field={spec.modelArchitecture.type} />
        <FieldRow label="Description" field={spec.modelArchitecture.description} />
        <FieldRow label="Layers" field={spec.modelArchitecture.layers} />
        <FieldRow label="Parameters" field={spec.modelArchitecture.parameters} />
      </Section>
      <Section title="Dataset">
        <FieldRow label="Name" field={spec.dataset.name} />
        <FieldRow label="Description" field={spec.dataset.description} />
        <FieldRow label="Size" field={spec.dataset.size} />
        <FieldRow label="Splits" field={spec.dataset.splits} />
        <FieldRow label="Preprocessing" field={spec.dataset.preprocessing} />
      </Section>
      <Section title="Training Recipe">
        <FieldRow label="Optimizer" field={spec.trainingRecipe.optimizer} />
        <FieldRow label="Learning Rate" field={spec.trainingRecipe.learningRate} />
        <FieldRow label="Batch Size" field={spec.trainingRecipe.batchSize} />
        <FieldRow label="Epochs" field={spec.trainingRecipe.epochs} />
        <FieldRow label="Loss Function" field={spec.trainingRecipe.lossFunction} />
        <FieldRow label="Regularization" field={spec.trainingRecipe.regularization} />
        <FieldRow label="Schedulers" field={spec.trainingRecipe.schedulers} />
      </Section>
      <Section title="Evaluation">
        <FieldRow label="Primary Metric" field={spec.evaluationMetrics.primary} />
        <FieldRow label="Secondary" field={spec.evaluationMetrics.secondary} />
        <FieldRow label="Benchmarks" field={spec.evaluationMetrics.benchmarks} />
        <FieldRow label="Results" field={spec.evaluationMetrics.results} />
      </Section>
    </div>
  );
}
