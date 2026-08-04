# PaperForge

**Honest research-paper-to-code acceleration.**

PaperForge takes an ML research paper (PDF upload or arXiv link), uses Claude to extract its technical specification, generates a starter code repository, and computes a **Replication Difficulty Score** that explicitly flags what's ambiguous or missing — rather than pretending the extraction is complete and correct.

> **What this is:** A tool that accelerates the reproduction process by extracting what's clear and honestly flagging what's ambiguous, so a researcher starts from a strong, annotated scaffold instead of a blank page.
>
> **What this is not:** One-click perfect replication. That doesn't exist yet at this level of LLM capability. See the "State of the Art" section below.

---

## Setup

### Prerequisites

- Node.js 20+ (tested on Node 24)
- An [Anthropic API key](https://console.anthropic.com/)
- A GitHub OAuth app (for repo export)

### 1. Clone and install

```bash
git clone <your-repo>
cd paperforge-app
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
copy .env.example .env.local
```

Required variables:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GITHUB_CLIENT_ID=<from your GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from your GitHub OAuth app>
```

To generate `NEXTAUTH_SECRET` on Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Verify API key works

Before running, test your Anthropic key:
```bash
node -e "const Anthropic = require('@anthropic-ai/sdk'); const c = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY}); c.messages.create({model:'claude-3-5-haiku-20241022',max_tokens:50,messages:[{role:'user',content:'Say OK'}]}).then(r=>console.log(r.content[0].text)).catch(console.error)"
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

1. **Ingest**: Upload a PDF (up to 32MB) or provide an arXiv ID. Text is extracted using `unpdf`.
2. **Extract**: Claude reads the paper and extracts model architecture, dataset details, training recipe, and evaluation metrics — with a **per-field confidence level** (high/medium/low/missing) for each.
3. **Score**: The Replication Difficulty Score is computed from those confidence levels — not an arbitrary LLM guess. Fields with low/missing confidence are listed explicitly.
4. **Generate**: A starter Python repository is generated with `# NOTE` comments at every place an ambiguous value was used.
5. **Export**: Push the generated repository to GitHub with one click.

### Processing time and Vercel limits

LLM-based extraction takes 30–90 seconds for a typical paper. This is handled with a polling architecture (submit → get job ID → poll `/api/status/[jobId]`):

| Plan | Fluid Compute max duration |
|------|---------------------------|
| Hobby | ~60 seconds |
| Pro | 30 minutes |
| Enterprise | 30 minutes |

**If you consistently hit timeout errors on Hobby:** Upgrade to Pro (sufficient for >99% of papers), or implement a proper background job queue (e.g., [Inngest](https://inngest.com), [Trigger.dev](https://trigger.dev)). The latter is a meaningful architecture change — see the issue tracker rather than patching around it.

**Important:** The in-memory job store (`lib/jobStore.ts`) works correctly in development and low-traffic Vercel deployments where Fluid Compute keeps the function warm. For production scale, replace it with Neon/Postgres. See `lib/jobStore.ts` for details.

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard (Project → Settings → Environment Variables). Do **not** commit `.env.local`.

Note: `@vercel/postgres` is deprecated — Vercel migrated Postgres to Neon. For production persistence, use `@neondatabase/serverless` instead. The current implementation works without a database (jobs are in-memory); add Neon for history persistence when needed.

---

## The Replication Difficulty Score

The score (1–10) is computed from real signals, not vibes:

- Each extracted field (learning rate, batch size, architecture layers, etc.) gets a confidence level
- The proportion of high-confidence vs. ambiguous/missing fields determines the score
- Ambiguous fields are listed with the specific reason and a concrete recommendation

A score of 1–3 means the paper is exceptionally clear. A score of 7–10 means significant manual verification will be needed. The generated code is useful either way — but you'll know exactly where to look.

---

## How This Compares to the Actual State of the Art

Paper-to-code generation is a genuinely hard, actively-researched problem:

- **Current accuracy**: LLM-based approaches achieve roughly 35–40% end-to-end accuracy. The majority of failures are *semantic* — the code runs, but implements something subtly different from the paper.
- **Why it's hard**: Research papers optimize for human comprehension, not machine parsing. Equations, architecture diagrams, and implementation details spread across figures, appendices, and footnotes are designed to communicate to experts, not to be extracted by language models.
- **What honest tools do**: They surface the gaps. A tool that claims high accuracy across all papers is either lying or testing on unusually well-documented papers. PaperForge's differentiator is the honest ambiguity flagging — it tells you what it doesn't know.

This context makes PaperForge's positioning more credible, not less. Researchers who know this problem will trust a tool that says "I'm not sure about the learning rate schedule" far more than one that confidently generates a wrong value.

---

## Project Structure

```
paperforge-app/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── processing/[jobId]/page.tsx # Processing + results dashboard
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── ingest/route.ts         # PDF/arXiv ingestion + job kickoff
│       ├── status/[jobId]/route.ts # Job status polling endpoint
│       └── github-export/route.ts  # GitHub repository creation
├── components/
│   ├── UploadZone.tsx              # Drag-and-drop + arXiv input
│   ├── UploadZoneWrapper.tsx       # Client router wrapper
│   ├── ProcessingStatus.tsx        # Polling progress display
│   ├── DifficultyScorePanel.tsx    # Score gauge + ambiguity list
│   ├── SpecTable.tsx               # Extracted spec with confidence badges
│   ├── CodeExplorer.tsx            # File explorer + code viewer
│   ├── ArchitectureDiagram.tsx     # Mermaid.js renderer
│   └── GitHubExportModal.tsx       # GitHub push modal
├── lib/
│   ├── ingest.ts                   # PDF extraction (unpdf) + arXiv fetch
│   ├── extractSpec.ts              # Claude extraction + per-field confidence
│   ├── difficultyScore.ts          # Grounded score computation
│   ├── generateCode.ts             # Code generation with # NOTE annotations
│   ├── generateDiagram.ts          # Mermaid diagram generation
│   └── jobStore.ts                 # In-memory job state (replace with DB for scale)
├── types/index.ts                  # All TypeScript types
├── .env.example
├── next.config.ts
└── README.md
```

---

## Known Limitations (v1)

- **Image-only PDFs**: scanned papers without text layers will fail with a clear error message
- **Equation parsing**: dedicated OCR for LaTeX equations is not implemented — the LLM extracts what it can from text context
- **Non-ML papers**: optimized for standard ML/AI paper structure; unusual domains will get lower confidence scores
- **Production persistence**: the in-memory job store doesn't survive server restarts — resubmit the paper

---

*Generated with PaperForge. Review all ambiguity flags before relying on generated code for replication.*
