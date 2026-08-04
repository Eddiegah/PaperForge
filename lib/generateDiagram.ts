import { generate } from './llm';
import { ModelArchitecture } from '@/types';

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

  const prompt = `Generate a Mermaid.js flowchart diagram for this ML model architecture.

Paper: ${paperTitle}
Model: ${architecture.name.value}
Type: ${architecture.type.value}
Description: ${architecture.description.value}
Layers: ${JSON.stringify(architecture.layers.value)}

Generate ONLY valid Mermaid.js flowchart TD syntax.
Rules:
- Use flowchart TD direction
- Keep node labels under 40 chars
- Show main data flow from input to output
- Return ONLY the Mermaid code, no explanation, no code fences

Example:
flowchart TD
    Input[Input Tokens] --> Embed[Token Embedding]
    Embed --> Trans[Transformer Blocks]
    Trans --> Pool[Pooling]
    Pool --> Out[Output]`;

  try {
    const text = await generate({ prompt, maxTokens: 512, temperature: 0.1 });
    const cleaned = text.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
    return cleaned || buildFallbackDiagram(paperTitle);
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
