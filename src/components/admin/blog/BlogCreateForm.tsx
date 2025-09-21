'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save, X, Eye, Upload, Plus, Star, Tag, Folder,
  Image as ImageIcon, FileText, Globe, Clock
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
  useBlogForm,
  useBlogImageManager,
  useRichTextEditor,
  useTags,
  useCategories,
  useBlogs
} from '@/hooks/useCompleteBlogApi';

export default function BlogCreateForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  // Hooks
  const { createBlog, loading: createLoading } = useBlogs();
  const { tags, loadTags } = useTags();
  const { categories, loadCategories } = useCategories();
  
  const {
    formData,
    updateField,
    errors,
    validateForm,
    imageFiles,
    addImageFile
  } = useBlogForm({
    authorId: session?.user?.id || 0
  });

  const { content, updateContent, readTime } = useRichTextEditor();

  // State
  const [saving, setSaving] = useState(false);

  // Effects
  useEffect(() => {
    loadTags();
    loadCategories();
  }, []);

  useEffect(() => {
    updateField('content', content);
    updateField('readTime', readTime);
  }, [content, readTime, updateField]);

  // Handlers
  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
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
      const blogData = {
        ...formData,
        status,
        content,
        readTime
      };

      const result = await createBlog(blogData, imageFiles);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully`
      });

      router.push(`/admin/blog/${result.id}`);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save blog'
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Blog
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Write and publish a new blog post
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={() => router.push('/admin/blog')}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => handleSave('DRAFT')}
                loading={saving}
                disabled={createLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </ActionButton>

              <ActionButton
                variant="primary"
                onClick={() => handleSave('PUBLISHED')}
                loading={saving}
                disabled={createLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish
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
                      Click to upload images
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </label>
                </div>

                {imageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imageFiles.map((file: File, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {file.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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