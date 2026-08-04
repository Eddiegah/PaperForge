/**
 * Architecture diagram generator.
 * Converts extracted model architecture details into a Mermaid.js flowchart.
 * Uses the LLM to produce the diagram when architecture details are rich enough.
 */

import Anthropic from '@anthropic-ai/sdk';
import { ModelArchitecture } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a Mermaid.js flowchart from extracted architecture details.
 * Returns valid Mermaid syntax that can be rendered client-side.
 */
export async function generateMermaidDiagram(
  paperTitle: string,
  architecture: ModelArchitecture,
  rawText: string
): Promise<string> {
  // If the architecture confidence is too low, return a minimal placeholder
  if (
    architecture.type.confidence.value === 'missing' &&
    architecture.description.confidence.value === 'missing'
  ) {
    return buildFallbackDiagram(paperTitle);
  }

  const architectureContext = `
    Model Name: ${architecture.name.value}
    Type: ${architecture.type.value}
    Layers: ${JSON.stringify(architecture.layers.value)}
    Description: ${architecture.description.value}
  `;

  const prompt = `You are generating a Mermaid.js flowchart diagram for a ML research paper architecture.

Paper Title: ${paperTitle}
Architecture Details: ${architectureContext}

Generate ONLY valid Mermaid.js flowchart syntax (TD direction) representing the model architecture.
Rules:
- Use flowchart TD syntax
- Keep node labels concise (under 40 chars)
- Use meaningful node IDs (no spaces)
- Represent the main data flow from input through key components to output
- If architecture details are vague, create a reasonable high-level diagram with clearly labeled "Estimated" components
- Do NOT include any explanation, just the Mermaid code block content (no \`\`\`mermaid wrapper)

Example format:
flowchart TD
    Input[Input Tokens] --> Embed[Token Embedding]
    Embed --> Transformer[Transformer Blocks x N]
    Transformer --> Pool[Pooling Layer]
    Pool --> Output[Classification Head]`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Strip any accidental code fences
      const mermaid = content.text
        .replace(/```mermaid\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return mermaid;
    }
  } catch (error) {
    console.error('Diagram generation failed:', error);
  }

  return buildFallbackDiagram(paperTitle);
}

function buildFallbackDiagram(paperTitle: string): string {
  return `flowchart TD
    Input[Input Data] --> Preprocess[Preprocessing]
    Preprocess --> Model["Model\\n(architecture unclear from paper)"]
    Model --> Output[Output / Predictions]
    style Model fill:#fbbf24,stroke:#d97706,color:#1f2937`;
}
