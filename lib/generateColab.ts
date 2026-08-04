/**
 * Converts GeneratedCode + paper metadata into a Jupyter notebook (.ipynb) JSON.
 */

import { GeneratedCode, PaperMetadata, DifficultyScore } from '@/types';

interface NotebookCell {
  cell_type: 'markdown' | 'code';
  id: string;
  metadata: Record<string, unknown>;
  source: string[];
  outputs?: unknown[];
  execution_count?: number | null;
}

function markdownCell(id: string, lines: string[]): NotebookCell {
  return {
    cell_type: 'markdown',
    id,
    metadata: {},
    source: lines.map((l, i) => (i < lines.length - 1 ? l + '\n' : l)),
  };
}

function codeCell(id: string, lines: string[]): NotebookCell {
  return {
    cell_type: 'code',
    id,
    metadata: {},
    execution_count: null,
    outputs: [],
    source: lines.map((l, i) => (i < lines.length - 1 ? l + '\n' : l)),
  };
}

export function generateColab(
  code: GeneratedCode,
  metadata: PaperMetadata,
  difficulty?: DifficultyScore
): object {
  const cells: NotebookCell[] = [];

  // ── Cell 1: Paper header ─────────────────────────────────────────────────
  const authors = metadata.authors?.join(', ') || 'Unknown Authors';
  const abstract = metadata.abstract || 'No abstract available.';
  const scoreText = difficulty ? `**Difficulty Score:** ${difficulty.score}/10` : '';
  const arxivLink = metadata.arxivId
    ? `\n\n[View on arXiv](https://arxiv.org/abs/${metadata.arxivId})`
    : '';

  cells.push(
    markdownCell('cell-header', [
      `# ${metadata.title || 'Research Paper Scaffold'}`,
      '',
      `**Authors:** ${authors}`,
      '',
      ...(scoreText ? [scoreText, ''] : []),
      '## Abstract',
      '',
      abstract,
      ...(arxivLink ? [arxivLink] : []),
    ])
  );

  // ── Cell 2: Ambiguous fields that need verification ───────────────────────
  const ambiguous = difficulty?.ambiguousFields ?? [];
  if (ambiguous.length > 0) {
    const rows = ambiguous.map(
      (f) =>
        `| ${f.fieldName} | ${f.confidence} | ${f.issue} | ${f.recommendation} |`
    );
    cells.push(
      markdownCell('cell-ambiguous', [
        '## ⚠️ Fields Requiring Verification',
        '',
        'The following fields were extracted with low confidence or are missing from the paper.',
        'Please verify them before running experiments.',
        '',
        '| Field | Confidence | Issue | Recommendation |',
        '|-------|-----------|-------|----------------|',
        ...rows,
      ])
    );
  } else {
    cells.push(
      markdownCell('cell-ambiguous', [
        '## ✅ Fields Verification',
        '',
        'All fields were extracted with high confidence. No manual verification required.',
      ])
    );
  }

  // ── Cell 3: pip install ───────────────────────────────────────────────────
  cells.push(codeCell('cell-pip', ['!pip install -r requirements.txt']));

  // ── Cell 4+: One code cell per .py / known file ───────────────────────────
  const pyFiles = code.files.filter((f) => f.path.endsWith('.py'));
  const otherFiles = code.files.filter((f) => !f.path.endsWith('.py'));

  // requirements.txt / other text files as markdown
  for (const f of otherFiles) {
    if (f.path === 'requirements.txt') {
      cells.push(
        markdownCell(`cell-${f.path.replace(/\W/g, '_')}`, [
          `### \`${f.path}\``,
          '',
          '```',
          ...f.content.split('\n'),
          '```',
        ])
      );
    }
  }

  // Python files as code cells
  for (const f of pyFiles) {
    cells.push(
      markdownCell(`cell-md-${f.path.replace(/\W/g, '_')}`, [`### \`${f.path}\``])
    );
    cells.push(
      codeCell(
        `cell-code-${f.path.replace(/\W/g, '_')}`,
        f.content.split('\n')
      )
    );
  }

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3',
      },
      language_info: {
        name: 'python',
        version: '3.10.0',
      },
      paperforge: {
        title: metadata.title,
        arxivId: metadata.arxivId,
        generatedAt: new Date().toISOString(),
        difficultyScore: difficulty?.score,
      },
    },
    cells,
  };
}
