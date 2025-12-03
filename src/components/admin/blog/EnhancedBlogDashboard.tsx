// Enhanced Complete Blog Dashboard Component with Pagination & Advanced Features
// File: components/admin/blog/EnhancedBlogDashboard.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  PenTool, Eye, Plus, Search, Filter, Download, RefreshCw,
  TrendingUp, FileText, Users, Calendar, Star, BarChart3,
  Edit, Trash2, ExternalLink, Tag, Folder, Clock, Image,
  CheckCircle, XCircle, AlertCircle, Settings, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, MoreVertical,
  Copy, Archive, Send, Globe, Grid, List, SortAsc, SortDesc,
  X, Zap, TrendingDown
} from 'lucide-react';

import {
  LoadingSpinner,
  Alert,
  ActionButton,
  Card,
  StatusBadge,
  SearchInput,
  useToast,
  EmptyState
} from '@/components/admin/AdminComponents';

import {
  useBlogs,
  useBlogStats,
  useBlogFilters,
  useTags,
  useCategories,
  useBlogExport
} from '@/hooks/useCompleteBlogApi';

// ============================================================================
// TYPES
// ============================================================================

interface BlogStatsType {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalViews: number;
  totalTags: number;
  totalCategories: number;
  featuredBlogs: number;
  mostViewedBlogs: Array<{
    id: number;
    title: string;
    slug: string;
    viewCount: number;
  }>;
  recentBlogs: Array<{
    id: number;
    title: string;
    slug: string;
    publishedAt: string;
  }>;
}

type ViewMode = 'grid' | 'list';
type SortField = 'createdAt' | 'updatedAt' | 'title' | 'viewCount';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// ENHANCED PAGINATION COMPONENT
// ============================================================================

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  loading?: boolean;
}> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      {/* Items per page selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          disabled={loading}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          per page
        </span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED STATS CARD
// ============================================================================

const EnhancedStatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  loading?: boolean;
}> = ({ title, value, icon, color, trend, onClick, loading = false }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
  };

  const bgGradients = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20',
    green: 'from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/20',
    yellow: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-800/20',
    red: 'from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/20',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20',
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/20'
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1' : ''}`}
    >
      <Card 
        className={`relative overflow-hidden`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradients[color]} opacity-50`}></div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
              )}
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">{Math.abs(trend.value)}%</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-xl ${colorClasses[color]} shadow-lg`}>
              {icon}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// ADVANCED FILTER SIDEBAR
// ============================================================================

const FilterSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  tags: any[];
  categories: any[];
  onApply: () => void;
  onReset: () => void;
}> = ({ isOpen, onClose, filters, onFilterChange, tags, categories, onApply, onReset }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Options */}
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured
              </label>
              <select
                value={filters.featured === undefined ? '' : filters.featured.toString()}
                onChange={(e) => onFilterChange('featured', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Blogs</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => onFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tag
              </label>
              <select
                value={filters.tagId || ''}
                onChange={(e) => onFilterChange('tagId', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange('dateTo', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// BULK ACTIONS BAR
// ============================================================================

const BulkActionsBar: React.FC<{
  selectedCount: number;
  onAction: (action: string) => void;
  onClearSelection: () => void;
}> = ({ selectedCount, onAction, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="shadow-2xl border-2 border-blue-500 dark:border-blue-600">
        <div className="flex items-center space-x-4 px-6 py-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} selected
          </span>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAction('publish')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
            >
              <Send className="h-4 w-4 mr-1" />
              Publish
            </button>
            
            <button
              onClick={() => onAction('draft')}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Draft
            </button>
            
            <button
              onClick={() => onAction('archive')}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </button>
            
            <button
              onClick={() => onAction('delete')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// ENHANCED BLOG CARD - LIST VIEW
// ============================================================================

const BlogListItem: React.FC<{
  blog: any;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}> = ({ blog, isSelected, onSelect, onView, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
  const [showActions, setShowActions] = useState(false);
  // Support both featuredImage (thumbnails API) and images array (full blog)
  const mainImageUrl = blog.featuredImage || blog.images?.find((img: any) => img.isMain)?.url || blog.images?.[0]?.url;

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'DRAFT': return 'PUBLISHED';
      case 'PUBLISHED': return 'ARCHIVED';
      case 'ARCHIVED': return 'DRAFT';
      default: return 'PUBLISHED';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'border-blue-500 dark:border-blue-600 shadow-md' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center p-3 sm:p-4 space-x-2 sm:space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(blog.id)}
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
          />
        </div>

        {/* Image */}
        <div className="hidden sm:block flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
          {mainImageUrl ? (
            <img
              src={mainImageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}>
            <Image className="h-8 w-8 text-gray-400" aria-hidden="true" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 sm:truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {blog.title}
              </h3>

              <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {blog.excerpt || 'No excerpt available'}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{blog.author?.name || 'Unknown'}</span>
                </div>

                <div className="hidden sm:flex items-center space-x-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{formatDate(blog.publishedAt || blog.updatedAt || blog.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3 flex-shrink-0" />
                  <span>{(blog.viewCount || 0).toLocaleString()}</span>
                </div>

                {blog.readTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{blog.readTime}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges & Actions */}
            <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
              <StatusBadge status={blog.status} />
              {blog.featured && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <Star className="h-3 w-3 sm:mr-1 fill-current" />
                  <span className="hidden sm:inline">Featured</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>

          {/* Actions Dropdown */}
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                <button
                  onClick={() => {
                    onView(blog.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                
                <button
                  onClick={() => {
                    onEdit(blog.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={() => {
                    onDuplicate(blog.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </button>
                
                <button
                  onClick={() => {
                    onToggleStatus(blog.id, getNextStatus(blog.status));
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {blog.status === 'PUBLISHED' ? (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <button
                  onClick={() => {
                    onDelete(blog.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED BLOG CARD - GRID VIEW
// ============================================================================

const BlogGridItem: React.FC<{
  blog: any;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}> = ({ blog, isSelected, onSelect, onView, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
  const [showActions, setShowActions] = useState(false);
  // Support both featuredImage (thumbnails API) and images array (full blog)
  const mainImageUrl = blog.featuredImage || blog.images?.find((img: any) => img.isMain)?.url || blog.images?.[0]?.url;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
      isSelected ? 'border-blue-500 dark:border-blue-600 shadow-lg' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(blog.id)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer shadow-lg"
        />
      </div>

      {/* Actions Menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVertical className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        {showActions && (
          <>
            <div 
              className="fixed inset-0 z-20"
              onClick={() => setShowActions(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-30">
              <button
                onClick={() => {
                  onView(blog.id);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
              
              <button
                onClick={() => {
                  onEdit(blog.id);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={() => {
                  onDuplicate(blog.id);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={() => {
                  onDelete(blog.id);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image */}
      <div
        className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 cursor-pointer overflow-hidden"
        onClick={() => onView(blog.id)}
      >
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}>
          <Image className="h-16 w-16 text-gray-400" aria-hidden="true" />
        </div>
        
        {/* Overlay badges */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <StatusBadge status={blog.status} />
          {blog.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 shadow-lg">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3
          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => onView(blog.id)}
        >
          {blog.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
          {blog.excerpt || 'No excerpt available'}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{blog.author?.name || 'Unknown'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3 flex-shrink-0" />
            <span>{(blog.viewCount || 0).toLocaleString()}</span>
          </div>

          {blog.readTime && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{blog.readTime}m</span>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{formatDate(blog.publishedAt || blog.updatedAt || blog.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ENHANCED BLOG DASHBOARD
// ============================================================================

export default function EnhancedBlogDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  // Hooks
  const {
    blogs,
    totalPages,
    total,
    loading: blogsLoading,
    error: blogsError,
    loadBlogs,
    deleteBlog,
    updateBlog,
    bulkBlogActions,
    clearError
  } = useBlogs();

  const {
    stats,
    loading: statsLoading,
    loadBlogStats
  } = useBlogStats();

  const { tags, loadTags } = useTags();
  const { categories, loadCategories } = useCategories();
  const { exportBlogs, loading: exportLoading } = useBlogExport();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial data
  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  // Load blogs when filters/page changes
  useEffect(() => {
    if (status === 'authenticated') {
      loadBlogsData();
    }
  }, [currentPage, itemsPerPage, debouncedSearch, filters, sortField, sortOrder]);

  // Data loading
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadBlogStats(),
        loadTags(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadBlogStats, loadTags, loadCategories, addToast]);

  const loadBlogsData = useCallback(async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      await loadBlogs(params);
    } catch (error) {
      console.error('Error loading blogs:', error);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, filters, loadBlogs]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    await Promise.all([loadDashboardData(), loadBlogsData()]);
    addToast({
      type: 'success',
      title: 'Refreshed',
      message: 'Dashboard updated successfully'
    });
  }, [loadDashboardData, loadBlogsData, addToast]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedBlogs([]); // Clear selection on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setSelectedBlogs([]);
  }, []);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    loadBlogsData();
  }, [loadBlogsData]);

  const handleDeleteBlog = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBlog(id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Blog deleted successfully'
      });
      setSelectedBlogs(prev => prev.filter(blogId => blogId !== id));
      await loadBlogsData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete blog'
      });
    }
  }, [deleteBlog, addToast, loadBlogsData]);

  const handleToggleStatus = useCallback(async (id: number, newStatus: string) => {
    try {
      await updateBlog(id, { status: newStatus as any });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog status updated to ${newStatus.toLowerCase()}`
      });
      await loadBlogsData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update blog status'
      });
    }
  }, [updateBlog, addToast, loadBlogsData]);

  const handleDuplicateBlog = useCallback(async (id: number) => {
    try {
      // Find the blog to duplicate
      const blogToDuplicate = blogs.find(b => b.id === id);
      if (!blogToDuplicate) return;

      // Navigate to create page with prefilled data (you'll need to implement this)
      router.push(`/admin/blog/create?duplicate=${id}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to duplicate blog'
      });
    }
  }, [blogs, router, addToast]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedBlogs.length === 0) return;

    const actionMap: Record<string, 'publish' | 'draft' | 'archive' | 'delete'> = {
      publish: 'publish',
      draft: 'draft',
      archive: 'archive',
      delete: 'delete'
    };

    const mappedAction = actionMap[action];
    if (!mappedAction) return;

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedBlogs.length} blog(s)? This action cannot be undone.`)) {
        return;
      }
    }

    try {
      await bulkBlogActions(selectedBlogs, mappedAction);
      addToast({
        type: 'success',
        title: 'Success',
        message: `Successfully ${action}ed ${selectedBlogs.length} blog(s)`
      });
      setSelectedBlogs([]);
      await loadBlogsData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${action} blogs`
      });
    }
  }, [selectedBlogs, bulkBlogActions, addToast, loadBlogsData]);

  const handleSelectBlog = useCallback((id: number) => {
    setSelectedBlogs(prev => 
      prev.includes(id) 
        ? prev.filter(blogId => blogId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBlogs.length === blogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(blogs.map(b => b.id));
    }
  }, [selectedBlogs, blogs]);

  const handleExport = useCallback(async () => {
    try {
      await exportBlogs({
        format: 'csv',
        ...filters
      });
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Blogs exported successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to export blogs'
      });
    }
  }, [exportBlogs, filters, addToast]);

  // Calculate stats
  const statsData: BlogStatsType = stats || {
    totalBlogs: total,
    publishedBlogs: blogs.filter(b => b.status === 'PUBLISHED').length,
    draftBlogs: blogs.filter(b => b.status === 'DRAFT').length,
    archivedBlogs: blogs.filter(b => b.status === 'ARCHIVED').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0),
    totalTags: tags.length,
    totalCategories: categories.length,
    featuredBlogs: blogs.filter(b => b.featured).length,
    mostViewedBlogs: [],
    recentBlogs: []
  };

  // Check for active filters
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '') || searchTerm !== '';

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading blog dashboard..." />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Blog Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {total} total blog{total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exportLoading}
                disabled={blogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                loading={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </ActionButton>

              <ActionButton
                variant="primary"
                onClick={() => router.push('/admin/blog/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {blogsError && (
          <Alert
            type="error"
            title="Error loading blogs"
            message={blogsError}
            className="mb-6"
            onClose={clearError}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EnhancedStatCard
            title="Total Blogs"
            value={statsData.totalBlogs}
            icon={<FileText className="h-7 w-7" />}
            color="blue"
            loading={statsLoading}
          />
          <EnhancedStatCard
            title="Published"
            value={statsData.publishedBlogs}
            icon={<CheckCircle className="h-7 w-7" />}
            color="green"
            loading={statsLoading}
            onClick={() => handleFilterChange('status', 'PUBLISHED')}
          />
          <EnhancedStatCard
            title="Drafts"
            value={statsData.draftBlogs}
            icon={<Edit className="h-7 w-7" />}
            color="yellow"
            loading={statsLoading}
            onClick={() => handleFilterChange('status', 'DRAFT')}
          />
          <EnhancedStatCard
            title="Total Views"
            value={statsData.totalViews.toLocaleString()}
            icon={<Eye className="h-7 w-7" />}
            color="purple"
            loading={statsLoading}
          />
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search blogs by title, excerpt, or author..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Filter Button */}
              <ActionButton
                variant="secondary"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                  </span>
                )}
              </ActionButton>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <ActionButton
                  variant="secondary"
                  onClick={handleResetFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </ActionButton>
              )}
            </div>

            {/* Select All */}
            {blogs.length > 0 && (
              <div className="flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBlogs.length === blogs.length && blogs.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Select all on this page ({blogs.length})
                  </span>
                </label>
                {selectedBlogs.length > 0 && (
                  <span className="ml-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {selectedBlogs.length} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Blogs List/Grid */}
        {blogsLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading blogs..." />
          </div>
        ) : blogs.length === 0 ? (
          <Card className="py-20">
            <EmptyState
              title={hasActiveFilters ? "No blogs found" : "No blogs yet"}
              description={
                hasActiveFilters 
                  ? "Try adjusting your filters or search term"
                  : "Create your first blog post to get started"
              }
              action={{
                label: hasActiveFilters ? "Clear Filters" : "Create Blog",
                onClick: hasActiveFilters ? handleResetFilters : () => router.push('/admin/blog/create')
              }}
            />
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'
                : 'space-y-4 p-6'
              }>
                {blogs.map((blog) => (
                  viewMode === 'grid' ? (
                    <BlogGridItem
                      key={blog.id}
                      blog={blog}
                      isSelected={selectedBlogs.includes(blog.id)}
                      onSelect={handleSelectBlog}
                      onView={(id) => router.push(`/admin/blog/${id}`)}
                      onEdit={(id) => router.push(`/admin/blog/${id}/edit`)}
                      onDelete={handleDeleteBlog}
                      onDuplicate={handleDuplicateBlog}
                      onToggleStatus={handleToggleStatus}
                    />
                  ) : (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      isSelected={selectedBlogs.includes(blog.id)}
                      onSelect={handleSelectBlog}
                      onView={(id) => router.push(`/admin/blog/${id}`)}
                      onEdit={(id) => router.push(`/admin/blog/${id}/edit`)}
                      onDelete={handleDeleteBlog}
                      onDuplicate={handleDuplicateBlog}
                      onToggleStatus={handleToggleStatus}
                    />
                  )
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  loading={blogsLoading}
                />
              )}
            </Card>
          </>
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        tags={tags}
        categories={categories}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedBlogs.length}
        onAction={handleBulkAction}
        onClearSelection={() => setSelectedBlogs([])}
      />
    </div>
  );
}