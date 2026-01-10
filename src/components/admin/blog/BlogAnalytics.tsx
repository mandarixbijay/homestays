// components/admin/blog/BlogAnalytics.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, TrendingUp, Eye, Calendar, Clock, FileText,
  Users, Tag, Folder, Star, BarChart3, PieChart, Activity,
  Download, RefreshCw, Filter, ChevronDown, ExternalLink
} from 'lucide-react';

import {
  ActionButton,
  Card,
  LoadingSpinner,
  useToast
} from '@/components/admin/AdminComponents';

import {
  useBlogStats,
  useBlogs,
  useTags,
  useCategories
} from '@/hooks/useCompleteBlogApi';

// Mock chart component (you can replace with recharts or any chart library)
const SimpleBarChart: React.FC<{
  data: Array<{ name: string; value: number }>;
  height?: number;
}> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 truncate">
            {item.name}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6">
            <div
              className="bg-[#1A403D] h-6 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="text-xs text-white font-medium">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}> = ({ title, value, icon, color, trend, onClick }) => {
  return (
    <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''}`}>
      <div onClick={onClick} className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${trend.isPositive ? '' : 'transform rotate-180'}`} />
                {Math.abs(trend.value)}% {trend.isPositive ? 'increase' : 'decrease'}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function BlogAnalytics() {
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const { stats, loading: statsLoading, loadBlogStats } = useBlogStats();
  const { blogs, loadBlogs } = useBlogs();
  const { tags, loadTags } = useTags();
  const { categories, loadCategories } = useCategories();

  // State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Effects
  useEffect(() => {
    loadAllData();
  }, [timeRange]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadBlogStats(),
        loadBlogs({ limit: 100 }),
        loadTags(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      addToast({
        type: 'success',
        title: 'Refreshed',
        message: 'Analytics data updated'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh analytics data'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // Mock export functionality
    addToast({
      type: 'info',
      title: 'Export',
      message: 'Analytics export feature coming soon'
    });
  };

  // Calculate analytics data
  const totalViews = stats?.totalViews || 0;
  const totalBlogs = stats?.totalBlogs || 0;
  const publishedBlogs = stats?.publishedBlogs || 0;
  const draftBlogs = stats?.draftBlogs || 0;
  const featuredBlogs = stats?.featuredBlogs || 0;

  // Mock trending data (replace with real analytics)
  const viewsTrend = { value: 12.5, isPositive: true };
  const blogsTrend = { value: 8.3, isPositive: true };
  const publishTrend = { value: 15.2, isPositive: true };

  // Top performing blogs
  const topBlogs = stats?.mostViewedBlogs || [];

  // Blog status distribution
  const statusData = [
    { name: 'Published', value: publishedBlogs },
    { name: 'Drafts', value: draftBlogs },
    { name: 'Archived', value: stats?.archivedBlogs || 0 }
  ].filter(item => item.value > 0);

  // Tags usage (mock data based on available tags)
  const tagUsageData = tags.slice(0, 5).map(tag => ({
    name: tag.name,
    value: tag._count?.blogs || 0
  }));

  // Categories usage (mock data based on available categories)
  const categoryUsageData = categories.slice(0, 5).map(category => ({
    name: category.name,
    value: category._count?.blogs || 0
  }));

  // Recent activity (mock data)
  const recentActivity = [
    { action: 'Blog Published', title: 'Getting Started with React', time: '2 hours ago' },
    { action: 'Blog Updated', title: 'Advanced TypeScript Tips', time: '4 hours ago' },
    { action: 'Blog Created', title: 'New Draft Blog', time: '1 day ago' },
    { action: 'Category Added', title: 'Web Development', time: '2 days ago' },
    { action: 'Tag Created', title: 'JavaScript', time: '3 days ago' }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                variant="secondary"
                onClick={() => router.push('/admin/blog')}
              >
                <ArrowLeft className="h-4 w-4" />
              </ActionButton>

              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Blog Analytics
                </h1>
                <p className="text-sm text-gray-500">
                  Track your blog performance and insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm text-gray-900 focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <ActionButton
                variant="secondary"
                onClick={handleExport}
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={<Eye className="h-6 w-6" />}
            color="bg-blue-100 text-blue-600"
            trend={viewsTrend}
          />

          <StatCard
            title="Total Blogs"
            value={totalBlogs}
            icon={<FileText className="h-6 w-6" />}
            color="bg-green-100 text-green-600"
            trend={blogsTrend}
            onClick={() => router.push('/admin/blog')}
          />

          <StatCard
            title="Published"
            value={publishedBlogs}
            icon={<Activity className="h-6 w-6" />}
            color="bg-purple-100 text-purple-600"
            trend={publishTrend}
          />

          <StatCard
            title="Featured"
            value={featuredBlogs}
            icon={<Star className="h-6 w-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Blogs */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Performing Blogs
                </h3>
                <ActionButton
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push('/admin/blog')}
                >
                  <ExternalLink className="h-4 w-4" />
                </ActionButton>
              </div>
              
              {topBlogs.length > 0 ? (
                <div className="space-y-3">
                  {topBlogs.map((blog, index) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {blog.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            /{blog.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{blog.viewCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No view data available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Blog Status Distribution */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blog Status Distribution
              </h3>
              
              {statusData.length > 0 ? (
                <SimpleBarChart data={statusData} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No blog data available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Popular Tags */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Popular Tags
                </h3>
                <ActionButton
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push('/admin/blog/tags')}
                >
                  <Tag className="h-4 w-4" />
                </ActionButton>
              </div>
              
              {tagUsageData.length > 0 ? (
                <div className="space-y-3">
                  {tagUsageData.map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{tag.name}</span>
                      <span className="text-sm text-gray-500">{tag.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tags yet</p>
                </div>
              )}
            </div>
          </Card>

          {/* Popular Categories */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Popular Categories
                </h3>
                <ActionButton
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push('/admin/blog/categories')}
                >
                  <Folder className="h-4 w-4" />
                </ActionButton>
              </div>
              
              {categoryUsageData.length > 0 ? (
                <div className="space-y-3">
                  {categoryUsageData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No categories yet</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Performance */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Read Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((blogs.reduce((acc, blog) => acc + (blog.readTime || 0), 0) / Math.max(blogs.length, 1)) * 10) / 10} min
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Authors</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Set(blogs.map(blog => blog.author?.id)).size}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tags</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tags.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Categories</span>
                  <span className="text-sm font-medium text-gray-900">
                    {categories.length}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <ActionButton
                  fullWidth
                  variant="primary"
                  onClick={() => router.push('/admin/blog/create')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Blog
                </ActionButton>
                
                <ActionButton
                  fullWidth
                  variant="secondary"
                  onClick={() => router.push('/admin/blog')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Manage All Blogs
                </ActionButton>
                
                <ActionButton
                  fullWidth
                  variant="secondary"
                  onClick={() => router.push('/admin/blog/tags')}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Tags
                </ActionButton>
                
                <ActionButton
                  fullWidth
                  variant="secondary"
                  onClick={() => router.push('/admin/blog/categories')}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Manage Categories
                </ActionButton>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}