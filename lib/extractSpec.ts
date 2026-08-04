import { generate } from './llm';
import { TechnicalSpec, PaperMetadata } from '@/types';

// Compact prompt — shorter output = less truncation risk on Groq
const EXTRACTION_PROMPT = `Extract technical specs from this ML paper. Return ONLY valid JSON, no explanation.

Use confidence: "high" (explicitly stated), "medium" (inferred), "low" (guessed), "missing" (absent).

JSON structure:
{"metadata":{"title":"","authors":[],"abstract":""},"modelArchitecture":{"name":{"value":"","confidence":{"value":"high","reasoning":""}},"type":{"value":"","confidence":{"value":"high","reasoning":""}},"layers":{"value":[],"confidence":{"value":"high","reasoning":""}},"parameters":{"value":{},"confidence":{"value":"high","reasoning":""}},"description":{"value":"","confidence":{"value":"high","reasoning":""}}},"dataset":{"name":{"value":"","confidence":{"value":"high","reasoning":""}},"description":{"value":"","confidence":{"value":"high","reasoning":""}},"size":{"value":"","confidence":{"value":"high","reasoning":""}},"preprocessing":{"value":"","confidence":{"value":"high","reasoning":""}},"splits":{"value":{},"confidence":{"value":"high","reasoning":""}}},"trainingRecipe":{"optimizer":{"value":"","confidence":{"value":"high","reasoning":""}},"learningRate":{"value":"","confidence":{"value":"high","reasoning":""}},"batchSize":{"value":0,"confidence":{"value":"high","reasoning":""}},"epochs":{"value":0,"confidence":{"value":"high","reasoning":""}},"lossFunction":{"value":"","confidence":{"value":"high","reasoning":""}},"regularization":{"value":"","confidence":{"value":"high","reasoning":""}},"schedulers":{"value":[],"confidence":{"value":"high","reasoning":""}}},"evaluationMetrics":{"primary":{"value":"","confidence":{"value":"high","reasoning":""}},"secondary":{"value":[],"confidence":{"value":"high","reasoning":""}},"benchmarks":{"value":[],"confidence":{"value":"high","reasoning":""}},"results":{"value":{},"confidence":{"value":"high","reasoning":""}}}}

Rules:
- Never fabricate. Use "missing" for absent fields.
- Keep reasoning strings SHORT (under 20 words).
- Return ONLY the JSON object.`;

function makeEmptyField(reasoning = 'Not found in paper'): any {
  return { value: '', confidence: { value: 'missing', reasoning } };
}

function makeEmptySpec(): TechnicalSpec {
  return {
    modelArchitecture: {
      name: makeEmptyField(),
      type: makeEmptyField(),
      layers: { value: [], confidence: { value: 'missing', reasoning: 'Not found' } },
      parameters: { value: {}, confidence: { value: 'missing', reasoning: 'Not found' } },
      description: makeEmptyField(),
    },
    dataset: {
      name: makeEmptyField(),
      description: makeEmptyField(),
      size: makeEmptyField(),
      preprocessing: makeEmptyField(),
      splits: { value: {}, confidence: { value: 'missing', reasoning: 'Not found' } },
    },
    trainingRecipe: {
      optimizer: makeEmptyField(),
      learningRate: makeEmptyField(),
      batchSize: { value: 0, confidence: { value: 'missing', reasoning: 'Not found' } },
      epochs: { value: 0, confidence: { value: 'missing', reasoning: 'Not found' } },
      lossFunction: makeEmptyField(),
      regularization: makeEmptyField(),
      schedulers: { value: [], confidence: { value: 'missing', reasoning: 'Not found' } },
    },
    evaluationMetrics: {
      primary: makeEmptyField(),
      secondary: { value: [], confidence: { value: 'missing', reasoning: 'Not found' } },
      benchmarks: { value: [], confidence: { value: 'missing', reasoning: 'Not found' } },
      results: { value: {}, confidence: { value: 'missing', reasoning: 'Not found' } },
    },
  };
}

function safeParseJson(text: string): any | null {
  // Strip code fences
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Try direct parse
  try { return JSON.parse(cleaned); } catch {}

  // Find the JSON object boundaries
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  cleaned = cleaned.slice(start);

  // Try progressively closing the JSON
  for (let closes = 0; closes <= 10; closes++) {
    const attempt = cleaned + '}'.repeat(closes);
    try { return JSON.parse(attempt); } catch {}
  }

  // Last resort: extract just metadata if available
  const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
  const abstractMatch = cleaned.match(/"abstract"\s*:\s*"([^"]+)"/);
  if (titleMatch) {
    return {
      metadata: {
        title: titleMatch[1],
        authors: [],
        abstract: abstractMatch?.[1] || '',
      },
      modelArchitecture: null,
      dataset: null,
      trainingRecipe: null,
      evaluationMetrics: null,
    };
  }

  return null;
}

export async function extractTechnicalSpec(rawText: string): Promise<{
  metadata: PaperMetadata;
  technicalSpec: TechnicalSpec;
}> {
  // Use first 30k chars — enough for most papers, fits in Groq context
  const truncated = rawText.length > 30000 ? rawText.slice(0, 30000) : rawText;

  const text = await generate({
    prompt: `${EXTRACTION_PROMPT}\n\nPAPER:\n${truncated}`,
    maxTokens: 6000,
    temperature: 0.1,
  });

  const parsed = safeParseJson(text);

  if (!parsed) {
    throw new Error(
      'Could not extract structured data from this paper. The paper may use an unusual format. Try a different paper or the arXiv ID directly.'
    );
  }

  const metadata: PaperMetadata = {
    title: parsed.metadata?.title || 'Unknown Title',
    authors: parsed.metadata?.authors || [],
    abstract: parsed.metadata?.abstract || '',
  };

  // Merge parsed fields with empty defaults so missing fields don't crash
  const empty = makeEmptySpec();
  const technicalSpec: TechnicalSpec = {
    modelArchitecture: { ...empty.modelArchitecture, ...(parsed.modelArchitecture || {}) },
    dataset: { ...empty.dataset, ...(parsed.dataset || {}) },
    trainingRecipe: { ...empty.trainingRecipe, ...(parsed.trainingRecipe || {}) },
    evaluationMetrics: { ...empty.evaluationMetrics, ...(parsed.evaluationMetrics || {}) },
  };

  return { metadata, technicalSpec };
}
