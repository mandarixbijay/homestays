// components/admin/blog/BlogCreateForm.tsx
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
import { blogApi, CreateBlogData, Tag as BlogTag, Category, BlogImage } from '@/lib/api/completeBlogApi';

// Types for form data
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

interface LocalBlogImage {
  file?: File;
  url: string;
  alt: string;
  caption: string;
  isMain: boolean;
}

export default function BlogCreateForm(): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  // Form state
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
    categoryIds: []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<LocalBlogImage[]>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  // Load tags and categories using existing API
  useEffect(() => {
    loadTagsAndCategories();
  }, []);

  const loadTagsAndCategories = async (): Promise<void> => {
    // Load tags
    setTagsLoading(true);
    try {
      const tagsData = await blogApi.getTags();
      setTags(tagsData);
      console.log('Tags loaded:', tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
      addToast({
        type: 'warning',
        title: 'Warning',
        message: 'Failed to load tags. You can still create the blog.'
      });
    } finally {
      setTagsLoading(false);
    }

    // Load categories
    setCategoriesLoading(true);
    try {
      const categoriesData = await blogApi.getCategories();
      setCategories(categoriesData);
      console.log('Categories loaded:', categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast({
        type: 'warning',
        title: 'Warning',
        message: 'Failed to load categories. You can still create the blog.'
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug from title if slug is empty
    if (field === 'title' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value as string)
      }));
    }
    
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

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT'): Promise<void> => {
    if (!validateForm()) {
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
        message: 'You must be logged in to create a blog'
      });
      return;
    }

    setLoading(true);
    try {
      const readTime = calculateReadTime(formData.content);
      
      // Prepare blog data using your API types
      const blogData: CreateBlogData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        authorId: session.user.id,
        status,
        featured: formData.featured,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        readTime,
        tagIds: formData.tagIds,
        categoryIds: formData.categoryIds,
        featuredImage: formData.featuredImage || undefined,
        images: images.map(img => ({
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          isMain: img.isMain
        }))
      };

      // Extract image files
      const imageFiles = images
        .filter(img => img.file)
        .map(img => img.file!)
        .filter(Boolean);

      console.log('Creating blog with data:', blogData);
      console.log('Image files:', imageFiles.length);

      // Use your existing blogApi
      const result = await blogApi.createBlog(blogData, imageFiles);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Blog ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully`
      });
      
      // Redirect to blog list or view the created blog
      router.push('/admin/blog');
      
    } catch (error) {
      console.error('Error creating blog:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create blog';
      
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
          message: 'Blog API endpoint not found. Please check your backend configuration.'
        });
      }
    } finally {
      setLoading(false);
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
            isMain: prev.length === 0 // First image is main by default
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
    const imageHtml = `<img src="${imageUrl}" alt="Blog image" class="w-full h-auto rounded-lg my-4" />`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n' + imageHtml + '\n'
    }));
  };

  const updateImageMetadata = (index: number, field: 'alt' | 'caption', value: string): void => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], [field]: value };
      return newImages;
    });
  };

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
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </ActionButton>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Create New Blog Post
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {wordCount} words • {readTime} min read
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ActionButton
                variant="secondary"
                onClick={() => handleSubmit('DRAFT')}
                loading={loading}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </ActionButton>
              
              <ActionButton
                onClick={() => handleSubmit('PUBLISHED')}
                loading={loading}
              >
                <Globe className="h-4 w-4" />
                Publish
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
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  This will be used in the URL
                </div>
                
                <TextArea
                  label="Excerpt"
                  value={formData.excerpt}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description for previews and SEO"
                  rows={3}
                  error={errors.excerpt}
                  required
                  maxLength={300}
                />
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  {formData.excerpt.length}/300 characters
                </div>
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
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Click to upload images or drag and drop<br />
                      <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                    </p>
                  </label>
                </div>
                
                {/* Image Gallery */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Uploaded Images ({images.length})
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((image: LocalBlogImage, index: number) => (
                        <div key={index} className="relative group border rounded-lg p-3">
                          <div className="aspect-video relative mb-3">
                            <img
                              src={image.url}
                              alt={image.alt || `Uploaded image ${index + 1}`}
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
                            
                            {/* Main Image Badge */}
                            {image.isMain && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </span>
                              </div>
                            )}
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
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  {formData.seoTitle.length}/60 characters
                </div>
                
                <TextArea
                  label="SEO Description"
                  value={formData.seoDescription}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Description for search engines (leave empty to use excerpt)"
                  rows={3}
                  maxLength={160}
                />
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  {formData.seoDescription.length}/160 characters
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" text="Loading categories..." />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No categories available
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category: Category) => (
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
                      {category.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Tags */}
            <Card title="Tags">
              {tagsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" text="Loading tags..." />
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tags available
                  </p>
                </div>
              ) : (
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
                      {tag.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card title="Quick Stats">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Word Count:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Read Time:</span>
                  <span className="font-medium">{readTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Images:</span>
                  <span className="font-medium">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                  <span className="font-medium">{formData.categoryIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                  <span className="font-medium">{formData.tagIds.length}</span>
                </div>
              </div>
            </Card>

            {/* API Status */}
            <Card title="API Status">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tags API:</span>
                  <span className={`font-medium ${
                    tagsLoading ? 'text-yellow-600' : 
                    tags.length > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tagsLoading ? 'Loading...' : tags.length > 0 ? 'Connected' : 'No Data'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Categories API:</span>
                  <span className={`font-medium ${
                    categoriesLoading ? 'text-yellow-600' : 
                    categories.length > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {categoriesLoading ? 'Loading...' : categories.length > 0 ? 'Connected' : 'No Data'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}