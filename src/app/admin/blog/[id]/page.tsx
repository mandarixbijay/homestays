'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import BlogViewPage from '@/components/admin/blog/BlogViewPage';

export default function ViewBlogPage() {
  const params = useParams();
  const blogId = parseInt(params.id as string);

  if (isNaN(blogId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Blog ID</h1>
          <p className="text-gray-600 mt-2">The provided blog ID is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    }>
      <BlogViewPage blogId={blogId} />
    </Suspense>
  );
}
