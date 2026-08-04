/**
 * Technical specification extraction using Google Gemini API (free tier).
 * Gemini 2.0 Flash handles up to 1M tokens — perfect for long papers.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechnicalSpec, PaperMetadata } from '@/types';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No LLM API key configured (GEMINI_API_KEY)');
  return new GoogleGenerativeAI(apiKey);
}

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

IMPORTANT:
- Never fabricate values. Use "missing" confidence for absent fields.
- Reasoning strings are shown to researchers - be specific and honest.
- Return ONLY the JSON object, no markdown, no explanation.`;

export async function extractTechnicalSpec(rawText: string): Promise<{
  metadata: PaperMetadata;
  technicalSpec: TechnicalSpec;
}> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const truncated = rawText.length > 80000 ? rawText.slice(0, 80000) : rawText;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: `${EXTRACTION_PROMPT}\n\n---PAPER TEXT START---\n${truncated}\n---PAPER TEXT END---` }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  });

  const text = result.response.text();

  let parsed: any;
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Gemini extraction response. Raw: ${text.slice(0, 300)}`);
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
