'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UploadZone from './UploadZone';

export default function LandingUpload() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = (jobId: string) => {
    router.push(`/processing/${jobId}`);
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🔬</div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Sign in to start analyzing papers
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Sign in to get started →
          </a>
        </div>
      </div>
    );
  }

  return <UploadZone onSubmit={handleSubmit} />;
}
