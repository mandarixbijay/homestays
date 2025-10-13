// src/components/admin/blog/EnhancedBlogEditForm.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save, Eye, Trash2, Star, ArrowLeft, AlertCircle, Check,
  Globe, Clock, X, Archive
} from 'lucide-react';

import {
  Input,
  TextArea,
  ActionButton,
  Card,
  Alert,
  LoadingSpinner,
  useToast,
  Modal
} from '@/components/admin/AdminComponents';

import { 
  blogApi, 
  UpdateBlogData, 
  Tag as BlogTag, 
  Category, 
  BlogImage,
  Blog
} from '@/lib/api/completeBlogApi';

import {
  generateSlug,
  calculateReadTime,
  validateForm as validateFormData,
  blogFormValidationSchema
} from '@/utils/blogEditorUtils';

import { UrlPreview } from '@/components/admin/blog/UrlPreview';
import { StatusBadge } from '@/components/admin/blog/StatusBadge';

// Import the enhanced components from shared file
import { 
  EnhancedRichTextEditor,
  EnhancedCategoryTagManager,
  SEOOptimizer,
  AutoSaveIndicator,
  EnhancedImageUploader
} from './EnhancedBlogComponents';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  tagIds: number[];
  categoryIds: number[];
  images: BlogImage[];
}

interface FormErrors {
  [key: string]: string;
}

interface EnhancedBlogEditFormProps {
  blogId: number;
}

export default function EnhancedBlogEditForm({ blogId }: EnhancedBlogEditFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'DRAFT',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    tagIds: [],
    categoryIds: [],
    images: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load blog data
  useEffect(() => {
    loadBlogData();
    loadTagsAndCategories();
  }, [blogId]);

  // Track changes
  useEffect(() => {
    if (blog) {
      setHasChanges(true);
    }
  }, [formData]);

  // Check slug availability when slug changes
  useEffect(() => {
    if (formData.slug && formData.slug !== blog?.slug && formData.slug.length > 2) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(formData.slug);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSlugAvailable(null);
    }
  }, [formData.slug, blog?.slug]);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      const blogData = await blogApi.getBlog(blogId);
      setBlog(blogData);
      
      setFormData({
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt || '',
        content: blogData.content || '',
        featuredImage: blogData.featuredImage || '',
        status: blogData.status,
        featured: blogData.featured,
        seoTitle: blogData.seoTitle || '',
        seoDescription: blogData.seoDescription || '',
        tagIds: blogData.tags?.map(t => t.id) || [],
        categoryIds: blogData.categories?.map(c => c.id) || [],
        images: blogData.images || []
      });
    } catch (error: any) {
      console.error('Error loading blog:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load blog data'
      });
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const loadTagsAndCategories = async () => {
    try {
      const [tagsData, categoriesData] = await Promise.all([
        blogApi.getTags(),
        blogApi.getCategories()
      ]);
      setTags(tagsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading tags/categories:', error);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    setSlugChecking(true);
    try {
      // Call a backend endpoint that returns JSON like: { available: boolean }
      const res = await fetch(`/api/admin/blogs/check-slug?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error('Failed to check slug availability');
      }
      const data = await res.json();
      const isAvailable = typeof data?.available === 'boolean' ? data.available : null;
      setSlugAvailable(isAvailable);
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await blogApi.uploadImage(file);
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateFormData(formData, blogFormValidationSchema);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before submitting'
      });
      return false;
    }

    if (slugAvailable === false && formData.slug !== blog?.slug) {
      setErrors({ slug: 'This slug is already taken' });
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'The slug is already taken'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const featuredImage = formData.images.find(img => img.isMain)?.url || formData.images[0]?.url || '';
      
      const updateData: UpdateBlogData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage,
        status: status || formData.status,
        featured: formData.featured,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        readTime: calculateReadTime(formData.content),
        tagIds: formData.tagIds,
        categoryIds: formData.categoryIds,
        images: formData.images
      };

      await blogApi.updateBlog(blogId, updateData);
      
      setLastSaved(new Date());
      setHasChanges(false);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${status === 'PUBLISHED' ? 'published' : status === 'ARCHIVED' ? 'archived' : 'updated'} successfully!`
      });

      if (status) {
        router.push('/admin/blog');
      } else {
        loadBlogData(); // Reload to get updated data
      }
    } catch (error: any) {
      console.error('Error updating blog:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update blog'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await blogApi.deleteBlog(blogId);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Blog deleted successfully'
      });
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete blog'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Blog Not Found"
          message="The requested blog post could not be found."
        />
      </div>
    );
  }

  const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  const readTime = calculateReadTime(formData.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/blog')}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Blog Post
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {blog.title} • {wordCount} words • {readTime} min read
                </p>
              </div>
              <StatusBadge status={formData.status} />
              <AutoSaveIndicator lastSaved={lastSaved} saving={autoSaving} />
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                icon={<Eye className="h-4 w-4" />}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </ActionButton>
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => handleSubmit('DRAFT')}
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                Save Draft
              </ActionButton>
              {formData.status === 'PUBLISHED' && (
                <ActionButton
                  variant="warning"
                  onClick={() => handleSubmit('ARCHIVED')}
                  loading={saving}
                  icon={<Archive className="h-4 w-4" />}
                >
                  Archive
                </ActionButton>
              )}
              <ActionButton
                variant="success"
                onClick={() => handleSubmit('PUBLISHED')}
                loading={saving}
                disabled={slugAvailable === false && formData.slug !== blog.slug}
                icon={<Globe className="h-4 w-4" />}
              >
                {formData.status === 'PUBLISHED' ? 'Update' : 'Publish'}
              </ActionButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasChanges && (
          <Alert
            type="warning"
            message="You have unsaved changes"
            className="mb-6"
          />
        )}

        {showPreview ? (
          /* Preview Mode */
          <Card className="shadow-lg">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h1>{formData.title}</h1>
              {formData.images.find(img => img.isMain) && (
                <img 
                  src={formData.images.find(img => img.isMain)?.url} 
                  alt="Featured" 
                  className="w-full h-96 object-cover rounded-lg mb-6" 
                />
              )}
              <p className="text-lg text-gray-600 dark:text-gray-400">{formData.excerpt}</p>
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              
              <div className="mt-8 flex flex-wrap gap-3">
                {formData.categoryIds.map(id => {
                  const cat = categories.find(c => c.id === id);
                  return cat ? (
                    <span key={id} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {cat.name}
                    </span>
                  ) : null;
                })}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.tagIds.map(id => {
                  const tag = tags.find(t => t.id === id);
                  return tag ? (
                    <span key={id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      #{tag.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </Card>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card title="Basic Information" className="shadow-sm">
                <div className="space-y-4">
                  <Input
                    label="Blog Title"
                    value={formData.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      handleInputChange('title', e.target.value)
                    }
                    placeholder="Enter an engaging blog title..."
                    error={errors.title}
                    required
                    className="text-lg font-medium"
                  />

                  <div>
                    <Input
                      label="URL Slug"
                      value={formData.slug}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('slug', e.target.value)
                      }
                      placeholder="url-friendly-slug"
                      error={errors.slug}
                      required
                    />
                    <UrlPreview
                      slug={formData.slug}
                      available={slugAvailable}
                      checking={slugChecking}
                    />
                  </div>

                  <TextArea
                    label="Excerpt"
                    value={formData.excerpt}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                      handleInputChange('excerpt', e.target.value)
                    }
                    placeholder="Write a compelling excerpt (10-300 characters)..."
                    rows={3}
                    error={errors.excerpt}
                    required
                    hint={`${formData.excerpt.length}/300 characters`}
                  />
                </div>
              </Card>

              {/* Content Editor Card */}
              <Card title="Blog Content" className="shadow-sm">
                <EnhancedRichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  onImageUpload={handleImageUpload}
                  placeholder="Continue writing your amazing blog post..."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.content}
                  </p>
                )}
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card title="Publishing Options" className="shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Star className="h-4 w-4" />
                      Featured Post
                    </label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Reading Time</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {readTime} min read
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span className="font-medium">{new Date(blog.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {blog.author && (
                        <div className="flex justify-between">
                          <span>Author:</span>
                          <span className="font-medium">{blog.author.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Image Gallery */}
              <Card title="Blog Images" className="shadow-sm">
                <EnhancedImageUploader
                  images={formData.images}
                  onChange={(images) => handleInputChange('images', images)}
                  onUpload={handleImageUpload}
                  maxImages={5}
                />
              </Card>

              {/* Categories & Tags */}
              <Card title="Categories & Tags" className="shadow-sm">
                <EnhancedCategoryTagManager
                  selectedCategories={formData.categoryIds}
                  selectedTags={formData.tagIds}
                  availableCategories={categories}
                  availableTags={tags}
                  onCategoriesChange={(ids) => handleInputChange('categoryIds', ids)}
                  onTagsChange={(ids) => handleInputChange('tagIds', ids)}
                />
              </Card>

              {/* SEO Optimization */}
              <SEOOptimizer
                seoTitle={formData.seoTitle}
                seoDescription={formData.seoDescription}
                onSeoTitleChange={(value) => handleInputChange('seoTitle', value)}
                onSeoDescriptionChange={(value) => handleInputChange('seoDescription', value)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          title="Delete Blog Post"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-4">
            <Alert
              type="warning"
              message="This action cannot be undone. Are you sure you want to delete this blog post?"
            />
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{blog.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Created on {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={handleDelete}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete Permanently
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}