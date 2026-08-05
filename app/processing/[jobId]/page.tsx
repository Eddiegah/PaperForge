'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProcessingJob } from '@/types';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

const POLL_MS = 3000;

export default function ProcessingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [fullResult, setFullResult] = useState<ProcessingJob | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spec' | 'code' | 'diagram'>('spec');
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState('');

  useEffect(() => {
    params.then(p => setJobId(p.jobId)).catch(() => setFetchError('Invalid URL'));
  }, []);

  useEffect(() => {
    if (!jobId) return;
    if (jobId.startsWith('demo_')) {
      router.replace('/dashboard');
      return;
    }
    let timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (!res.ok) {
          if (res.status === 404) setFetchError('Job not found. Please submit a new paper.');
          return;
        }
        const data = await res.json();
        if (data.error) { setFetchError(data.error); return; }
        setJob(data as ProcessingJob);
        if (data.status === 'complete' || data.status === 'failed') {
          clearInterval(timer);
          if (data.status === 'complete') {
            try {
              const r2 = await fetch(`/api/result/${jobId}`);
              if (r2.ok) {
                const full = await r2.json();
                setFullResult(full as ProcessingJob);
                if (full.generatedCode?.files?.[0]) setActiveFile(full.generatedCode.files[0].path);
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    };
    poll();
    timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [jobId]);

  const isProcessing = !job || (job.status !== 'complete' && job.status !== 'failed');
  const displayJob = fullResult || job;

  if (fetchError) return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md px-4">
          <p className="text-red-500 text-sm">{fetchError}</p>
          <Link href="/dashboard" className="inline-block px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 h-11 flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-700 dark:hover:text-zinc-200">Dashboard</Link>
          {job?.paperMetadata?.title && <>
            <span>/</span>
            <span className="truncate max-w-md text-zinc-500 dark:text-zinc-400">{job.paperMetadata.title}</span>
          </>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isProcessing ? (
          <ProcessingView job={job} />
        ) : job?.status === 'failed' ? (
          <FailedView error={job.error} />
        ) : (
          <ResultsView
            job={displayJob!}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            copied={copied}
            setCopied={setCopied}
            showExport={showExport}
            setShowExport={setShowExport}
            jobId={jobId!}
            session={session}
          />
        )}
      </div>
    </div>
  );
}

function ProcessingView({ job }: { job: ProcessingJob | null }) {
  const steps = [
    { status: 'uploading',  label: 'Reading paper' },
    { status: 'extracting', label: 'Extracting spec' },
    { status: 'analyzing',  label: 'Computing difficulty score' },
    { status: 'generating', label: 'Generating code' },
  ];
  const order = steps.map(s => s.status);
  const currentIdx = order.indexOf(job?.status || 'uploading');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Analyzing paper...</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">This takes 30-90 seconds</p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>{job?.statusMessage || 'Starting...'}</span>
          <span>{job?.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${job?.progress || 0}%` }} />
        </div>
        <div className="space-y-2 pt-2">
          {steps.map((step, i) => (
            <div key={step.status} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                i < currentIdx ? 'bg-emerald-500 text-white' : i === currentIdx ? 'bg-indigo-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}>
                {i < currentIdx ? '✓' : i === currentIdx ? '·' : ''}
              </div>
              <span className={`text-sm ${i === currentIdx ? 'text-zinc-900 dark:text-zinc-100 font-medium' : i < currentIdx ? 'text-zinc-400 line-through' : 'text-zinc-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FailedView({ error }: { error?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="text-3xl">❌</div>
      <h1 className="text-xl font-semibold text-red-500">Processing failed</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md text-center">{error}</p>
      <Link href="/dashboard" className="px-5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">Try another paper</Link>
    </div>
  );
}

function ResultsView({ job, activeTab, setActiveTab, activeFile, setActiveFile, copied, setCopied, showExport, setShowExport, jobId, session }: any) {
  const score = job.difficultyScore;
  const scoreColor = !score ? '#6366f1' : score.score <= 3 ? '#10b981' : score.score <= 6 ? '#f59e0b' : '#ef4444';
  const files = job.generatedCode?.files || [];
  const currentFile = files.find((f: any) => f.path === activeFile);

  const copy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Paper header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{job.paperMetadata?.title}</h1>
        {job.paperMetadata?.authors?.length > 0 && (
          <p className="text-zinc-500 text-sm mb-2">
            {Array.isArray(job.paperMetadata.authors)
              ? job.paperMetadata.authors.join(', ')
              : job.paperMetadata.authors}
          </p>
        )}
        {job.paperMetadata?.abstract && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">{job.paperMetadata.abstract}</p>
        )}
      </div>

      {/* Score */}
      {score && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold" style={{ color: scoreColor }}>{score.score}<span className="text-lg text-zinc-400">/10</span></div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Replication Difficulty</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{score.overallAssessment}</p>
            </div>
          </div>
          {score.ambiguousFields?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fields to verify ({score.ambiguousFields.length})</p>
              {score.ambiguousFields.map((f: any, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-indigo-500 text-xs">{f.fieldName}</code>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{f.confidence}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{f.issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-zinc-100 dark:border-zinc-800">
          {[
            { id: 'spec', label: 'Technical Spec' },
            { id: 'code', label: 'Generated Code' },
            { id: 'diagram', label: 'Architecture' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'spec' && job.technicalSpec && <SpecView spec={job.technicalSpec} />}
          {activeTab === 'code' && files.length > 0 && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden" style={{ height: 500 }}>
              <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                {files.map((f: any) => (
                  <button key={f.path} onClick={() => setActiveFile(f.path)}
                    className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-r border-zinc-200 dark:border-zinc-700 ${
                      activeFile === f.path ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'
                    }`}>{f.path}</button>
                ))}
              </div>
              <div className="flex-1 overflow-auto" style={{ height: 420 }}>
                {currentFile && (
                  <pre className="text-xs p-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {currentFile.content}
                  </pre>
                )}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-2 flex items-center justify-between bg-white dark:bg-zinc-900">
                <span className="text-xs text-zinc-400">{files.length} files generated</span>
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button onClick={() => setShowExport(true)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium">
                    Push to GitHub
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'diagram' && job.architectureDiagram && (
            <DiagramView mermaidCode={job.architectureDiagram} />
          )}
        </div>
      </div>

      {/* GitHub export modal */}
      {showExport && <ExportModal jobId={jobId} paperTitle={job.paperMetadata?.title || 'paper'} onClose={() => setShowExport(false)} githubToken={(session as any)?.githubAccessToken} />}
    </div>
  );
}

function SpecView({ spec }: { spec: any }) {
  const rows = [
    ['Model name', spec.modelArchitecture?.name],
    ['Model type', spec.modelArchitecture?.type],
    ['Dataset', spec.dataset?.name],
    ['Dataset size', spec.dataset?.size],
    ['Optimizer', spec.trainingRecipe?.optimizer],
    ['Learning rate', spec.trainingRecipe?.learningRate],
    ['Batch size', spec.trainingRecipe?.batchSize],
    ['Epochs', spec.trainingRecipe?.epochs],
    ['Loss function', spec.trainingRecipe?.lossFunction],
    ['Primary metric', spec.evaluationMetrics?.primary],
  ];

  const chip: Record<string, string> = {
    high: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    low: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    missing: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <tbody>
          {rows.map(([label, field]: any) => {
            const val = field?.value;
            const conf = field?.confidence?.value || 'missing';
            const display = val === null || val === undefined || val === '' || val === 0 ? '—'
              : Array.isArray(val) ? val.join(', ') || '—'
              : typeof val === 'object' ? Object.entries(val).map(([k,v]) => `${k}: ${v}`).join(', ') || '—'
              : String(val);
            return (
              <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <td className="py-2.5 px-4 text-sm font-medium text-zinc-500 w-40">{label}</td>
                <td className="py-2.5 px-4 text-sm text-zinc-800 dark:text-zinc-200">{display}</td>
                <td className="py-2.5 px-4 w-20">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${chip[conf] || chip.missing}`}>{conf}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DiagramView({ mermaidCode }: { mermaidCode: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then(m => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict', // MUST be strict - 'loose' crashes Chrome renderer
      });
      return m.default.render(`d${Date.now()}`, mermaidCode);
    }).then(r => {
      if (!cancelled) setSvg(r.svg);
    }).catch(() => {
      if (!cancelled) setErr(true);
    });
    return () => { cancelled = true; };
  }, [mermaidCode]);

  if (err) return <pre className="text-xs text-zinc-500 p-4 overflow-auto">{mermaidCode}</pre>;
  if (!svg) return <div className="h-40 flex items-center justify-center text-zinc-400 text-sm">Loading diagram...</div>;
  return <div className="overflow-auto flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ExportModal({ jobId, paperTitle, onClose, githubToken }: any) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState(paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    setLoading(true);
    const t = githubToken || token;
    const res = await fetch('/api/github-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, githubToken: t, repoName }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Push to GitHub</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">×</button>
        </div>
        {result?.repoUrl ? (
          <div className="space-y-3">
            <p className="text-emerald-600 font-medium text-sm">Repository created!</p>
            <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 text-sm break-all hover:underline">{result.repoUrl}</a>
            <button onClick={onClose} className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm">Close</button>
          </div>
        ) : (
          <>
            {githubToken ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                Connected via GitHub sign-in
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">GitHub Token (needs repo scope)</label>
                <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="ghp_..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Repository name</label>
              <input value={repoName} onChange={e => setRepoName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {result?.error && <p className="text-red-500 text-sm">{result.error}</p>}
            <button onClick={submit} disabled={loading || (!githubToken && !token)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create repository'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
