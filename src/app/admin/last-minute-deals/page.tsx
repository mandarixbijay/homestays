import { Suspense } from 'react';
import LastMinuteDealsManagement from '@/components/admin/LastMinuteDealsManagement';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function LastMinuteDealsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading deals..." /></div>}>
      <LastMinuteDealsManagement />
    </Suspense>
  );
}
