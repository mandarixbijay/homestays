'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import BlogAnalytics from '@/components/admin/blog/BlogAnalytics';

export default function BlogAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog analytics..." />
      </div>
    }>
      <BlogAnalytics />
    </Suspense>
  );
}
