import { generate } from './llm';
import { TechnicalSpec, PaperMetadata } from '@/types';

const EXTRACTION_PROMPT = `You are an expert ML researcher extracting technical specifications from a research paper for code reproduction.

Extract structured information and assess your confidence for each field.

Confidence levels:
- "high": Explicitly and clearly stated in the paper
- "medium": Implied or reasonably inferred, not explicit
- "low": Ambiguous guess from context
- "missing": Not present in the paper

Return ONLY valid JSON matching this exact structure:

{
  "metadata": {
    "title": "...",
    "authors": ["..."],
    "abstract": "..."
  },
  "modelArchitecture": {
    "name": { "value": "...", "confidence": { "value": "high|medium|low|missing", "reasoning": "..." }, "sourceSection": "..." },
    "type": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "layers": { "value": ["layer1"], "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "parameters": { "value": { "hidden_dim": "...", "num_heads": "..." }, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "description": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." }
  },
  "dataset": {
    "name": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "description": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "size": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "preprocessing": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "splits": { "value": { "train": "...", "val": "...", "test": "..." }, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." }
  },
  "trainingRecipe": {
    "optimizer": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "learningRate": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "batchSize": { "value": 0, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "epochs": { "value": 0, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "lossFunction": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "regularization": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "schedulers": { "value": [], "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." }
  },
  "evaluationMetrics": {
    "primary": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "secondary": { "value": [], "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "benchmarks": { "value": [], "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "results": { "value": {}, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." }
  }
}

IMPORTANT: Never fabricate values. Use "missing" for absent fields. Return ONLY the JSON object.`;

export async function extractTechnicalSpec(rawText: string): Promise<{
  metadata: PaperMetadata;
  technicalSpec: TechnicalSpec;
}> {
  const truncated = rawText.length > 40000 ? rawText.slice(0, 40000) : rawText;

  const text = await generate({
    prompt: `${EXTRACTION_PROMPT}\n\n---PAPER TEXT START---\n${truncated}\n---PAPER TEXT END---`,
    maxTokens: 8192,
    temperature: 0.1,
  });

  let parsed: any;
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Try full parse first
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // If truncated, try to close the JSON and parse what we have
      const recovered = cleaned
        .replace(/,\s*$/, '')  // remove trailing comma
        .replace(/"\s*$/, '"') // close open string
        + '}}}}';              // close nested objects
      try {
        parsed = JSON.parse(recovered);
      } catch {
        throw new Error(`Response truncated or malformed. The paper may be too long. Try a shorter paper or arXiv ID. Raw snippet: ${text.slice(0, 200)}`);
      }
    }
  } catch (e) {
    throw e instanceof Error ? e : new Error(`Parse failed: ${text.slice(0, 200)}`);
  }

  const metadata: PaperMetadata = {
    title: parsed.metadata?.title || 'Unknown Title',
    authors: parsed.metadata?.authors || [],
    abstract: parsed.metadata?.abstract || '',
  };

  const technicalSpec: TechnicalSpec = {
    modelArchitecture: parsed.modelArchitecture,
    dataset: parsed.dataset,
    trainingRecipe: parsed.trainingRecipe,
    evaluationMetrics: parsed.evaluationMetrics,
  };

  return { metadata, technicalSpec };
}
