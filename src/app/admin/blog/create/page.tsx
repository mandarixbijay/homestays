'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import UnifiedBlogForm from '@/components/admin/blog/UnifiedBlogForm';

export default function CreateBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog form..." />
      </div>
    }>
      <UnifiedBlogForm />
    </Suspense>
  );
}