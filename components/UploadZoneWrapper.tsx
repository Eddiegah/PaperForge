'use client';

import { useRouter } from 'next/navigation';
import UploadZone from './UploadZone';

export default function UploadZoneWrapper() {
  const router = useRouter();

  const handleSubmit = (jobId: string) => {
    router.push(`/processing/${jobId}`);
  };

  return <UploadZone onSubmit={handleSubmit} />;
}
