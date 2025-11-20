import { Suspense } from 'react';
import SelectHomestaysForDeal from '@/components/admin/SelectHomestaysForDeal';
import { LoadingSpinner } from '@/components/admin/AdminComponents';

export default function SelectHomestaysPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <SelectHomestaysForDeal />
    </Suspense>
  );
}
