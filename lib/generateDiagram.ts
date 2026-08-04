/**
 * Architecture diagram generation using Google Gemini API (free tier).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelArchitecture } from '@/types';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No LLM API key configured');
  return new GoogleGenerativeAI(apiKey);
}

export async function generateMermaidDiagram(
  paperTitle: string,
  architecture: ModelArchitecture,
  rawText: string
): Promise<string> {
  if (
    architecture.type.confidence.value === 'missing' &&
    architecture.description.confidence.value === 'missing'
  ) {
    return buildFallbackDiagram(paperTitle);
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate a Mermaid.js flowchart diagram for this ML model architecture.

Paper: ${paperTitle}
Model: ${architecture.name.value}
Type: ${architecture.type.value}
Description: ${architecture.description.value}
Layers: ${JSON.stringify(architecture.layers.value)}

Generate ONLY valid Mermaid.js flowchart TD syntax.
Rules:
- Use flowchart TD
- Keep node labels under 40 chars
- Show main data flow from input to output
- If details are vague, label estimated nodes clearly
- Return ONLY the Mermaid code, no explanation, no code fences

Example:
flowchart TD
    Input[Input Tokens] --> Embed[Token Embedding]
    Embed --> Trans[Transformer Blocks]
    Trans --> Pool[Pooling]
    Pool --> Out[Output]`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    });

    const text = result.response.text()
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return text || buildFallbackDiagram(paperTitle);
  } catch {
    return buildFallbackDiagram(paperTitle);
  }
}

function buildFallbackDiagram(paperTitle: string): string {
  return `flowchart TD
    Input[Input Data] --> Preprocess[Preprocessing]
    Preprocess --> Model["Model Architecture\\n(details unclear)"]
    Model --> Output[Output / Predictions]
    style Model fill:#fbbf24,stroke:#d97706,color:#1f2937`;
}
