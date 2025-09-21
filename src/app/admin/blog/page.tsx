'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import BlogDashboard from '@/components/admin/blog/CompleteBlogDashboard';

export default function AdminBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog dashboard..." />
      </div>
    }>
      <BlogDashboard />
    </Suspense>
  );
}
