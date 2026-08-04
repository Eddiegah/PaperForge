'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  mermaidCode: string;
}

export default function ArchitectureDiagram({ mermaidCode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!mermaidCode || !containerRef.current) return;
    let cancelled = false;

    async function render() {
      try {
        // Dynamically import mermaid to avoid SSR/load issues
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#4f46e5',
            primaryTextColor: '#f4f4f5',
            primaryBorderColor: '#6366f1',
            lineColor: '#71717a',
            secondaryColor: '#27272a',
            tertiaryColor: '#18181b',
          },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Could not render diagram: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [mermaidCode]);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
        <p className="text-zinc-400 text-sm mb-2">Diagram rendering failed</p>
        <pre className="text-xs text-zinc-500 overflow-auto whitespace-pre-wrap">{mermaidCode}</pre>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Architecture Diagram
      </h3>
      {!rendered && (
        <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
          Rendering diagram...
        </div>
      )}
      <div ref={containerRef} className="overflow-auto flex justify-center [&_svg]:max-w-full" />
    </div>
  );
}
