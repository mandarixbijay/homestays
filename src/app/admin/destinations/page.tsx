import { Suspense } from 'react';
import DestinationsManagement from '@/components/admin/DestinationsManagement';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading destinations..." /></div>}>
      <DestinationsManagement />
    </Suspense>
  );
}
