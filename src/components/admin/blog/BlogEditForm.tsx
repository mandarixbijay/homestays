// components/admin/blog/BlogEditForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save, X, Eye, Upload, Trash2, Star, Tag, Folder,
  Image as ImageIcon, FileText, Globe, Clock, ArrowLeft
} from 'lucide-react';

import {
  Input,
  TextArea,
  ActionButton,
  Card,
  Alert,
  LoadingSpinner,
  useToast
} from '@/components/admin/AdminComponents';

import {
  useBlogDetail,
  useBlogForm,
  useBlogImageManager,
  useRichTextEditor,
  useTags,
  useCategories,
  useBlogs
} from '@/hooks/useCompleteBlogApi';

interface BlogEditFormProps {
  blogId: number;
}

export default function BlogEditForm({ blogId }: BlogEditFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  // Hooks
  const { blog, loading: blogLoading, loadBlog, error: blogError } = useBlogDetail(blogId);
  const { updateBlog, loading: updateLoading } = useBlogs();
  const { tags, loadTags } = useTags();
  const { categories, loadCategories } = useCategories();
  
  const {
    formData,
    updateField,
    errors,
    validateForm,
    imageFiles,
    addImageFile,
    removeImageFile,
    setFormData
  } = useBlogForm();

  const { content, updateContent, readTime, setContent } = useRichTextEditor();

  // State
  const [saving, setSaving] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Effects
  useEffect(() => {
    loadBlog();
    loadTags();
    loadCategories();
  }, [blogId]);

  // Load blog data into form when blog is loaded
  useEffect(() => {
    if (blog && !initialLoadComplete) {
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        content: blog.content,
        featuredImage: blog.featuredImage || '',
        images: blog.images?.map((img: { id: number; url: string; alt?: string; caption?: string; isMain?: boolean }) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || '',
          caption: img.caption || '',
          isMain: typeof img.isMain === 'boolean' ? img.isMain : false,
          isNew: false
        })) || [],
        tagIds: blog.tags?.map((tag: { id: number }) => tag.id) || [],
        categoryIds: blog.categories?.map((cat: { id: number }) => cat.id) || [],
        authorId: blog.author.id,
        status: blog.status,
        seoTitle: blog.seoTitle || '',
        seoDescription: blog.seoDescription || '',
        readTime: blog.readTime || 0,
        featured: blog.featured
      });
      
      setContent(blog.content);
      setInitialLoadComplete(true);
    }
  }, [blog, initialLoadComplete, setFormData, setContent]);

  useEffect(() => {
    if (initialLoadComplete) {
      updateField('content', content);
      updateField('readTime', readTime);
    }
  }, [content, readTime, updateField, initialLoadComplete]);

  // Handlers
  const handleSave = async (status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!validateForm()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: Omit<typeof formData, 'authorId'> & { authorId?: number } = {
        ...formData,
        status: status || formData.status,
        content,
        readTime
      };

      // Remove fields that shouldn't be updated
      delete updateData.authorId; // Don't change author

      const result = await updateBlog(blogId, updateData, imageFiles);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${status ? `${status.toLowerCase()}` : 'updated'} successfully`
      });

      // Reload the blog to get updated data
      await loadBlog();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update blog'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        addImageFile(file);
      });
    }
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Remove from existing images
      const updatedImages = (formData.images || []).filter((_: any, i: number) => i !== index);
      updateField('images', updatedImages);
    } else {
      // Remove from new image files
      const existingImagesCount = formData.images?.length || 0;
      const fileIndex = index - existingImagesCount;
      removeImageFile(fileIndex);
    }
  };

  if (blogLoading && !initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (blogError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Error loading blog"
          message={blogError}
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

  interface BlogImage {
    id: number;
    url: string;
    alt?: string;
    caption?: string;
    isMain?: boolean;
    isNew?: boolean;
    file?: File;
  }

  const allImages: BlogImage[] = [
    ...(formData.images || []).map((img: any, idx: number) => ({
      ...img,
      id: typeof img.id === 'number' ? img.id : -idx - 1000 // fallback to a negative id if undefined
    })),
    ...imageFiles.map((file: File, index: number) => ({
      id: -index - 1, // Negative IDs for new files
      url: URL.createObjectURL(file),
      alt: '',
      caption: '',
      isMain: false,
      isNew: true,
      file
    }))
  ];

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
              
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Blog
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {blog.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={() => router.push(`/admin/blog/${blogId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </ActionButton>
              
              {formData.status === 'PUBLISHED' && (
                <ActionButton
                  variant="secondary"
                  onClick={() => handleSave('DRAFT')}
                  loading={saving}
                  disabled={updateLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Unpublish
                </ActionButton>
              )}

              {formData.status !== 'PUBLISHED' && (
                <ActionButton
                  variant="primary"
                  onClick={() => handleSave('PUBLISHED')}
                  loading={saving}
                  disabled={updateLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </ActionButton>
              )}

              <ActionButton
                variant="secondary"
                onClick={() => handleSave()}
                loading={saving}
                disabled={updateLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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
            {/* Basic Info */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter blog title..."
                    error={errors.title}
                    required
                  />

                  <Input
                    label="Slug"
                    value={formData.slug || ''}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="url-friendly-slug"
                  />

                  <TextArea
                    label="Excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    placeholder="Brief description of the blog post..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Content
                </h2>
                
                <TextArea
                  value={content}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder="Write your blog content..."
                  rows={15}
                  error={errors.content}
                  className="font-mono text-sm"
                />
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Supports HTML and Markdown</span>
                  <span>{readTime} min read • {content.length} characters</span>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Images
                </h2>
                
                {/* Existing Images */}
                {allImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {allImages.map((image, index) => (
                      <div key={image.id || index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt || `Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        
                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-2">
                            {image.isMain && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                                Main
                              </span>
                            )}
                            <ActionButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRemoveImage(index, !image.isNew)}
                              className="text-white hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload new images */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Add more images
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                    <span className={`text-sm font-medium ${
                      blog.status === 'PUBLISHED' ? 'text-green-600' :
                      blog.status === 'DRAFT' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {blog.status}
                    </span>
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.viewCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => updateField('featured', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Featured blog
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tags.map((tag: { id: number; name: string }) => (
                    <div key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={formData.tagIds?.includes(tag.id) || false}
                        onChange={(e) => {
                          const currentTags = formData.tagIds || [];
                          if (e.target.checked) {
                            updateField('tagIds', [...currentTags, tag.id]);
                          } else {
                            updateField('tagIds', currentTags.filter((id: number) => id !== tag.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="ml-2 block text-sm text-gray-900 dark:text-white"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Categories */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Categories
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category: { id: number; name: string }) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={formData.categoryIds?.includes(category.id) || false}
                        onChange={(e) => {
                          const currentCategories = formData.categoryIds || [];
                          if (e.target.checked) {
                            updateField('categoryIds', [...currentCategories, category.id]);
                          } else {
                            updateField('categoryIds', currentCategories.filter((id: number) => id !== category.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 block text-sm text-gray-900 dark:text-white"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* SEO */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  SEO Settings
                </h3>
                
                <div className="space-y-4">
                  <Input
                    label="SEO Title"
                    value={formData.seoTitle || ''}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    placeholder="SEO optimized title..."
                  />

                  <TextArea
                    label="Meta Description"
                    value={formData.seoDescription || ''}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    placeholder="SEO meta description..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}