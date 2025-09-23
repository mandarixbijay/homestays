// components/admin/blog/BlogEditForm.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save, X, Eye, Upload, Trash2, Star, Tag, Folder, Plus,
  Image, FileText, Globe, Clock, ArrowLeft, AlertCircle, Check
} from 'lucide-react';

import {
  Input,
  TextArea,
  ActionButton,
  Card,
  Alert,
  LoadingSpinner,
  Select,
  useToast
} from '@/components/admin/AdminComponents';

// Import your existing blog API
import { blogApi, UpdateBlogData } from '@/lib/api/completeBlogApi';

// Types
interface BlogImage {
  id?: number;
  url: string;
  alt: string;
  caption: string;
  isMain: boolean;
  isExisting?: boolean;
  file?: File;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  parentId?: number;
}

interface BlogAuthor {
  id: number;
  name: string;
  email: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: BlogAuthor;
  images: BlogImage[];
  tags: BlogTag[];
  categories: BlogCategory[];
}

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
}

interface FormErrors {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  [key: string]: string | undefined;
}

interface BlogEditFormProps {
  blogId: number;
}

export default function BlogEditForm({ blogId }: BlogEditFormProps): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  // State with proper typing
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [images, setImages] = useState<BlogImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load existing blog data
  useEffect(() => {
    if (blogId && !isNaN(blogId) && blogId > 0) {
      loadBlog();
      loadTagsAndCategories();
    } else {
      setError('Invalid blog ID provided');
      setLoading(false);
    }
  }, [blogId]);

  const loadBlog = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const rawBlogData = await blogApi.getBlog(blogId);
      const blogData: Blog = {
        ...rawBlogData,
        excerpt: rawBlogData.excerpt ?? '',
        images: (rawBlogData.images ?? []).map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: typeof img.alt === 'string' ? img.alt : '',
          caption: typeof img.caption === 'string' ? img.caption : '',
          isMain: img.isMain || false,
        })),
      };
      setBlog(blogData);
      
      // Initialize form data with blog data
      setFormData({
        title: blogData.title || '',
        slug: blogData.slug || '',
        excerpt: blogData.excerpt || '',
        content: blogData.content || '',
        featuredImage: blogData.featuredImage || '',
        status: blogData.status || 'DRAFT',
        featured: blogData.featured || false,
        seoTitle: blogData.seoTitle || '',
        seoDescription: blogData.seoDescription || '',
        tagIds: blogData.tags?.map((tag: BlogTag) => tag.id) || [],
        categoryIds: blogData.categories?.map((cat: BlogCategory) => cat.id) || []
      });

      // Initialize images
      setImages(blogData.images?.map((img: BlogImage) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        caption: img.caption || '',
        isMain: img.isMain || false,
        isExisting: true
      })) || []);

    } catch (err) {
      console.error('Error loading blog:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const loadTagsAndCategories = async (): Promise<void> => {
    try {
      const [tagsData, categoriesData] = await Promise.all([
        blogApi.getTags(),
        blogApi.getCategories()
      ]);
      
      setTags(tagsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading tags and categories:', error);
      addToast({
        type: 'warning',
        title: 'Warning',
        message: 'Failed to load tags and categories. You can still edit the blog.'
      });
    }
  };

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    if (!formData) return;
    
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const calculateReadTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return Math.ceil(words.length / 200);
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<void> => {
    if (!formData || !validateForm()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    if (!session?.user?.id) {
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: 'You must be logged in to update a blog'
      });
      return;
    }

    setSaving(true);
    try {
      const readTime = calculateReadTime(formData.content);
      
      // Prepare blog data using your API types
      const updateData: UpdateBlogData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        status: status || formData.status,
        featured: formData.featured,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        readTime,
        tagIds: formData.tagIds,
        categoryIds: formData.categoryIds,
        featuredImage: formData.featuredImage || undefined,
        images: images.map(img => ({
          id: img.id || undefined,
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          isMain: img.isMain
        }))
      };

      // Extract new image files
      const imageFiles = images
        .filter((img: BlogImage) => !img.isExisting && img.file)
        .map(img => img.file!)
        .filter(Boolean);

      console.log('Updating blog with data:', updateData);
      console.log('New image files:', imageFiles.length);

      // Use your existing blogApi
      const result = await blogApi.updateBlog(blogId, updateData, imageFiles);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${status ? `${status.toLowerCase()}` : 'updated'} successfully`
      });
      
      // Reload the blog to get updated data
      await loadBlog();
      
    } catch (err) {
      console.error('Error updating blog:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog';
      
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });

      // Provide guidance for common errors
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        addToast({
          type: 'info',
          title: 'Authentication',
          message: 'Please check your login status and try again'
        });
      } else if (errorMessage.includes('404')) {
        addToast({
          type: 'info',
          title: 'API Endpoint',
          message: 'Blog not found or API endpoint unavailable.'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select only image files'
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Image must be less than 10MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setImages(prev => [...prev, {
            file,
            url: e.target?.result as string,
            alt: '',
            caption: '',
            isMain: false,
            isExisting: false
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  };

  const removeImage = (index: number): void => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (newImages.length > 0 && prev[index]?.isMain) {
        newImages[0].isMain = true;
      }
      return newImages;
    });
  };

  const setMainImage = (index: number): void => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isMain: i === index
    })));
  };

  const insertImageToContent = (imageUrl: string): void => {
    if (!formData) return;
    
    const imageHtml = `<img src="${imageUrl}" alt="Blog image" class="w-full h-auto rounded-lg my-4" />`;
    setFormData(prev => prev ? ({
      ...prev,
      content: prev.content + '\n' + imageHtml + '\n'
    }) : null);
  };

  const updateImageMetadata = (index: number, field: 'alt' | 'caption', value: string): void => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], [field]: value };
      return newImages;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Alert type="error" title="Error" message={error} />
          <div className="mt-4">
            <ActionButton onClick={() => router.push('/admin/blog')}>
              Back to Blog Dashboard
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  if (!blog || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Alert type="error" title="Not Found" message="Blog not found" />
          <div className="mt-4">
            <ActionButton onClick={() => router.push('/admin/blog')}>
              Back to Blog Dashboard
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w).length;
  const readTime = calculateReadTime(formData.content);

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
                disabled={saving}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </ActionButton>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Blog Post
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {blog.title} • {wordCount} words • {readTime} min read
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={() => handleSubmit('DRAFT')}
                loading={saving}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </ActionButton>
              
              <ActionButton
                onClick={() => handleSubmit('PUBLISHED')}
                loading={saving}
              >
                <Globe className="h-4 w-4" />
                {blog.status === 'PUBLISHED' ? 'Update' : 'Publish'}
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card title="Basic Information">
              <div className="space-y-6">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your blog title"
                  error={errors.title}
                  required
                />
                
                <Input
                  label="URL Slug"
                  value={formData.slug}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                  error={errors.slug}
                  required
                />
                
                <TextArea
                  label="Excerpt"
                  value={formData.excerpt}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description for previews and SEO"
                  rows={3}
                  error={errors.excerpt}
                  required
                />
              </div>
            </Card>

            {/* Content Editor */}
            <Card title="Content">
              <div className="space-y-4">
                <TextArea
                  value={formData.content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog content here. You can use HTML tags for formatting."
                  rows={20}
                  error={errors.content}
                  className="font-mono text-sm"
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>HTML formatting supported</span>
                  <span>{wordCount} words • {readTime} min read</span>
                </div>
              </div>
            </Card>

            {/* Image Management */}
            <Card title="Images">
              <div className="space-y-6">
                {/* Upload Area */}
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Click to upload new images<br />
                      <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                    </p>
                  </label>
                </div>
                
                {/* Image Gallery */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Images ({images.length})
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((image: BlogImage, index: number) => (
                        <div key={index} className="relative group border rounded-lg p-3">
                          <div className="aspect-video relative mb-3">
                            <img
                              src={image.url}
                              alt={image.alt || `Blog image ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                            
                            {/* Image Controls */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-1">
                                {!image.isMain && (
                                  <button
                                    onClick={() => setMainImage(index)}
                                    className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                    title="Set as featured image"
                                    type="button"
                                  >
                                    <Star className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => insertImageToContent(image.url)}
                                  className="p-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                  title="Insert into content"
                                  type="button"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => removeImage(index)}
                                  className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                  title="Remove image"
                                  type="button"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="absolute top-2 left-2 space-y-1">
                              {image.isMain && (
                                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </span>
                              )}
                              {image.isExisting && (
                                <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  Existing
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Image Metadata */}
                          <div className="space-y-2">
                            <Input
                              placeholder="Alt text"
                              value={image.alt}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                                updateImageMetadata(index, 'alt', e.target.value)
                              }
                              className="text-sm"
                            />
                            <Input
                              placeholder="Caption (optional)"
                              value={image.caption}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                                updateImageMetadata(index, 'caption', e.target.value)
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* SEO Settings */}
            <Card title="SEO Settings">
              <div className="space-y-4">
                <Input
                  label="SEO Title"
                  value={formData.seoTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="Title for search engines (leave empty to use main title)"
                  maxLength={60}
                />
                
                <TextArea
                  label="SEO Description"
                  value={formData.seoDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Description for search engines (leave empty to use excerpt)"
                  rows={3}
                  maxLength={160}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blog Info */}
            <Card title="Blog Info">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    blog.status === 'PUBLISHED' ? 'text-green-600' :
                    blog.status === 'DRAFT' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{blog.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author:</span>
                  <span className="font-medium">{blog.author.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-medium">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                {blog.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Published:</span>
                    <span className="font-medium">{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views:</span>
                  <span className="font-medium">{blog.viewCount || 0}</span>
                </div>
              </div>
            </Card>

            {/* Publish Settings */}
            <Card title="Publish Settings">
              <div className="space-y-4">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                    handleInputChange('status', e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Featured post
                  </label>
                </div>
              </div>
            </Card>

            {/* Categories */}
            <Card title="Categories">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category: BlogCategory) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          handleInputChange('categoryIds', [...formData.categoryIds, category.id]);
                        } else {
                          handleInputChange('categoryIds', formData.categoryIds.filter(id => id !== category.id));
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tags */}
            <Card title="Tags">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags.map((tag: BlogTag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={formData.tagIds.includes(tag.id)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          handleInputChange('tagIds', [...formData.tagIds, tag.id]);
                        } else {
                          handleInputChange('tagIds', formData.tagIds.filter(id => id !== tag.id));
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}