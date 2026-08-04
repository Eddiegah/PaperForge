'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { GeneratedCode } from '@/types';

interface Props {
  code: GeneratedCode;
}

type TerminalStatus = 'idle' | 'booting' | 'installing' | 'ready' | 'running' | 'error';

export default function InBrowserTerminal({ code }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const webcontainerRef = useRef<any>(null);
  const [status, setStatus] = useState<TerminalStatus>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const writeToTerminal = (text: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(text);
    }
  };

  const initTerminal = async () => {
    if (!terminalRef.current || !mounted) return;
    setStatus('booting');

    try {
      // Dynamically import to avoid SSR issues
      const { Terminal: XTerm } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      // Import CSS
      await import('@xterm/xterm/css/xterm.css' as any);

      // Init terminal
      const term = new XTerm({
        theme: {
          background: '#09090b',
          foreground: '#e4e4e7',
          cursor: '#6366f1',
          selectionBackground: '#3f3f46',
          black: '#18181b',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#6366f1',
          cyan: '#06b6d4',
          red: '#ef4444',
        },
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 13,
        lineHeight: 1.5,
        cursorBlink: true,
        rows: 20,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Boot WebContainer
      const { WebContainer } = await import('@webcontainer/api');
      const wc = await WebContainer.boot();
      webcontainerRef.current = wc;

      term.writeln('\x1b[36m⚡ PaperForge Terminal ready\x1b[0m');
      term.writeln('\x1b[90mMounting generated files...\x1b[0m');

      // Mount all generated files
      const files: Record<string, any> = {};
      for (const file of code.files) {
        files[file.path] = { file: { contents: file.content } };
      }
      await wc.mount(files);

      setStatus('installing');
      term.writeln('\x1b[33m📦 Installing dependencies...\x1b[0m');

      // Install dependencies
      const installProcess = await wc.spawn('pip', ['install', '-r', 'requirements.txt'], {
        output: false,
      });

      // Handle install output
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) { term.write(chunk); },
        })
      );

      const installCode = await installProcess.exit;

      if (installCode !== 0) {
        term.writeln('\x1b[33m⚠ pip not available — using node environment\x1b[0m');
      } else {
        term.writeln('\x1b[32m✓ Dependencies installed\x1b[0m');
      }

      setStatus('ready');
      term.writeln('\x1b[32m✓ Ready! Click "Run train.py" to start.\x1b[0m');
      term.writeln('');

    } catch (error) {
      setStatus('error');
      writeToTerminal('\x1b[31m✗ Terminal failed to start: ' + (error instanceof Error ? error.message : String(error)) + '\x1b[0m\r\n');
      writeToTerminal('\x1b[90mWebContainers require Chrome/Edge and a secure context.\x1b[0m\r\n');
    }
  };

  const runScript = async (script: string) => {
    if (!webcontainerRef.current || !xtermRef.current) return;
    setStatus('running');

    const term = xtermRef.current;
    term.writeln(`\x1b[36m$ python ${script}\x1b[0m`);

    try {
      const process = await webcontainerRef.current.spawn('python', [script]);

      process.output.pipeTo(
        new WritableStream({
          write(chunk) { term.write(chunk); },
        })
      );

      const exitCode = await process.exit;
      term.writeln(`\x1b[90m[Process exited with code ${exitCode}]\x1b[0m`);
    } catch (error) {
      term.writeln(`\x1b[31m✗ Error: ${error instanceof Error ? error.message : String(error)}\x1b[0m`);
    } finally {
      setStatus('ready');
    }
  };

  const reset = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
    webcontainerRef.current = null;
    setStatus('idle');
  };

  const statusColors: Record<TerminalStatus, string> = {
    idle:       'bg-zinc-400',
    booting:    'bg-amber-400 animate-pulse',
    installing: 'bg-amber-400 animate-pulse',
    ready:      'bg-emerald-400',
    running:    'bg-blue-400 animate-pulse',
    error:      'bg-red-400',
  };

  const statusLabels: Record<TerminalStatus, string> = {
    idle:       'Not started',
    booting:    'Booting environment...',
    installing: 'Installing dependencies...',
    ready:      'Ready',
    running:    'Running...',
    error:      'Error',
  };

  return (
    <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            <span className="text-xs text-zinc-400 font-mono">{statusLabels[status]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <button onClick={initTerminal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
              <Terminal size={12} />
              Open Terminal
            </button>
          )}
          {status === 'ready' && (
            <>
              <button onClick={() => runScript('train.py')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
                <Play size={12} />
                Run train.py
              </button>
              <button onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs transition-colors">
                <RotateCcw size={12} />
                Reset
              </button>
            </>
          )}
          {status === 'error' && (
            <button onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs transition-colors">
              <RotateCcw size={12} />
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Terminal area */}
      <div className="relative" style={{ minHeight: 320 }}>
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Terminal size={22} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium text-sm mb-1">In-browser terminal</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Run the generated code directly in your browser.<br />
                No local setup needed. Powered by WebContainers.
              </p>
            </div>
            <button onClick={initTerminal}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              Launch terminal
            </button>
            <p className="text-xs text-zinc-600">Requires Chrome or Edge</p>
          </div>
        )}
        <div
          ref={terminalRef}
          className={`p-2 ${status === 'idle' ? 'invisible h-0' : 'visible'}`}
          style={{ minHeight: status === 'idle' ? 0 : 320 }}
        />
      </div>
    </div>
  );
}
