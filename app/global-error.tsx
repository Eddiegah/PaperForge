'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#f4f4f5', padding: '2rem', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            This sometimes happens after a new deployment. Please go back and try again.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Try again
            </button>
            <a
              href="/dashboard"
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', background: '#27272a', color: '#d4d4d8', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
