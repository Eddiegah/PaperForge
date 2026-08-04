/**
 * Code generation for research paper reproduction.
 *
 * Generates a structured starter repository with honest ambiguity annotations.
 * Every place where an ambiguous or inferred value was used gets a clear
 * # NOTE comment explaining what's uncertain and why — this is the honest-by-design
 * product mechanic, not just marketing copy.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TechnicalSpec, PaperMetadata, DifficultyScore, GeneratedCode } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildCodePrompt(
  metadata: PaperMetadata,
  spec: TechnicalSpec,
  score: DifficultyScore
): string {
  const ambiguityNotes = score.ambiguousFields
    .map((f) => `- ${f.fieldName}: ${f.issue}`)
    .join('\n');

  const trainingLR = spec.trainingRecipe.learningRate;
  const lrNote =
    trainingLR.confidence.value !== 'high'
      ? `# NOTE: Learning rate not explicitly stated in paper — using ${trainingLR.value || '1e-4'} as inferred default. Verify against paper's results. Reason: ${trainingLR.confidence.reasoning}`
      : '';

  const batchSize = spec.trainingRecipe.batchSize;
  const bsNote =
    batchSize.confidence.value !== 'high'
      ? `# NOTE: Batch size not explicitly stated — using ${batchSize.value || 32} as inferred default. ${batchSize.confidence.reasoning}`
      : '';

  return `You are generating a research paper reproduction starter repository.

Paper: "${metadata.title}"
Authors: ${metadata.authors.join(', ')}

Technical Spec (extracted from paper):
${JSON.stringify(spec, null, 2)}

Ambiguous fields (require human verification):
${ambiguityNotes || 'None identified — high confidence on most fields.'}

Replication Difficulty Score: ${score.score}/10
${score.overallAssessment}

Generate a Python starter repository with EXACTLY these 5 files.
For each file, use the format:
===FILE: filename.py===
<file contents>
===END===

Files to generate:
1. model.py - Model architecture implementation
2. train.py - Training loop
3. data_loader.py - Dataset loading and preprocessing
4. requirements.txt - Python dependencies
5. NOTES.md - Honest summary of ambiguities (NOT a full README, just the uncertainty notes)

CRITICAL REQUIREMENTS for the Python code:
- Add clear # NOTE comments wherever an ambiguous or inferred value is used
- Example: # NOTE: learning rate not explicitly stated in paper; using 1e-4 as reasonable default — verify against paper results
- If a value is completely unknown, use a sensible placeholder with a # TODO: comment
- Do NOT pretend ambiguous values are certain — the honest flagging is the whole point
- Use standard PyTorch conventions
- Keep the code clean, readable, and well-commented
- Include type hints where natural
- The code should be genuinely runnable as a starting point (not just pseudocode)

For ambiguous architecture fields: add # INFERRED or # ESTIMATED comments
For missing training details: use reasonable ML defaults with clear # NOTE explanations
For unknown dataset details: create a clear template with # TODO markers`;
}

export async function generateRepoCode(
  metadata: PaperMetadata,
  spec: TechnicalSpec,
  score: DifficultyScore
): Promise<GeneratedCode> {
  const prompt = buildCodePrompt(metadata, spec, score);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response from code generation');
  }

  const files = parseGeneratedFiles(content.text);

  // Always add a repository README (comprehensive)
  const readmeContent = generateReadme(metadata, spec, score);
  files.push({
    path: 'README.md',
    content: readmeContent,
    language: 'markdown',
  });

  return { files };
}

function parseGeneratedFiles(
  raw: string
): { path: string; content: string; language: string }[] {
  const files: { path: string; content: string; language: string }[] = [];
  const regex = /===FILE: ([^\n]+)===\n([\s\S]*?)===END===/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    const [, filename, content] = match;
    files.push({
      path: filename.trim(),
      content: content.trim(),
      language: getLanguage(filename.trim()),
    });
  }

  // Fallback: if parsing failed, return the raw response as a single file
  if (files.length === 0) {
    files.push({
      path: 'generated_code.py',
      content: raw,
      language: 'python',
    });
  }

  return files;
}

function getLanguage(filename: string): string {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.md')) return 'markdown';
  if (filename.endsWith('.txt')) return 'text';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml';
  return 'text';
}

function generateReadme(
  metadata: PaperMetadata,
  spec: TechnicalSpec,
  score: DifficultyScore
): string {
  const ambiguityList = score.ambiguousFields
    .map((f) => `- **${f.fieldName}** (${f.confidence} confidence): ${f.issue}\n  → *${f.recommendation}*`)
    .join('\n');

  return `# ${metadata.title}

> **Generated by PaperForge** — an honest research-paper-to-code scaffold.
>
> **Important:** This code is a starting scaffold, not a verified reproduction. It accelerates
> the reproduction process by extracting what's clear and explicitly flagging what's ambiguous.
> Current LLM-based paper-to-code approaches achieve roughly 35-40% end-to-end accuracy at best;
> semantic errors (code that runs but implements something subtly wrong) are the most common failure mode.
> Treat this as a strong, annotated starting point — not a finished implementation.

## Paper Details

**Authors:** ${metadata.authors.join(', ')}

### Abstract
${metadata.abstract}

---

## Replication Difficulty Score: ${score.score}/10

${score.overallAssessment}

### Score Breakdown

| Category | Clarity Score |
|----------|--------------|
| Model Architecture | ${Math.round(score.breakdown.modelClarityScore * 100)}% |
| Dataset | ${Math.round(score.breakdown.dataClarityScore * 100)}% |
| Training Recipe | ${Math.round(score.breakdown.trainingClarityScore * 100)}% |
| Evaluation | ${Math.round(score.breakdown.evaluationClarityScore * 100)}% |

---

## ⚠️ Ambiguous Fields — Verify Before Relying on This Code

The following fields could not be extracted with high confidence from the paper.
**Review each before trusting the generated code for accurate replication:**

${ambiguityList || '_No significant ambiguities detected — most fields extracted with high confidence._'}

---

## Setup

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`bash
# Training
python train.py

# Evaluation (after training)
python train.py --eval-only
\`\`\`

---

## How PaperForge Compares to the State of the Art

Paper-to-code generation is a genuinely hard, actively-researched problem. Current
state-of-the-art LLM approaches achieve roughly 35-40% end-to-end accuracy. Semantic
errors — code that runs but implements something subtly different from the paper — are
harder to catch than syntactic ones. This tool's honest ambiguity flagging (the Replication
Difficulty Score and inline \`# NOTE\` comments) is designed specifically to surface those
semantic gaps rather than paper over them.

---

*Generated with PaperForge. Always verify the flagged ambiguities against the original paper.*
`;
}
