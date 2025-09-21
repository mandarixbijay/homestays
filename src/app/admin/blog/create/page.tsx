'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/admin/AdminComponents';
import BlogForm from '@/components/admin/blog/BlogCreateForm';

export default function CreateBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog form..." />
      </div>
    }>
      <BlogForm />
    </Suspense>
  );
}