import { Suspense } from 'react';
import TopHomestaysManagement from '@/components/admin/TopHomestaysManagement';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function TopHomestaysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading top homestays..." /></div>}>
      <TopHomestaysManagement />
    </Suspense>
  );
}
