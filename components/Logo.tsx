'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export function PaperForgeLogo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PaperForge logo"
    >
      <defs>
        <linearGradient id="forge-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Paper / document base */}
      <rect x="6" y="4" width="26" height="34" rx="3" fill="url(#forge-grad)" opacity="0.15" stroke="url(#forge-grad)" strokeWidth="1.5" />
      <rect x="9" y="4" width="26" height="34" rx="3" fill="url(#forge-grad)" opacity="0.25" stroke="url(#forge-grad)" strokeWidth="1.5" />
      <rect x="12" y="4" width="26" height="34" rx="3" fill="#1e1b4b" stroke="url(#forge-grad)" strokeWidth="1.5" />

      {/* Code lines on paper */}
      <rect x="17" y="11" width="16" height="2" rx="1" fill="url(#forge-grad)" opacity="0.7" />
      <rect x="17" y="16" width="10" height="2" rx="1" fill="url(#forge-grad)" opacity="0.5" />
      <rect x="17" y="21" width="13" height="2" rx="1" fill="url(#forge-grad)" opacity="0.5" />
      <rect x="17" y="26" width="8" height="2" rx="1" fill="url(#forge-grad)" opacity="0.4" />

      {/* Forge spark / lightning bolt */}
      <path
        d="M30 28 L26 36 L31 34 L27 44 L35 33 L30 35 Z"
        fill="url(#spark-grad)"
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaperForgeWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <PaperForgeLogo size={32} />
      <span className="font-bold text-xl tracking-tight text-zinc-100 dark:text-zinc-100">
        Paper<span className="text-indigo-400">Forge</span>
      </span>
    </div>
  );
}
