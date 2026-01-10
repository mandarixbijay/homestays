'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import EnhancedBlogDashboard from '@/components/admin/blog/EnhancedBlogDashboard';

export default function AdminBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading blog dashboard..." />
      </div>
    }>
      <EnhancedBlogDashboard />
    </Suspense>
  );
}