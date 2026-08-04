/**
 * Technical specification extraction using the Anthropic Claude API.
 *
 * CRITICAL DESIGN DECISION:
 * For each extracted field, Claude is explicitly asked to rate its own confidence
 * (high/medium/low/missing) with a reason. This per-field signal is what makes the
 * Replication Difficulty Score genuinely grounded rather than an arbitrary LLM guess.
 *
 * Honest scope: This works well for standard ML/AI papers with conventional structure.
 * Non-standard formats, unusual notations, or heavily diagram-dependent architectures
 * will yield lower confidence scores, which is the correct honest behavior.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TechnicalSpec, PaperMetadata } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EXTRACTION_PROMPT = `You are an expert ML researcher extracting technical specifications from a research paper for the purpose of code reproduction.

Your task is to extract structured information from the provided paper text and, critically, assess your own confidence for each extracted field.

Confidence levels:
- "high": The paper explicitly and clearly states this value — you can quote it directly.
- "medium": The paper implies or suggests this, or it can be reasonably inferred from context, but it's not explicitly stated.
- "low": This is a guess or analogy from related work; the paper is genuinely ambiguous here.
- "missing": This information is simply not present in the paper.

Extract the following and return ONLY valid JSON matching the exact structure shown below.

{
  "metadata": {
    "title": "...",
    "authors": ["..."],
    "abstract": "..."
  },
  "modelArchitecture": {
    "name": { "value": "...", "confidence": { "value": "high|medium|low|missing", "reasoning": "..." }, "sourceSection": "..." },
    "type": { "value": "...", "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "layers": { "value": ["layer1", "layer2"], "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
    "parameters": { "value": { "hidden_dim": "...", "num_heads": "...", "num_layers": "..." }, "confidence": { "value": "...", "reasoning": "..." }, "sourceSection": "..." },
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
- Never fabricate values. If a field is missing or ambiguous, set confidence to "low" or "missing" and state this in the reasoning.
- The reasoning strings are displayed directly to researchers — write them as clear, honest explanations.
- For missing numeric fields like batchSize and epochs, use 0 as the value placeholder.
- Return ONLY the JSON object, no other text.`;

export async function extractTechnicalSpec(rawText: string): Promise<{
  metadata: PaperMetadata;
  technicalSpec: TechnicalSpec;
}> {
  // Truncate to avoid token limits (~60k chars ≈ ~15k tokens, well within 200k context)
  const truncatedText = rawText.length > 60000 ? rawText.slice(0, 60000) : rawText;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${EXTRACTION_PROMPT}\n\n---PAPER TEXT START---\n${truncatedText}\n---PAPER TEXT END---`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse the JSON response
  let parsed: any;
  try {
    // Strip any accidental markdown code fences
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Failed to parse extraction response as JSON. Claude may have returned unexpected output. Raw: ${content.text.slice(0, 500)}`
    );
  }

  const metadata: PaperMetadata = {
    title: parsed.metadata?.title || 'Unknown Title',
    authors: parsed.metadata?.authors || [],
    abstract: parsed.metadata?.abstract || '',
  };

  // The parsed object should match TechnicalSpec shape directly
  const technicalSpec: TechnicalSpec = {
    modelArchitecture: parsed.modelArchitecture,
    dataset: parsed.dataset,
    trainingRecipe: parsed.trainingRecipe,
    evaluationMetrics: parsed.evaluationMetrics,
  };

  return { metadata, technicalSpec };
}
