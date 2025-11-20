import { Suspense } from 'react';
import LastMinuteDealDetail from '@/components/admin/LastMinuteDealDetail';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function LastMinuteDealDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading deal details..." />
      </div>
    }>
      <LastMinuteDealDetail dealId={parseInt(params.id)} />
    </Suspense>
  );
}
