// hooks/useCompleteBlogApi.ts - Complete Fixed Blog hooks with proper image handling, status management, and category/tag sanitization

import { useState, useCallback } from 'react';
import { blogApi, Blog, CreateBlogData, UpdateBlogData, BlogFilters, Tag, Category, BlogStats } from '@/lib/api/completeBlogApi';
import { useAsyncOperation, useFilters } from '@/hooks/useAdminApi';

// ============================================================================
// ID SANITIZATION HELPER
// ============================================================================

/**
 * Sanitizes category and tag IDs by removing null, undefined, 0, and invalid values
 * Ensures only valid positive integers are returned
 */
export function sanitizeIds(ids: any[] | undefined): number[] {
  if (!ids || !Array.isArray(ids)) {
    return [];
  }
  
  return ids
    .filter(id => {
      // Remove null, undefined, empty strings, and zero
      return id !== null && id !== undefined && id !== 0 && id !== '';
    })
    .map(id => {
      // Convert strings to numbers
      return typeof id === 'string' ? parseInt(id, 10) : id;
    })
    .filter(id => {
      // Remove NaN and negative numbers
      return !isNaN(id) && id > 0;
    });
}

// ============================================================================
// IMAGE UPLOAD HELPER FUNCTIONS
// ============================================================================

// Fallback image upload function if uploadMultipleImages doesn't exist
const uploadImagesHelper = async (files: File[]): Promise<Array<{ url: string; alt?: string; caption?: string }>> => {
  // Check if the method exists on blogApi
  if (typeof blogApi.uploadMultipleImages === 'function') {
    return await blogApi.uploadMultipleImages(files);
  }
  
  // Fallback: upload images one by one if uploadImage method exists
  if (typeof blogApi.uploadImage === 'function') {
    const uploadedImages = [];
    for (const file of files) {
      try {
        const result = await blogApi.uploadImage(file);
        uploadedImages.push(result);
      } catch (error) {
        console.error('Failed to upload image:', error);
        // Continue with other images
      }
    }
    return uploadedImages;
  }
  
  // Final fallback: create local URLs (for development)
  console.warn('No image upload methods available, using local URLs');
  return files.map(file => ({
    url: URL.createObjectURL(file),
    alt: '',
    caption: ''
  }));
};

// ============================================================================
// ENHANCED BLOG MANAGEMENT HOOKS
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
      console.log('[useBlogs] Creating blog with:', { blogData, imageFiles: imageFiles.length });
      
      // ✅ FIX: Sanitize categoryIds and tagIds before processing
      const sanitizedBlogData = {
        ...blogData,
        categoryIds: sanitizeIds(blogData.categoryIds),
        tagIds: sanitizeIds(blogData.tagIds)
      };

      console.log('[useBlogs] Sanitized IDs:', {
        originalCategoryIds: blogData.categoryIds,
        sanitizedCategoryIds: sanitizedBlogData.categoryIds,
        originalTagIds: blogData.tagIds,
        sanitizedTagIds: sanitizedBlogData.tagIds
      });

      // Validate required fields
      if (!sanitizedBlogData.title?.trim()) {
        throw new Error('Blog title is required');
      }

      if (!sanitizedBlogData.content?.trim()) {
        throw new Error('Blog content is required');
      }

      if (!sanitizedBlogData.authorId || sanitizedBlogData.authorId <= 0) {
        throw new Error('Valid author ID is required');
      }
      
      const result = await execute(async () => {
        // First upload images if any
        let uploadedImages: Array<{ url: string; alt?: string; caption?: string }> = [];
        
        if (imageFiles.length > 0) {
          console.log('[useBlogs] Uploading images...');
          try {
            uploadedImages = await uploadImagesHelper(imageFiles);
            console.log('[useBlogs] Images uploaded:', uploadedImages);
          } catch (uploadError) {
            console.error('[useBlogs] Image upload failed:', uploadError);
            // Continue with blog creation even if image upload fails
            uploadedImages = [];
          }
        }

        // Merge uploaded images with existing image metadata
        const finalImages = sanitizedBlogData.images?.map((img, index) => {
          const uploadedImage = uploadedImages[index];
          return {
            ...img,
            url: uploadedImage?.url || img.url,
          };
        }) || uploadedImages.map((img, index) => ({
          ...img,
          isMain: index === 0, // First image is main by default
          alt: img.alt || '',
          caption: img.caption || ''
        }));

        // Update blog data with uploaded images and sanitized IDs
        const finalBlogData = {
          ...sanitizedBlogData,
          images: finalImages,
          featuredImage: finalImages.find(img => img.isMain)?.url || sanitizedBlogData.featuredImage
        };

        console.log('[useBlogs] Creating blog with final data:', {
          ...finalBlogData,
          categoryIds: finalBlogData.categoryIds,
          tagIds: finalBlogData.tagIds
        });

        return await blogApi.createBlog(finalBlogData, []); // No files needed now
      });
      
      console.log('[useBlogs] Blog created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }, [execute]);

  const updateBlog = useCallback(async (id: number, blogData: UpdateBlogData, imageFiles: File[] = []) => {
    try {
      console.log('[useBlogs] Updating blog:', { id, blogData, imageFiles: imageFiles.length });
      
      // ✅ FIX: Sanitize categoryIds and tagIds before processing
      const sanitizedBlogData = {
        ...blogData,
        categoryIds: sanitizeIds(blogData.categoryIds),
        tagIds: sanitizeIds(blogData.tagIds)
      };

      console.log('[useBlogs] Sanitized IDs for update:', {
        originalCategoryIds: blogData.categoryIds,
        sanitizedCategoryIds: sanitizedBlogData.categoryIds,
        originalTagIds: blogData.tagIds,
        sanitizedTagIds: sanitizedBlogData.tagIds
      });

      // Validate if updating critical fields
      if (sanitizedBlogData.title !== undefined && !sanitizedBlogData.title?.trim()) {
        throw new Error('Blog title cannot be empty');
      }

      if (sanitizedBlogData.content !== undefined && !sanitizedBlogData.content?.trim()) {
        throw new Error('Blog content cannot be empty');
      }
      
      const result = await execute(async () => {
        // First upload new images if any
        let uploadedImages: Array<{ url: string; alt?: string; caption?: string }> = [];
        
        if (imageFiles.length > 0) {
          console.log('[useBlogs] Uploading new images...');
          try {
            uploadedImages = await uploadImagesHelper(imageFiles);
            console.log('[useBlogs] New images uploaded:', uploadedImages);
          } catch (uploadError) {
            console.error('[useBlogs] Image upload failed:', uploadError);
            // Continue with blog update even if image upload fails
            uploadedImages = [];
          }
        }

        // Merge existing images with newly uploaded ones
        const existingImages = sanitizedBlogData.images?.filter(img => img.id) || [];
        const newImageMetadata = uploadedImages.map((img, index) => ({
          url: img.url,
          alt: img.alt || '',
          caption: img.caption || '',
          isMain: existingImages.length === 0 && index === 0 // First new image is main if no existing images
        }));

        const finalImages = [...existingImages, ...newImageMetadata];

        // Update blog data with all images and sanitized IDs
        const finalBlogData = {
          ...sanitizedBlogData,
          images: finalImages.length > 0 ? finalImages : undefined,
          featuredImage: finalImages.find(img => img.isMain)?.url || sanitizedBlogData.featuredImage
        };

        console.log('[useBlogs] Updating blog with final data:', {
          id,
          categoryIds: finalBlogData.categoryIds,
          tagIds: finalBlogData.tagIds,
          imageCount: finalImages.length
        });

        return await blogApi.updateBlog(id, finalBlogData, []); // No files needed now
      });
      
      console.log('[useBlogs] Blog updated successfully:', result);
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
      // ✅ FIX: Validate blog IDs
      const validBlogIds = sanitizeIds(blogIds);
      
      if (validBlogIds.length === 0) {
        throw new Error('No valid blog IDs provided');
      }

      console.log('[useBlogs] Bulk action:', {
        action,
        originalIds: blogIds,
        validIds: validBlogIds
      });

      const result = await execute(async () => {
        return await blogApi.bulkBlogActions({ blogIds: validBlogIds, action });
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
// BLOG DETAIL HOOK WITH ENHANCED ERROR HANDLING
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
      setBlog(null);
      throw error;
    }
  }, [blogId, execute]);

  const updateBlog = useCallback(async (data: UpdateBlogData, imageFiles: File[] = []) => {
    try {
      // ✅ FIX: Sanitize IDs
      const sanitizedData = {
        ...data,
        categoryIds: sanitizeIds(data.categoryIds),
        tagIds: sanitizeIds(data.tagIds)
      };

      console.log('[useBlogDetail] Updating with sanitized data:', {
        originalCategoryIds: data.categoryIds,
        sanitizedCategoryIds: sanitizedData.categoryIds,
        originalTagIds: data.tagIds,
        sanitizedTagIds: sanitizedData.tagIds
      });

      const result = await execute(async () => {
        // Upload new images first if any
        let uploadedImages: Array<{ url: string; alt?: string; caption?: string }> = [];
        
        if (imageFiles.length > 0) {
          try {
            uploadedImages = await uploadImagesHelper(imageFiles);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            uploadedImages = [];
          }
        }

        // Merge existing and new images
        const existingImages = sanitizedData.images?.filter(img => img.id) || [];
        const newImageMetadata = uploadedImages.map((img, index) => ({
          url: img.url,
          alt: img.alt || '',
          caption: img.caption || '',
          isMain: existingImages.length === 0 && index === 0
        }));

        const finalImages = [...existingImages, ...newImageMetadata];

        const finalData = {
          ...sanitizedData,
          images: finalImages.length > 0 ? finalImages : undefined,
          featuredImage: finalImages.find(img => img.isMain)?.url || sanitizedData.featuredImage
        };

        return await blogApi.updateBlog(blogId, finalData, []);
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

// ============================================================================
// ENHANCED BLOG FORM HOOK
// ============================================================================

export function useBlogForm(initialData?: Partial<CreateBlogData>) {
  const [formData, setFormData] = useState<CreateBlogData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    images: [],
    tagIds: sanitizeIds(initialData?.tagIds) || [],
    categoryIds: sanitizeIds(initialData?.categoryIds) || [],
    authorId: initialData?.authorId || 0,
    status: initialData?.status || 'DRAFT',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    readTime: initialData?.readTime || 0,
    featured: initialData?.featured || false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof CreateBlogData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // ✅ FIX: Sanitize IDs when updating categoryIds or tagIds
      if (field === 'categoryIds' || field === 'tagIds') {
        updated[field] = sanitizeIds(value);
        console.log(`[useBlogForm] Sanitized ${field}:`, {
          original: value,
          sanitized: updated[field]
        });
      }
      
      // Auto-generate slug from title if slug is empty
      if (field === 'title' && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }
      
      return updated;
    });
    
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
    const defaultData = {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      images: [],
      tagIds: [],
      categoryIds: [],
      authorId: 0,
      status: 'DRAFT' as const,
      seoTitle: '',
      seoDescription: '',
      readTime: 0,
      featured: false,
      ...newData
    };

    // ✅ FIX: Sanitize IDs when resetting
    defaultData.categoryIds = sanitizeIds(defaultData.categoryIds);
    defaultData.tagIds = sanitizeIds(defaultData.tagIds);

    setFormData(defaultData);
    setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.authorId || formData.authorId <= 0) {
      newErrors.authorId = 'Author is required';
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    // ✅ FIX: Validate that categoryIds and tagIds don't contain invalid values
    const sanitizedCategoryIds = sanitizeIds(formData.categoryIds);
    const sanitizedTagIds = sanitizeIds(formData.tagIds);

    if (formData.categoryIds?.length !== sanitizedCategoryIds.length) {
      console.warn('[useBlogForm] Some category IDs were invalid and removed:', {
        original: formData.categoryIds,
        sanitized: sanitizedCategoryIds
      });
      // Auto-fix by updating formData
      formData.categoryIds = sanitizedCategoryIds;
    }

    if (formData.tagIds?.length !== sanitizedTagIds.length) {
      console.warn('[useBlogForm] Some tag IDs were invalid and removed:', {
        original: formData.tagIds,
        sanitized: sanitizedTagIds
      });
      // Auto-fix by updating formData
      formData.tagIds = sanitizedTagIds;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    setFormData,
    errors,
    updateField,
    setFieldError,
    clearErrors,
    resetForm,
    validateForm
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
// ENHANCED TAG MANAGEMENT HOOKS
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
      setTags([]);
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
// ENHANCED CATEGORY MANAGEMENT HOOKS
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
      setCategories([]);
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
      setCategoryHierarchy([]);
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
      await loadCategories();
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
      await loadCategories();
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
      await loadCategories();
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