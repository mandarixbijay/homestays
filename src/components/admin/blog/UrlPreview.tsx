// components/admin/blog/UrlPreview.tsx
import React from 'react';

interface UrlPreviewProps {
 slug: string;
 available: boolean | null;
 checking: boolean;
}

export const UrlPreview: React.FC<UrlPreviewProps> = ({ slug, available, checking }) => {
 const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
 
 return (
 <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 ">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-700 ">Preview URL:</p>
 <p className="text-sm text-[#1A403D] font-mono break-all">
 {baseUrl}/blogs/{slug || 'your-blog-slug'}
 </p>
 </div>
 <div className="ml-4 flex-shrink-0">
 {checking ? (
 <div className="flex items-center gap-2 text-yellow-600 ">
 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
 <span className="text-xs font-medium">Checking...</span>
 </div>
 ) : available === true ? (
 <div className="flex items-center gap-1 text-green-600 ">
 <span className="text-lg">✓</span>
 <span className="text-xs font-medium">Available</span>
 </div>
 ) : available === false ? (
 <div className="flex items-center gap-1 text-red-600 ">
 <span className="text-lg">×</span>
 <span className="text-xs font-medium">Taken</span>
 </div>
 ) : (
 <div className="flex items-center gap-1 text-gray-500 ">
 <span className="text-lg">○</span>
 <span className="text-xs font-medium">Ready</span>
 </div>
 )}
 </div>
 </div>
 
 {/* Additional info for slug validation */}
 {slug && (
 <div className="mt-2 text-xs text-gray-500 ">
 Slug rules: lowercase letters, numbers, and hyphens only
 </div>
 )}
 </div>
 );
};

export default UrlPreview;