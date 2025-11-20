import { Suspense } from 'react';
import SelectHomestaysForTop from '@/components/admin/SelectHomestaysForTop';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function SelectHomestaysTopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <SelectHomestaysForTop />
    </Suspense>
  );
}
