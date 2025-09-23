// components/admin/blog/EnhancedBlogEditForm.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, JSX, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save, X, Eye, Upload, Trash2, Star, Tag, Folder, Plus,
  Image, FileText, Globe, Clock, ArrowLeft, AlertCircle, Check,
  Bold, Italic, Type, Link, List, Hash, Quote, Code, Palette,
  Settings, RefreshCw
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
import { blogApi, Category, UpdateBlogData } from '@/lib/api/completeBlogApi';

// Import blog editor utilities
import {
  generateSlug,
  calculateReadTime,
  validateForm as validateFormData,
  blogFormValidationSchema,
  validateImageFile,
  resizeImage,
  AutoSaveManager,
  editorStyles
} from '@/utils/blogEditorUtils';

// Import separate components
import { UrlPreview } from '@/components/admin/blog/UrlPreview';
import { StatusBadge } from '@/components/admin/blog/StatusBadge';

// Rich Text Editor Component with integrated styles (same as create form)
const RichTextEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
  height?: string;
}> = ({ content, onChange, onImageUpload, placeholder = "Write your blog content...", height = "400px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Apply editor styles
  useEffect(() => {
    // Inject editor styles if not already present
    const styleId = 'rich-editor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = editorStyles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file using utility
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      // Resize image if too large
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) { // 2MB
        const resizedBlob = await resizeImage(file, 1200, 800, 0.8);
        fileToUpload = new File([resizedBlob], file.name, { type: file.type });
      }

      const imageUrl = await onImageUpload(fileToUpload);
      const imgHtml = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      execCommand('insertHTML', imgHtml);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatButtons = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: Type, title: 'Underline (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: Hash, title: 'Numbered List' },
    { command: 'formatBlock', icon: Quote, title: 'Quote', value: 'blockquote' },
    { command: 'formatBlock', icon: Type, title: 'Heading 1', value: 'h1' },
    { command: 'formatBlock', icon: Type, title: 'Heading 2', value: 'h2' },
    { command: 'formatBlock', icon: Type, title: 'Heading 3', value: 'h3' },
  ];

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {formatButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={() => execCommand(button.command, button.value)}
            className="editor-button"
            title={button.title}
          >
            <button.icon className="h-4 w-4" />
          </button>
        ))}
        
        <div className="editor-divider" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="editor-button"
          title="Insert Image"
        >
          {isUploading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          className="editor-button"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>

        <div className="editor-divider" />

        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="editor-button"
          title="Clear Formatting"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="editor-content"
        style={{ minHeight: height }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

// Category/Tag Manager Component (same as create form)
const CategoryTagManager: React.FC<{
  type: 'category' | 'tag';
  items: (Category | BlogTag)[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onItemCreate: (name: string, color?: string) => Promise<void>;
  loading: boolean;
}> = ({ type, items, selectedIds, onSelectionChange, onItemCreate, loading }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    
    setCreating(true);
    try {
      await onItemCreate(newItemName.trim(), newItemColor);
      setNewItemName('');
      setNewItemColor('#3B82F6');
      setShowCreateForm(false);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <Card title={`${type === 'category' ? 'Categories' : 'Tags'}`}>
      <div className="space-y-4">
        {/* Create New Button */}
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New {type === 'category' ? 'Category' : 'Tag'}
        </button>

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
            <Input
              placeholder={`${type === 'category' ? 'Category' : 'Tag'} name`}
              value={newItemName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Color</span>
            </div>
            <div className="flex gap-2">
              <ActionButton
                variant="primary"
                size="sm"
                onClick={handleCreate}
                loading={creating}
                disabled={!newItemName.trim()}
              >
                Create
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </ActionButton>
            </div>
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" text={`Loading ${type}s...`} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No {type}s available
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${type}-${item.id}`}
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelection(item.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`${type}-${item.id}`}
                  className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer"
                >
                  {item.name}
                </label>
                {item.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

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

export default function EnhancedBlogEditForm({ blogId }: BlogEditFormProps): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  // State with proper typing
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugChecking, setSlugChecking] = useState<boolean>(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Handle input changes for form fields
  const handleInputChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => prev ? { ...prev, [key]: value } : prev);
  };

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

  // Check slug availability when slug changes (only if different from original)
  useEffect(() => {
    if (formData?.slug && formData.slug !== originalSlug && formData.slug.length > 2) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(formData.slug);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (formData?.slug === originalSlug) {
      setSlugAvailable(true); // Original slug is always available
    } else {
      setSlugAvailable(null);
    }
  }, [formData?.slug, originalSlug]);

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
      setOriginalSlug(blogData.slug);
      
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

  const checkSlugAvailability = async (slug: string): Promise<void> => {
    if (!slug.trim()) {
      setSlugAvailable(null);
      return;
    }

    setSlugChecking(true);
    try {
      // Try to get blog by slug - if it exists and it's not the current blog, slug is not available
      const existingBlog = await blogApi.getBlogBySlug(slug);
      setSlugAvailable(existingBlog.id === blogId); // Available if it's the same blog
    } catch (error) {
      // If error (likely 404), slug is available
      setSlugAvailable(true);
    } finally {
      setSlugChecking(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    // Use utility validation function
    const validationErrors = validateFormData(formData, blogFormValidationSchema);
    
    // Add slug availability check
    if (slugAvailable === false) {
      validationErrors.slug = 'This slug is already taken';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      if (typeof blogApi.uploadImage === 'function') {
        const result = await blogApi.uploadImage(file);
        return result.url;
      } else {
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleCreateCategory = async (name: string, color?: string): Promise<void> => {
    try {
      const newCategory = await blogApi.createCategory({
        name,
        color,
        slug: generateSlug(name)
      });
      setCategories(prev => [...prev, newCategory]);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Category created successfully'
      });
    } catch (error) {
      console.error('Error creating category:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create category'
      });
      throw error;
    }
  };

  const handleCreateTag = async (name: string, color?: string): Promise<void> => {
    try {
      const newTag = await blogApi.createTag({
        name,
        color,
        slug: generateSlug(name)
      });
      setTags(prev => [...prev, newTag]);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Tag created successfully'
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create tag'
      });
      throw error;
    }
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
        featuredImage: formData.featuredImage || undefined
      };

      console.log('Updating blog with data:', updateData);

      const result = await blogApi.updateBlog(blogId, updateData, []);
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-xl border-b border-gray-200 dark:border-gray-700">
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
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
                variant="secondary"
                onClick={() => handleSubmit('ARCHIVED')}
                loading={saving}
              >
                <X className="h-4 w-4" />
                Archive
              </ActionButton>
              
              <ActionButton
                onClick={() => handleSubmit('PUBLISHED')}
                loading={saving}
                disabled={slugAvailable === false}
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
            <Card title="Basic Information" className="shadow-lg">
              <div className="space-y-6">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your blog title"
                  error={errors.title}
                  required
                  className="text-lg font-medium"
                />
                
                <div>
                  <Input
                    label="URL Slug"
                    value={formData.slug}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-slug"
                    error={errors.slug}
                    required
                  />
                  
                  {/* Enhanced URL Preview */}
                  <UrlPreview 
                    slug={formData.slug}
                    available={slugAvailable}
                    checking={slugChecking}
                  />
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

            {/* Rich Text Content Editor */}
            <Card title="Content" className="shadow-lg">
              <div className="space-y-4">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  onImageUpload={handleImageUpload}
                  placeholder="Write your blog content here..."
                  height="500px"
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <span>Rich text editor with image support</span>
                  <span className="font-medium">{wordCount} words • {readTime} min read</span>
                </div>
              </div>
              {errors.content && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
              )}
            </Card>

            {/* SEO Settings */}
            <Card title="SEO Settings" className="shadow-lg">
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
            {/* Blog Info */}
            <Card title="Blog Info" className="shadow-lg">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Status:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    blog.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
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
            <Card title="Publish Settings" className="shadow-lg">
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
            <CategoryTagManager
              type="category"
              items={categories}
              selectedIds={formData.categoryIds}
              onSelectionChange={(ids) => handleInputChange('categoryIds', ids)}
              onItemCreate={handleCreateCategory}
              loading={false}
            />

            {/* Tags */}
            <CategoryTagManager
              type="tag"
              items={tags}
              selectedIds={formData.tagIds}
              onSelectionChange={(ids) => handleInputChange('tagIds', ids)}
              onItemCreate={handleCreateTag}
              loading={false}
            />

            {/* Quick Stats */}
            <Card title="Quick Stats" className="shadow-lg">
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
                  <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                  <span className="font-medium">{formData.categoryIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                  <span className="font-medium">{formData.tagIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New Status:</span>
                  <span className={`font-medium ${
                    formData.status === 'PUBLISHED' ? 'text-green-600' :
                    formData.status === 'DRAFT' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{formData.status}</span>
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card title="System Status" className="shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Slug Check:</span>
                  <span className={`font-medium ${
                    slugChecking ? 'text-yellow-600' : 
                    slugAvailable === true ? 'text-green-600' : 
                    slugAvailable === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {slugChecking ? 'Checking...' : 
                     slugAvailable === true ? 'Available' : 
                     slugAvailable === false ? 'Taken' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tags API:</span>
                  <span className="font-medium text-green-600">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Categories API:</span>
                  <span className="font-medium text-green-600">Connected</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}