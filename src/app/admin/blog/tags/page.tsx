'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import TagsManagement from '@/components/admin/blog/TagsManagement';

export default function BlogTagsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading tags management..." />
      </div>
    }>
      <TagsManagement />
    </Suspense>
  );
}