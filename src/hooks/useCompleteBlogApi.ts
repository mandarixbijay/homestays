// Complete Blog API Hooks Implementation
// File: hooks/useCompleteBlogApi.ts

import { useState, useCallback } from 'react';
import { blogApi, Blog, CreateBlogData, UpdateBlogData, BlogFilters, Tag, Category, BlogStats } from '@/lib/api/completeBlogApi';
import { useAsyncOperation, useFilters } from '@/hooks/useAdminApi';

// ============================================================================
// BLOG MANAGEMENT HOOKS
// ============================================================================

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadBlogs = useCallback(async (params?: BlogFilters) => {
    try {
      // Filter out empty or undefined values
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );
      
      const result = await execute(async () => {
        return await blogApi.getBlogs(filteredParams);
      });
      
      if (result) {
        setBlogs(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading blogs:', error);
      throw error;
    }
  }, [execute]);

  const createBlog = useCallback(async (blogData: CreateBlogData, imageFiles: File[] = []) => {
    try {
      const result = await execute(async () => {
        return await blogApi.createBlog(blogData, imageFiles);
      });
      
      return result;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }, [execute]);

  const updateBlog = useCallback(async (id: number, blogData: UpdateBlogData, imageFiles: File[] = []) => {
    try {
      const result = await execute(async () => {
        return await blogApi.updateBlog(id, blogData, imageFiles);
      });
      
      return result;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }, [execute]);

  const deleteBlog = useCallback(async (id: number) => {
    try {
      const response = await execute(async () => {
        await blogApi.deleteBlog(id);
        return { success: true, message: 'Blog deleted successfully' };
      });
      return response;
    } catch (error: any) {
      console.error('Error deleting blog:', {
        id,
        error: error.message,
      });
      throw new Error(error.message || 'Failed to delete blog');
    }
  }, [execute]);

  const bulkBlogActions = useCallback(async (
    blogIds: number[],
    action: 'publish' | 'archive' | 'draft' | 'delete' | 'feature' | 'unfeature'
  ) => {
    try {
      const result = await execute(async () => {
        return await blogApi.bulkBlogActions({ blogIds, action });
      });
      return result;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }, [execute]);

  return {
    blogs,
    totalPages,
    total,
    loading,
    error,
    loadBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    bulkBlogActions,
    clearError
  };
}

// ============================================================================
// BLOG STATISTICS HOOK
// ============================================================================

export function useBlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation<BlogStats>();

  const loadBlogStats = useCallback(async () => {
    try {
      const result = await execute(async () => {
        return await blogApi.getBlogStats();
      });
      setStats(result);
      return result;
    } catch (error) {
      console.error('Error loading blog stats:', error);
      // Return default stats if API fails
      const defaultStats: BlogStats = {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        archivedBlogs: 0,
        totalViews: 0,
        totalTags: 0,
        totalCategories: 0,
        featuredBlogs: 0,
        mostViewedBlogs: [],
        recentBlogs: []
      };
      setStats(defaultStats);
      return defaultStats;
    }
  }, [execute]);

  return {
    stats,
    loading,
    error,
    loadBlogStats,
    clearError
  };
}

// ============================================================================
// BLOG FILTERS HOOK
// ============================================================================

export function useBlogFilters(initialFilters: BlogFilters = {}) {
  return useFilters<BlogFilters>({
    page: 1,
    limit: 10,
    status: undefined,
    authorId: undefined,
    title: '',
    tagId: undefined,
    categoryId: undefined,
    featured: undefined,
    search: '',
    ...initialFilters
  }); 
}

// ============================================================================
// BLOG EXPORT HOOK
// ============================================================================

export function useBlogExport() {
  const { loading, error, execute } = useAsyncOperation();

  const exportBlogs = useCallback(async (params: {
    format?: 'csv' | 'json';
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    dateFrom?: string;
    dateTo?: string;
    authorId?: number;
  } = {}) => {
    try {
      const result = await execute(async () => {
        return await blogApi.exportBlogs(params);
      });
      
      // Create and download file
      const blob = new Blob([result], { 
        type: params.format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blogs-export-${new Date().toISOString().split('T')[0]}.${params.format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return result;
    } catch (error) {
      console.error('Error exporting blogs:', error);
      throw error;
    }
  }, [execute]);

  return {
    exportBlogs,
    loading,
    error
  };
}

// ============================================================================
// TAG MANAGEMENT HOOKS
// ============================================================================

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadTags = useCallback(async () => {
    try {
      const result = await execute(async () => {
        return await blogApi.getTags();
      });
      setTags(result || []);
      return result;
    } catch (error) {
      console.error('Error loading tags:', error);
      throw error;
    }
  }, [execute]);

  const createTag = useCallback(async (data: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const result = await execute(async () => {
        return await blogApi.createTag(data);
      });
      await loadTags(); // Reload tags after creation
      return result;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }, [execute, loadTags]);

  const updateTag = useCallback(async (id: number, data: Partial<{
    name: string;
    slug?: string;
    description?: string;
    color?: string;
  }>) => {
    try {
      const result = await execute(async () => {
        return await blogApi.updateTag(id, data);
      });
      await loadTags(); // Reload tags after update
      return result;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }, [execute, loadTags]);

  const deleteTag = useCallback(async (id: number) => {
    try {
      await execute(async () => {
        await blogApi.deleteTag(id);
        return { success: true };
      });
      await loadTags(); // Reload tags after deletion
      return { success: true, message: 'Tag deleted successfully' };
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }, [execute, loadTags]);

  return {
    tags,
    loading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    clearError
  };
}

// ============================================================================
// CATEGORY MANAGEMENT HOOKS
// ============================================================================

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<Category[]>([]);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadCategories = useCallback(async () => {
    try {
      const result = await execute(async () => {
        return await blogApi.getCategories();
      });
      setCategories(result || []);
      return result;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }, [execute]);

  const loadCategoryHierarchy = useCallback(async () => {
    try {
      const result = await execute(async () => {
        return await blogApi.getCategoryHierarchy();
      });
      setCategoryHierarchy(result || []);
      return result;
    } catch (error) {
      console.error('Error loading category hierarchy:', error);
      throw error;
    }
  }, [execute]);

  const createCategory = useCallback(async (data: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: number;
  }) => {
    try {
      const result = await execute(async () => {
        return await blogApi.createCategory(data);
      });
      await loadCategories(); // Reload categories after creation
      await loadCategoryHierarchy();
      return result;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }, [execute, loadCategories, loadCategoryHierarchy]);

  const updateCategory = useCallback(async (id: number, data: Partial<{
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: number;
  }>) => {
    try {
      const result = await execute(async () => {
        return await blogApi.updateCategory(id, data);
      });
      await loadCategories(); // Reload categories after update
      await loadCategoryHierarchy();
      return result;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }, [execute, loadCategories, loadCategoryHierarchy]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await execute(async () => {
        await blogApi.deleteCategory(id);
        return { success: true };
      });
      await loadCategories(); // Reload categories after deletion
      await loadCategoryHierarchy();
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }, [execute, loadCategories, loadCategoryHierarchy]);

  return {
    categories,
    categoryHierarchy,
    loading,
    error,
    loadCategories,
    loadCategoryHierarchy,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  };
}

// ============================================================================
// BLOG FORM STATE HOOK
// ============================================================================

export function useBlogForm(initialData?: Partial<CreateBlogData>) {
  const [formData, setFormData] = useState<CreateBlogData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    images: [],
    tagIds: [],
    categoryIds: [],
    authorId: 0,
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
    readTime: 0,
    featured: false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const updateField = useCallback((field: keyof CreateBlogData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback((newData?: Partial<CreateBlogData>) => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      images: [],
      tagIds: [],
      categoryIds: [],
      authorId: 0,
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
      readTime: 0,
      featured: false,
      ...newData
    });
    setErrors({});
    setImageFiles([]);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.authorId || formData.authorId <= 0) {
      newErrors.authorId = 'Author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const addImageFile = useCallback((file: File) => {
    setImageFiles(prev => [...prev, file]);
  }, []);

  const removeImageFile = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addImageMetadata = useCallback((imageData: {
    url?: string;
    alt?: string;
    caption?: string;
    isMain: boolean;
  }) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), imageData]
    }));
  }, []);

  const removeImageMetadata = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  }, []);

  const updateImageMetadata = useCallback((index: number, imageData: Partial<{
    url?: string;
    alt?: string;
    caption?: string;
    isMain: boolean;
  }>) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => 
        i === index ? { ...img, ...imageData } : img
      )
    }));
  }, []);

  return {
    formData,
    setFormData,
    errors,
    imageFiles,
    updateField,
    setFieldError,
    clearErrors,
    resetForm,
    validateForm,
    addImageFile,
    removeImageFile,
    addImageMetadata,
    removeImageMetadata,
    updateImageMetadata
  };
}

// ============================================================================
// BLOG IMAGE MANAGEMENT HOOK
// ============================================================================

export function useBlogImageManager() {
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  const handleImageUpload = useCallback(async (
    key: string,
    files: FileList,
    onImageAdd: (imageData: { preview: string; isMain: boolean; alt?: string; caption?: string }) => void,
    onError?: (error: string) => void
  ) => {
    setUploadingImages(prev => ({ ...prev, [key]: true }));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select a valid image file');
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
          throw new Error('Image file size must be less than 10MB');
        }

        // Create preview
        const preview = await createImagePreview(file);
        const imageData = {
          preview,
          isMain: false,
          alt: '',
          caption: '',
        };

        onImageAdd(imageData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading images';
      console.error('Error uploading images:', error);
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    } finally {
      setUploadingImages(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const isUploading = useCallback((key: string) => {
    return uploadingImages[key] || false;
  }, [uploadingImages]);

  return {
    handleImageUpload,
    isUploading,
    createImagePreview,
  };
}

// ============================================================================
// RICH TEXT EDITOR HOOK
// ============================================================================

export function useRichTextEditor(initialContent: string = '') {
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    
    // Calculate word count and read time
    const text = newContent.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const readTimeMinutes = Math.ceil(wordCount / 200); // Assume 200 words per minute
    
    setWordCount(wordCount);
    setReadTime(readTimeMinutes);
  }, []);

  return {
    content,
    wordCount,
    readTime,
    updateContent,
    setContent
  };
}

// ============================================================================
// PUBLIC BLOG HOOKS
// ============================================================================

export function usePublicBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadPublishedBlogs = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tagId?: number;
    categoryId?: number;
    featured?: boolean;
  }) => {
    try {
      const result = await execute(async () => {
        return await blogApi.getPublishedBlogs(params);
      });
      
      if (result) {
        setBlogs(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading published blogs:', error);
      throw error;
    }
  }, [execute]);

  const getFeaturedBlogs = useCallback(async (limit: number = 5) => {
    try {
      const result = await execute(async () => {
        return await blogApi.getFeaturedBlogs(limit);
      });
      return result;
    } catch (error) {
      console.error('Error loading featured blogs:', error);
      throw error;
    }
  }, [execute]);

  const getBlogBySlug = useCallback(async (slug: string) => {
    try {
      const result = await execute(async () => {
        return await blogApi.getBlogBySlug(slug);
      });
      return result;
    } catch (error) {
      console.error('Error loading blog by slug:', error);
      throw error;
    }
  }, [execute]);

  const searchBlogs = useCallback(async (searchParams: {
    query: string;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'popularity';
    tags?: string;
    categories?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      const result = await execute(async () => {
        return await blogApi.searchBlogs(searchParams);
      });
      return result;
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  }, [execute]);

  return {
    blogs,
    totalPages,
    total,
    loading,
    error,
    loadPublishedBlogs,
    getFeaturedBlogs,
    getBlogBySlug,
    searchBlogs,
    clearError
  };
}

// ============================================================================
// BLOG DETAIL HOOK
// ============================================================================

export function useBlogDetail(blogId: number) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation<Blog>();

  const loadBlog = useCallback(async () => {
    try {
      const result = await execute(async () => {
        return await blogApi.getBlog(blogId);
      });
      setBlog(result);
      return result;
    } catch (error) {
      console.error('Error loading blog:', error);
      throw error;
    }
  }, [blogId, execute]);

  const updateBlog = useCallback(async (data: UpdateBlogData, imageFiles: File[] = []) => {
    try {
      const result = await execute(async () => {
        return await blogApi.updateBlog(blogId, data, imageFiles);
      });
      setBlog(result);
      return result;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }, [blogId, execute]);

  return {
    blog,
    loading,
    error,
    loadBlog,
    updateBlog,
    clearError
  };
}