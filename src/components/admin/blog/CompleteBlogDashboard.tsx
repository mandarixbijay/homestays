// Complete Blog Dashboard Component with all integrations
// File: components/admin/blog/CompleteBlogDashboard.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  PenTool, Eye, Plus, Search, Filter, Download, RefreshCw,
  TrendingUp, FileText, Users, Calendar, Star, BarChart3,
  Edit, Trash2, ExternalLink, Tag, Folder, Clock, Image,
  CheckCircle, XCircle, AlertCircle, Settings
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

// ============================================================================
// BLOG STATS CARDS
// ============================================================================

const BlogStatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
  loading?: boolean;
}> = ({ title, value, icon, color, onClick, loading = false }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1' : ''}`}
    >
      <div
        className="flex items-center justify-between"
        {...(onClick ? { onClick } : {})}
        style={onClick ? { cursor: 'pointer' } : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        onKeyPress={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      >
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// QUICK ACTIONS SECTION
// ============================================================================

const QuickActions: React.FC<{
  onAction: (action: string) => void;
}> = ({ onAction }) => {
  const actions = [
    {
      key: 'create-blog',
      title: 'Create New Blog',
      description: 'Write a new blog post',
      icon: <PenTool className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      key: 'manage-tags',
      title: 'Manage Tags',
      description: 'Organize blog tags',
      icon: <Tag className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      key: 'manage-categories',
      title: 'Categories',
      description: 'Manage blog categories',
      icon: <Folder className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      key: 'blog-analytics',
      title: 'Analytics',
      description: 'View blog performance',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <div
          key={action.key}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          onClick={() => onAction(action.key)}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${action.color}`}>
              {action.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{action.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// BLOG CARD COMPONENT
// ============================================================================

const BlogCard: React.FC<{
  blog: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}> = ({ blog, onView, onEdit, onDelete, onToggleStatus }) => {
  const mainImage = blog.images?.find((img: any) => img.isMain) || blog.images?.[0];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'yellow';
      case 'ARCHIVED': return 'red';
      default: return 'gray';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'DRAFT': return 'PUBLISHED';
      case 'PUBLISHED': return 'ARCHIVED';
      case 'ARCHIVED': return 'DRAFT';
      default: return 'PUBLISHED';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={mainImage.alt || blog.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-l-lg">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {blog.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {blog.excerpt || 'No excerpt available'}
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                <StatusBadge status={blog.status} />
                {blog.featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {blog.viewCount || 0} views
                </span>
              </div>

              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>By {blog.author?.name || 'Unknown'}</span>
                <span>•</span>
                <span>
                  {blog.status === 'PUBLISHED' ? 'Published' : 'Updated'} {' '}
                  {new Date(blog.publishedAt || blog.updatedAt || blog.createdAt).toLocaleDateString()}
                </span>
                {blog.readTime && (
                  <>
                    <span>•</span>
                    <span>{blog.readTime} min read</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => onView(blog.id)}
              >
                <Eye className="h-4 w-4" />
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => onEdit(blog.id)}
              >
                <Edit className="h-4 w-4" />
              </ActionButton>

              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => onToggleStatus(blog.id, getNextStatus(blog.status))}
              >
                {blog.status === 'PUBLISHED' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </ActionButton>

              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => onDelete(blog.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// RECENT BLOGS LIST
// ============================================================================

const RecentBlogsList: React.FC<{
  blogs: any[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}> = ({ blogs, loading, onView, onEdit, onDelete, onToggleStatus }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <EmptyState
        title="No blogs found"
        description="Create your first blog post to get started"
        action={{
          label: "Create Blog",
          onClick: () => onEdit(0) // Using 0 as create new indicator
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

// ============================================================================
// MAIN BLOG DASHBOARD COMPONENT
// ============================================================================

export default function CompleteBlogDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  // Hooks
  const {
    blogs,
    loading: blogsLoading,
    error: blogsError,
    loadBlogs,
    deleteBlog,
    updateBlog,
    clearError
  } = useBlogs();

  const {
    stats,
    loading: statsLoading,
    loadBlogStats
  } = useBlogStats();

  const { filters, updateFilter } = useBlogFilters();
  const { exportBlogs, loading: exportLoading } = useBlogExport();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Effects
  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  // Data loading
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadBlogs({ limit: 50 }), // Load more for dashboard
        loadBlogStats()
      ]);
    } catch (error) {
      console.error('Error loading blog dashboard data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load blog dashboard data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadBlogs, loadBlogStats, addToast]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    await loadDashboardData();
    addToast({
      type: 'success',
      title: 'Refreshed',
      message: 'Blog dashboard updated'
    });
  }, [loadDashboardData, addToast]);

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
      await loadBlogs({ limit: 50 }); // Reload blogs
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete blog'
      });
    }
  }, [deleteBlog, addToast, loadBlogs]);

  const handleToggleStatus = useCallback(async (id: number, newStatus: string) => {
    try {
      await updateBlog(id, { status: newStatus as any });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog status updated to ${newStatus.toLowerCase()}`
      });
      await loadBlogs({ limit: 50 }); // Reload blogs
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update blog status'
      });
    }
  }, [updateBlog, addToast, loadBlogs]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'create-blog':
        router.push('/admin/blog/create');
        break;
      case 'manage-tags':
        router.push('/admin/blog/tags');
        break;
      case 'manage-categories':
        router.push('/admin/blog/categories');
        break;
      case 'blog-analytics':
        router.push('/admin/blog/analytics');
        break;
      default:
        break;
    }
  }, [router]);

  const handleExport = useCallback(async () => {
    try {
      await exportBlogs({
        format: 'csv',
        status: (statusFilter as 'PUBLISHED' | 'ARCHIVED' | 'DRAFT' | undefined) || undefined
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
  }, [exportBlogs, statusFilter, addToast]);

  // Filter blogs based on search and status
  const filteredBlogs = blogs.filter((blog: any) => {
    const matchesSearch = searchTerm === '' || 
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const statsData: BlogStatsType = stats || {
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter(b => b.status === 'PUBLISHED').length,
    draftBlogs: blogs.filter(b => b.status === 'DRAFT').length,
    archivedBlogs: blogs.filter(b => b.status === 'ARCHIVED').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0),
    totalTags: 0,
    totalCategories: 0,
    featuredBlogs: blogs.filter(b => b.featured).length,
    mostViewedBlogs: [],
    recentBlogs: []
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog dashboard..." />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Blog Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your blog content and analytics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={handleExport}
                loading={exportLoading}
                disabled={blogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={handleRefresh}
                loading={refreshing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BlogStatCard
            title="Total Blogs"
            value={statsData.totalBlogs}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
            loading={statsLoading}
          />
          <BlogStatCard
            title="Published"
            value={statsData.publishedBlogs}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            loading={statsLoading}
            onClick={() => setStatusFilter('PUBLISHED')}
          />
          <BlogStatCard
            title="Drafts"
            value={statsData.draftBlogs}
            icon={<Edit className="h-6 w-6" />}
            color="yellow"
            loading={statsLoading}
            onClick={() => setStatusFilter('DRAFT')}
          />
          <BlogStatCard
            title="Total Views"
            value={statsData.totalViews.toLocaleString()}
            icon={<Eye className="h-6 w-6" />}
            color="purple"
            loading={statsLoading}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <QuickActions onAction={handleQuickAction} />
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search blogs..."
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                
                {(searchTerm || statusFilter) && (
                  <ActionButton
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                    }}
                  >
                    Clear Filters
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Blogs List */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Blogs ({filteredBlogs.length})
              </h2>
              
              <div className="flex items-center space-x-2">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/admin/blog')}
                >
                  View All
                  <ExternalLink className="h-4 w-4 ml-2" />
                </ActionButton>
              </div>
            </div>

            <RecentBlogsList
              blogs={filteredBlogs.slice(0, 10)} // Show first 10 blogs
              loading={blogsLoading}
              onView={(id) => router.push(`/admin/blog/${id}`)}
              onEdit={(id) => router.push(id === 0 ? '/admin/blog/create' : `/admin/blog/${id}/edit`)}
              onDelete={handleDeleteBlog}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}