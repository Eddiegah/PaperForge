/**
 * GET /api/arxiv-search?q=query
 *
 * Searches arXiv using the public Atom/XML API and returns a JSON array.
 */

import { NextRequest, NextResponse } from 'next/server';

interface ArxivResult {
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string; // ISO date string
  year: string;
}

function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].replace(/<[^>]+>/g, '').trim());
  }
  return results;
}

function parseEntries(xml: string): ArxivResult[] {
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  const results: ArxivResult[] = [];
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(xml)) !== null) {
    const entry = m[1];

    // arxiv ID from <id>http://arxiv.org/abs/XXXX.XXXXX</id>
    const idRaw = extractText(entry, 'id');
    const arxivId = idRaw.split('/').pop() ?? idRaw;

    const title = extractText(entry, 'title').replace(/\s+/g, ' ');
    const abstract = extractText(entry, 'summary').replace(/\s+/g, ' ');
    const published = extractText(entry, 'published');
    const year = published ? published.slice(0, 4) : '';

    // Authors: <author><name>...</name></author>
    const authorRe = /<author>([\s\S]*?)<\/author>/gi;
    const authors: string[] = [];
    let am: RegExpExecArray | null;
    while ((am = authorRe.exec(entry)) !== null) {
      const name = extractText(am[1], 'name');
      if (name) authors.push(name);
    }

    if (arxivId && title) {
      results.push({ arxivId, title, authors, abstract, published, year });
    }
  }

  return results;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter ?q=' }, { status: 400 });
  }

  const encoded = encodeURIComponent(query);
  const url = `http://export.arxiv.org/api/query?search_query=all:${encoded}&start=0&max_results=8&sortBy=relevance`;

  let xmlText: string;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PaperForge/1.0 (research tool)' },
      // Next.js: disable caching so every query is fresh
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `arXiv API returned status ${res.status}` },
        { status: 502 }
      );
    }
    xmlText = await res.text();
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to reach arXiv API: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    );
  }

  const results = parseEntries(xmlText);
  return NextResponse.json(results);
}
