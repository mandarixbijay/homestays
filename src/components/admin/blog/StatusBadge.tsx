// components/admin/blog/StatusBadge.tsx
import React from 'react';
import { getStatusColor } from '@/utils/blogEditorUtils';

interface StatusBadgeProps {
 status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
 size?: 'sm' | 'md' | 'lg';
 showIcon?: boolean;
 className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
 status, 
 size = 'md', 
 showIcon = true, 
 className = '' 
}) => {
 const sizeClasses = {
 sm: 'px-2 py-1 text-xs',
 md: 'px-3 py-1 text-sm',
 lg: 'px-4 py-2 text-base'
 };

 const icons = {
 PUBLISHED: '✓',
 DRAFT: '○',
 ARCHIVED: '×'
 };

 const statusTexts = {
 PUBLISHED: 'Published',
 DRAFT: 'Draft',
 ARCHIVED: 'Archived'
 };

 return (
 <span 
 className={`
 inline-flex items-center gap-1 rounded-full font-medium transition-colors
 ${sizeClasses[size]}
 ${getStatusColor(status)}
 ${className}
 `.trim()}
 >
 {showIcon && (
 <span className="flex-shrink-0" aria-hidden="true">
 {icons[status]}
 </span>
 )}
 <span>{statusTexts[status]}</span>
 </span>
 );
};

// Additional status variants
export const StatusIndicator: React.FC<{
 status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
 showLabel?: boolean;
}> = ({ status, showLabel = true }) => {
 const colors = {
 PUBLISHED: 'bg-green-500',
 DRAFT: 'bg-yellow-500', 
 ARCHIVED: 'bg-gray-500'
 };

 return (
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
 {showLabel && (
 <span className="text-sm text-gray-600 ">
 {status.toLowerCase()}
 </span>
 )}
 </div>
 );
};

export default StatusBadge;