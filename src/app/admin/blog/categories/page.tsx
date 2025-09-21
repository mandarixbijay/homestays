'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import CategoriesManagement from '@/components/admin/blog/CategoriesManagement';

export default function BlogCategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories management..." />
      </div>
    }>
      <CategoriesManagement />
    </Suspense>
  );
}