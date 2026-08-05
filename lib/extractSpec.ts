import { generate } from './llm';
import { TechnicalSpec, PaperMetadata } from '@/types';

// Compact, explicit prompt that works reliably with Groq/Llama
const EXTRACTION_PROMPT = `Extract information from this ML research paper. Return ONLY a JSON object.

Required JSON format (fill every field, use empty string "" or 0 for unknown values):
{
  "title": "paper title",
  "authors": ["author1", "author2"],
  "abstract": "paper abstract",
  "model_name": "model name or architecture name",
  "model_type": "e.g. Transformer, CNN, RNN, or other",
  "model_description": "brief description of the architecture",
  "dataset_name": "dataset name",
  "dataset_size": "e.g. 1M samples",
  "optimizer": "e.g. Adam, SGD",
  "learning_rate": "e.g. 1e-4",
  "batch_size": 32,
  "epochs": 0,
  "loss_function": "e.g. cross-entropy",
  "primary_metric": "e.g. accuracy, F1, BLEU",
  "title_confidence": "high",
  "model_confidence": "high or medium or low or missing",
  "dataset_confidence": "high or medium or low or missing",
  "training_confidence": "high or medium or low or missing",
  "evaluation_confidence": "high or medium or low or missing"
}

Return ONLY the JSON object. No explanation. No markdown.

PAPER:`;

type Confidence = 'high' | 'medium' | 'low' | 'missing';

function makeField(value: any, confidence: string, reasoning: string) {
  const safeConf: Confidence = (['high','medium','low','missing'].includes(confidence)
    ? confidence : 'medium') as Confidence;
  return {
    value,
    confidence: { value: safeConf, reasoning },
    sourceSection: '',
  };
}

function safeArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') return val.split(/,\s*/).filter(Boolean);
  return [String(val)];
}

function safeString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

function safeNumber(val: any): number {
  if (!val) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function extractJson(text: string): any | null {
  // Remove code fences
  let s = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

  // Find first { to last }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }

  // Try direct parse
  try { return JSON.parse(s); } catch {}

  // Try fixing common issues: trailing commas, single quotes
  try {
    const fixed = s
      .replace(/,\s*([}\]])/g, '$1')  // trailing commas
      .replace(/'/g, '"');            // single quotes
    return JSON.parse(fixed);
  } catch {}

  // Try adding closing braces
  for (let i = 1; i <= 5; i++) {
    try { return JSON.parse(s + '}'.repeat(i)); } catch {}
  }

  return null;
}

export async function extractTechnicalSpec(rawText: string): Promise<{
  metadata: PaperMetadata;
  technicalSpec: TechnicalSpec;
}> {
  // Use first 25k chars — enough for abstract + methods section
  const truncated = rawText.slice(0, 25000);

  let parsed: any = null;
  let lastError = '';

  try {
    const text = await generate({
      prompt: `${EXTRACTION_PROMPT}\n${truncated}`,
      maxTokens: 2000,
      temperature: 0.1,
    });

    parsed = extractJson(text);
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
  }

  // If still null, return a minimal valid structure with missing fields
  if (!parsed) {
    console.error('Extraction failed:', lastError);
    // Try to at least get title/abstract from raw text
    const titleMatch = rawText.match(/(?:^|\n)([A-Z][^.\n]{10,100})\n/m);
    parsed = {
      title: titleMatch?.[1]?.trim() || 'Unknown Paper',
      authors: [],
      abstract: rawText.slice(0, 500),
      model_name: '', model_type: '', model_description: '',
      dataset_name: '', dataset_size: '',
      optimizer: '', learning_rate: '', batch_size: 0, epochs: 0, loss_function: '',
      primary_metric: '',
      model_confidence: 'missing', dataset_confidence: 'missing',
      training_confidence: 'missing', evaluation_confidence: 'missing',
    };
  }

  const metadata: PaperMetadata = {
    title: safeString(parsed.title) || 'Unknown Title',
    authors: safeArray(parsed.authors),
    abstract: safeString(parsed.abstract),
  };

  const mc = safeString(parsed.model_confidence) || 'medium';
  const dc = safeString(parsed.dataset_confidence) || 'medium';
  const tc = safeString(parsed.training_confidence) || 'medium';
  const ec = safeString(parsed.evaluation_confidence) || 'medium';

  const technicalSpec: TechnicalSpec = {
    modelArchitecture: {
      name:        makeField(safeString(parsed.model_name), mc, mc === 'missing' ? 'Not found in paper' : 'Extracted from paper'),
      type:        makeField(safeString(parsed.model_type), mc, mc === 'missing' ? 'Not found' : 'Extracted'),
      layers:      makeField([], mc, 'Not individually parsed'),
      parameters:  makeField({}, mc, 'Not individually parsed'),
      description: makeField(safeString(parsed.model_description), mc, 'Extracted'),
    },
    dataset: {
      name:         makeField(safeString(parsed.dataset_name), dc, dc === 'missing' ? 'Not found' : 'Extracted'),
      description:  makeField('', dc, 'Not parsed'),
      size:         makeField(safeString(parsed.dataset_size), dc, 'Extracted'),
      preprocessing:makeField('', dc, 'Not parsed'),
      splits:       makeField({}, dc, 'Not parsed'),
    },
    trainingRecipe: {
      optimizer:      makeField(safeString(parsed.optimizer), tc, tc === 'missing' ? 'Not found' : 'Extracted'),
      learningRate:   makeField(safeString(parsed.learning_rate), tc, 'Extracted'),
      batchSize:      makeField(safeNumber(parsed.batch_size), tc, 'Extracted'),
      epochs:         makeField(safeNumber(parsed.epochs), tc, 'Extracted'),
      lossFunction:   makeField(safeString(parsed.loss_function), tc, 'Extracted'),
      regularization: makeField('', tc, 'Not parsed'),
      schedulers:     makeField([], tc, 'Not parsed'),
    },
    evaluationMetrics: {
      primary:    makeField(safeString(parsed.primary_metric), ec, ec === 'missing' ? 'Not found' : 'Extracted'),
      secondary:  makeField([], ec, 'Not parsed'),
      benchmarks: makeField([], ec, 'Not parsed'),
      results:    makeField({}, ec, 'Not parsed'),
    },
  };

  return { metadata, technicalSpec };
}
