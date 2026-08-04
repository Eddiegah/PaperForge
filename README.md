<div align="center">

<img src="public/next.svg" width="60" alt="PaperForge Logo" />

# PaperForge

### Turn research papers into honest, annotated starter code

[![Live Demo](https://img.shields.io/badge/Live%20Demo-paper--forge--nu.vercel.app-6366f1?style=flat-square&logo=vercel)](https://paper-forge-nu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

**PaperForge extracts what's explicit, scores how replicable a paper is, and generates annotated starter code — with every ambiguity flagged honestly.**

[Live App](https://paper-forge-nu.vercel.app) · [Report Bug](https://github.com/Eddiegah/PaperForge/issues) · [Request Feature](https://github.com/Eddiegah/PaperForge/issues)

</div>

---

## The honest truth about paper-to-code

Current LLM-based paper-to-code generation achieves roughly **35-40% end-to-end accuracy**. Most failures are semantic — the code runs, but implements something subtly different from the paper.

PaperForge doesn't claim to solve this. Instead, it:

- Extracts what the paper **explicitly states** with a confidence level per field
- Computes a **Replication Difficulty Score (1-10)** grounded in real signals — not an LLM guess
- Generates code with **inline `# NOTE` comments** on every inferred value
- Lists every **ambiguous field** with a specific reason and what to verify

**This honest framing is the product differentiator, not a limitation to hide.**

---

## Features

| Feature | Description |
|---|---|
| **Replication Difficulty Score** | 1-10 score computed from per-field confidence levels — not an arbitrary LLM rating |
| **Per-field ambiguity flags** | Every extracted field shows high/medium/low/missing confidence with specific reasoning |
| **Annotated starter code** | model.py, train.py, data_loader.py with `# NOTE` comments on every assumption |
| **Architecture diagram** | Auto-generated Mermaid.js flowchart of the model |
| **In-browser terminal** | Run the generated code directly in your browser via WebContainers |
| **One-click GitHub export** | Push the generated repo to your GitHub account instantly |
| **Colab notebook export** | Download a ready-to-run `.ipynb` notebook |
| **arXiv search** | Search papers directly from the dashboard |
| **Paper comparison** | Side-by-side comparison of two papers with color-coded diff |
| **User history** | All past analyses saved per user (Neon Postgres) |
| **Rate limiting** | Free tier: 5 papers/month. Pro: unlimited |
| **Multi-auth** | GitHub, Google, and email/password sign-in |
| **Light/dark mode** | Fully themed with system-agnostic toggle |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript throughout |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **AI / LLM** | Anthropic Claude (primary), Google Gemini (fallback) |
| **PDF parsing** | unpdf (modern, serverless-compatible) |
| **Database** | Neon Postgres (history + rate limiting) |
| **Job state** | Upstash Redis (serverless job queue) |
| **Auth** | NextAuth v5 (GitHub, Google, Credentials) |
| **Payments** | Paystack (Ghana + West Africa) |
| **Email** | Resend (welcome + magic link emails) |
| **Diagrams** | Mermaid.js |
| **Terminal** | WebContainers (@webcontainer/api) |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Deploy** | Vercel (single platform, no separate backend) |

---

## Getting Started

### Prerequisites

- Node.js 20+ 
- An [Anthropic API key](https://console.anthropic.com/settings/keys)
- A GitHub OAuth app
- A Google OAuth client

### 1. Clone and install

```bash
git clone https://github.com/Eddiegah/PaperForge.git
cd PaperForge/paperforge-app
npm install --legacy-peer-deps
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# AI (required)
ANTHROPIC_API_KEY=sk-ant-...

# Auth
NEXTAUTH_SECRET=your_32_char_hex_secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Upstash Redis (https://upstash.com)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Neon Postgres (https://neon.tech) - for history + rate limiting
DATABASE_URL=postgresql://...

# Resend (https://resend.com) - for emails
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev

# Paystack (https://paystack.com) - for payments
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_PRO_PLAN_CODE=PLN_...
PAYSTACK_TEAM_PLAN_CODE=PLN_...
```

Generate `NEXTAUTH_SECRET`:
```powershell
# PowerShell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Verify API key works

```bash
node -e "
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
const Anthropic = require('@anthropic-ai/sdk');
const c = new Anthropic({apiKey: key});
c.messages.create({model:'claude-haiku-4-5',max_tokens:20,messages:[{role:'user',content:'Say OK'}]}).then(r=>console.log('API works:', r.content[0].text)).catch(e=>console.error('Failed:', e.message))
"
```

---

## Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Set all environment variables in Vercel → Settings → Environment Variables.

**Important production changes:**
- Set `AUTH_URL` to your Vercel deployment URL
- Set `AUTH_TRUST_HOST=true`
- Update GitHub and Google OAuth callback URLs to include your production domain

---

## Architecture

```
paperforge-app/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── processing/[jobId]/page.tsx # Results page
│   ├── compare/page.tsx            # Paper comparison
│   └── api/
│       ├── ingest/route.ts         # PDF/arXiv ingestion + job queue
│       ├── status/[jobId]/route.ts # Job polling endpoint
│       ├── github-export/route.ts  # GitHub repo creation
│       ├── export-colab/route.ts   # Jupyter notebook export
│       ├── arxiv-search/route.ts   # arXiv paper search
│       ├── history/route.ts        # User history
│       ├── usage/route.ts          # Rate limit status
│       └── auth/                   # NextAuth handlers
├── components/
│   ├── AnimatedHero.tsx            # Landing page hero
│   ├── VenueMarquee.tsx            # Scrolling venue list
│   ├── HowItWorks.tsx              # Feature walkthrough
│   ├── DashboardPreview.tsx        # App mockup
│   ├── Pricing.tsx                 # Pricing cards
│   ├── FAQ.tsx                     # Accordion FAQ
│   ├── UploadZone.tsx              # PDF/arXiv input
│   ├── DifficultyScorePanel.tsx    # Score gauge + flags
│   ├── SpecTable.tsx               # Extracted spec display
│   ├── CodeExplorer.tsx            # File viewer + actions
│   ├── ArchitectureDiagram.tsx     # Mermaid renderer
│   ├── InBrowserTerminal.tsx       # WebContainers terminal
│   ├── GitHubExportModal.tsx       # GitHub push modal
│   ├── ArxivSearch.tsx             # Search component
│   ├── PaperHistory.tsx            # User history sidebar
│   ├── UsageBar.tsx                # Rate limit display
│   ├── SettingsModal.tsx           # Settings panel
│   └── Navbar.tsx                  # Navigation
├── lib/
│   ├── llm.ts                      # Unified LLM client (Gemini + Anthropic fallback)
│   ├── ingest.ts                   # PDF extraction + arXiv fetch
│   ├── extractSpec.ts              # Technical spec extraction
│   ├── difficultyScore.ts          # Grounded score computation
│   ├── generateCode.ts             # Code generation
│   ├── generateDiagram.ts          # Mermaid diagram generation
│   ├── generateColab.ts            # Jupyter notebook generation
│   ├── jobStore.ts                 # Redis job state
│   ├── userStore.ts                # Redis user accounts
│   ├── db.ts                       # Neon Postgres (history + rate limiting)
│   ├── auth.ts                     # NextAuth configuration
│   └── emails/                     # Resend email templates
└── types/index.ts                  # TypeScript types
```

---

## How the Replication Difficulty Score works

The score is NOT an LLM asked to "rate difficulty 1-10." It's computed from real signals:

1. Every extracted field gets a confidence level: `high`, `medium`, `low`, or `missing`
2. The proportion of high-confidence fields per category is computed
3. Overall clarity (0-1) maps to difficulty (1-10): high clarity = low difficulty
4. Ambiguous fields are listed with **specific reasons** and **concrete recommendations**

This makes the score explainable and trustworthy — a researcher can see exactly why a paper scored 7/10.

---

## How This Compares to the State of the Art

Paper-to-code generation is a genuinely hard, actively-researched problem:

- **~35-40% end-to-end accuracy** — most state-of-the-art approaches
- **Semantic errors are the real problem** — code that runs but implements something subtly wrong
- **PaperForge's differentiator** — honest ambiguity flagging so you know what to verify

Features vs competitors:

| Feature | PaperForge | Paper2Repo |
|---|---|---|
| Replication Difficulty Score | ✅ Grounded | ❌ |
| Per-field ambiguity flags | ✅ | ❌ |
| In-browser terminal | ✅ WebContainers | ✅ |
| Colab notebook export | ✅ | Mentioned |
| Paper comparison | ✅ Side-by-side | ❌ |
| arXiv search | ✅ | ❌ |
| Ghana/West Africa payments | ✅ Paystack | ❌ |
| Open source | ✅ | ❌ |

---

## Known Limitations (v1)

- **Scanned PDFs** — image-only PDFs fail with a clear error (requires text-searchable PDF)
- **Equation parsing** — dedicated LaTeX OCR not implemented; LLM extracts what it can from text
- **Non-ML papers** — optimized for standard ML/AI paper structure
- **In-memory job state** — Upstash Redis is used; jobs have a 2-hour TTL

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with honesty about what AI can and can't do.

**[paper-forge-nu.vercel.app](https://paper-forge-nu.vercel.app)**

</div>
