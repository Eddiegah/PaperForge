/**
 * Paper ingestion utilities.
 * Handles PDF text extraction and arXiv paper fetching.
 *
 * PDF library: unpdf (modern, actively-maintained successor to pdf-parse,
 * works across all JS runtimes including Vercel serverless).
 */

import { extractText } from 'unpdf';

const MAX_PDF_SIZE_BYTES = 32 * 1024 * 1024; // 32MB

/**
 * Extract raw text from a PDF buffer using unpdf.
 * Returns the concatenated text content of all pages.
 */
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  if (buffer.byteLength > MAX_PDF_SIZE_BYTES) {
    throw new Error(`PDF exceeds maximum size limit of 32MB (got ${Math.round(buffer.byteLength / 1024 / 1024)}MB)`);
  }

  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });

  if (!text || text.trim().length < 100) {
    throw new Error(
      'PDF text extraction yielded very little content. The PDF may be scanned (image-only), encrypted, or in an unsupported format. PaperForge requires a text-searchable PDF.'
    );
  }

  return text;
}

/**
 * Normalize various arXiv URL/ID formats to a canonical arXiv ID.
 * Accepts: "1706.03762", "arxiv:1706.03762", "https://arxiv.org/abs/1706.03762"
 */
export function normalizeArxivId(input: string): string {
  const clean = input.trim();

  // Handle full URLs like https://arxiv.org/abs/1706.03762 or https://arxiv.org/pdf/1706.03762
  const urlMatch = clean.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]+(?:v\d+)?)/i);
  if (urlMatch) return urlMatch[1];

  // Handle arxiv:XXXXXXXX format
  const prefixMatch = clean.match(/arxiv:\s*([0-9]{4}\.[0-9]+(?:v\d+)?)/i);
  if (prefixMatch) return prefixMatch[1];

  // Handle plain ID format like 1706.03762 or 2301.00001v2
  if (/^[0-9]{4}\.[0-9]+(?:v\d+)?$/.test(clean)) return clean;

  throw new Error(
    `Could not parse arXiv ID from "${input}". Expected formats: "1706.03762", "arxiv:1706.03762", or "https://arxiv.org/abs/1706.03762"`
  );
}

/**
 * Fetch a paper PDF from arXiv and extract its text.
 * Uses the arXiv public PDF endpoint (no API key required).
 */
export async function fetchArxivPaper(arxivId: string): Promise<{
  text: string;
  pdfUrl: string;
}> {
  const normalizedId = normalizeArxivId(arxivId);
  const pdfUrl = `https://arxiv.org/pdf/${normalizedId}`;

  let pdfBuffer: ArrayBuffer;
  try {
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'PaperForge/1.0 (research-paper-reproduction-tool)',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`arXiv paper "${normalizedId}" not found. Check the ID and try again.`);
      }
      throw new Error(`Failed to fetch arXiv paper: HTTP ${response.status}`);
    }

    pdfBuffer = await response.arrayBuffer();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Network error fetching arXiv paper: ${String(error)}`);
  }

  const text = await extractTextFromPdf(pdfBuffer);

  return { text, pdfUrl };
}
