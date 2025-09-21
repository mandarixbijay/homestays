// components/admin/blog/BlogViewPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Trash2, Eye, Share2, Calendar, Clock,
  User, Tag, Folder, Star, ExternalLink, Copy, CheckCircle,
  XCircle, Archive
} from 'lucide-react';

import {
  ActionButton,
  Card,
  Alert,
  LoadingSpinner,
  StatusBadge,
  useToast
} from '@/components/admin/AdminComponents';

import {
  useBlogDetail,
  useBlogs
} from '@/hooks/useCompleteBlogApi';

interface BlogViewPageProps {
  blogId: number;
}

export default function BlogViewPage({ blogId }: BlogViewPageProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const { blog, loading, loadBlog, error } = useBlogDetail(blogId);
  const { deleteBlog, updateBlog } = useBlogs();

  // State
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Effects
  useEffect(() => {
    loadBlog();
  }, [blogId]);

  // Handlers
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteBlog(blogId);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Blog deleted successfully'
      });
      router.push('/admin/blog');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete blog'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    setUpdating(true);
    try {
      await updateBlog(blogId, { status: newStatus });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog status updated to ${newStatus.toLowerCase()}`
      });
      await loadBlog(); // Reload to get updated data
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update blog status'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFeatured = async () => {
    setUpdating(true);
    try {
      await updateBlog(blogId, { featured: !blog?.featured });
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${blog?.featured ? 'removed from' : 'added to'} featured`
      });
      await loadBlog(); // Reload to get updated data
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update featured status'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyLink = () => {
    const blogUrl = `${window.location.origin}/blog/${blog?.slug}`;
    navigator.clipboard.writeText(blogUrl);
    addToast({
      type: 'success',
      title: 'Copied',
      message: 'Blog URL copied to clipboard'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'yellow';
      case 'ARCHIVED': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Error loading blog"
          message={error}
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Blog Not Found</h1>
          <p className="text-gray-600 mt-2">The requested blog could not be found.</p>
          <ActionButton
            onClick={() => router.push('/admin/blog')}
            className="mt-4"
          >
            Back to Blog Dashboard
          </ActionButton>
        </div>
      </div>
    );
  }

  const mainImage = blog.images?.find((img: { isMain?: boolean }) => img.isMain) || blog.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                variant="secondary"
                onClick={() => router.push('/admin/blog')}
              >
                <ArrowLeft className="h-4 w-4" />
              </ActionButton>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {blog.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>By {blog.author.name}</span>
                  <span>•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{blog.viewCount || 0} views</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </ActionButton>
              
              <ActionButton
                variant="primary"
                onClick={() => router.push(`/admin/blog/${blogId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </ActionButton>

              <ActionButton
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image */}
            {mainImage && (
              <Card>
                <div className="p-0">
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || blog.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {mainImage.caption && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {mainImage.caption}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Blog Header */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <StatusBadge 
                      status={blog.status} 
                    />
                    {blog.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {blog.status === 'DRAFT' && (
                      <ActionButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusChange('PUBLISHED')}
                        loading={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publish
                      </ActionButton>
                    )}
                    
                    {blog.status === 'PUBLISHED' && (
                      <ActionButton
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange('DRAFT')}
                        loading={updating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Unpublish
                      </ActionButton>
                    )}
                    
                    <ActionButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange('ARCHIVED')}
                      loading={updating}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </ActionButton>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {blog.title}
                </h1>

                {blog.excerpt && (
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {blog.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {blog.author.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {blog.publishedAt ? 
                        new Date(blog.publishedAt).toLocaleDateString() : 
                        'Not published'
                      }
                    </div>
                    {blog.readTime && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {blog.readTime} min read
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {blog.viewCount || 0} views
                  </div>
                </div>
              </div>
            </Card>

            {/* Blog Content */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Content
                </h2>
                
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </Card>

            {/* Additional Images */}
            {blog.images && blog.images.length > 1 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Gallery
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {blog.images
                      .filter((img: { isMain?: boolean }) => !img.isMain)
                      .map(
                        (
                          image: { id: number; url: string; alt?: string; caption?: string },
                          index: number
                        ) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt={image.alt || `Gallery image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {image.caption && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {image.caption}
                              </p>
                            )}
                          </div>
                        )
                      )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <ActionButton
                    fullWidth
                    variant="primary"
                    onClick={() => router.push(`/admin/blog/${blogId}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Blog
                  </ActionButton>
                  
                  <ActionButton
                    fullWidth
                    variant="secondary"
                    onClick={handleToggleFeatured}
                    loading={updating}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {blog.featured ? 'Remove from Featured' : 'Add to Featured'}
                  </ActionButton>
                  
                  <ActionButton
                    fullWidth
                    variant="secondary"
                    onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Blog
                  </ActionButton>
                </div>
              </div>
            </Card>

            {/* Blog Details */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <StatusBadge 
                      status={blog.status} 
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Author:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.author.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(blog.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {blog.publishedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Published:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.viewCount || 0}
                    </span>
                  </div>
                  
                  {blog.readTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Read Time:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {blog.readTime} minutes
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Featured:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tags
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: { id: number; name: string; color?: string }) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Categories
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {blog.categories.map((category: { id: number; name: string; color?: string }) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        style={{ backgroundColor: category.color ? `${category.color}20` : undefined }}
                      >
                        <Folder className="h-3 w-3 mr-1" />
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* SEO Info */}
            {(blog.seoTitle || blog.seoDescription) && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    SEO Information
                  </h3>
                  
                  <div className="space-y-3">
                    {blog.seoTitle && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">SEO Title:</label>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {blog.seoTitle}
                        </p>
                      </div>
                    )}
                    
                    {blog.seoDescription && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Meta Description:</label>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {blog.seoDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}