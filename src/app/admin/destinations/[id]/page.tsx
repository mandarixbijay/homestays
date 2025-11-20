import { Suspense } from 'react';
import DestinationDetail from '@/components/admin/DestinationDetail';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function DestinationDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading destination details..." />
      </div>
    }>
      <DestinationDetail destinationId={parseInt(params.id)} />
    </Suspense>
  );
}
