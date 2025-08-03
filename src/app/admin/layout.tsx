'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AuthRequired } from '@/hooks/useSessionManager';

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRequired 
      requireRole="ADMIN"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Access</h3>
            <p className="text-gray-600">Checking your admin permissions...</p>
          </div>
        </div>
      }
    >
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthRequired>
  );
}