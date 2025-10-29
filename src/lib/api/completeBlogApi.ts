// Fixed Blog API Client for Existing Backend Endpoints
// File: lib/api/blog.ts (Fixed for your endpoints)

import { getSession } from 'next-auth/react';

// Use proxy path for client-side requests, direct URL for server-side
const API_BASE_URL = typeof window !== 'undefined'
  ? '/api/backend' // Use proxy path for client-side requests
  : 'http://13.61.8.56:3001'; // Direct URL for server-side requests

// ============================================================================
// BLOG TYPES
// ============================================================================

export interface BlogImage {
  id?: number;
  url?: string;
  alt?: string;
  caption?: string;
  isMain: boolean;
}

export interface CreateBlogData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  images?: BlogImage[];
  tagIds?: number[];
  categoryIds?: number[];
  authorId: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number;
  featured?: boolean;
}

export interface UpdateBlogData extends Partial<CreateBlogData> { }

export interface BlogFilters {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: number;
  title?: string;
  tagId?: number;
  categoryId?: number;
  featured?: boolean;
  search?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  _count?: {
    blogs: number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  _count?: {
    blogs: number;
  };
}

export interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalViews: number;
  totalTags: number;
  totalCategories: number;
  featuredBlogs: number;
  mostViewedBlogs: Array<{
    id: number;
    title: string;
    slug: string;
    viewCount: number;
  }>;
  recentBlogs: Array<{
    id: number;
    title: string;
    slug: string;
    publishedAt: string;
  }>;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  publishedAt?: string;
  readTime?: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  images: Array<{
    id: number;
    url: string;
    alt?: string;
    caption?: string;
    isMain: boolean;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    color?: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    color?: string;
  }>;
}

// ============================================================================
// BLOG API CLASS
// ============================================================================

class BlogApi {
  // Map to store file URLs and their corresponding File objects
  private fileMap = new Map<string, File>();

  private async getAuthHeaders() {
    const session = await getSession();
    return {
      'Authorization': `Bearer ${session?.user?.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isFormData: boolean = false
  ): Promise<T> {
    try {
      const session = await getSession();

      if (!session?.user?.accessToken) {
        throw new Error('No access token available. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Blog API Error] ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Blog API Error: ${response.status} - ${errorText}`);
      }

      // Handle empty response (e.g., 204 No Content)
      if (response.status === 204 || !response.body) {
        return { success: true } as T;
      }

      const text = await response.text();
      if (!text) {
        return { success: true } as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (error) {
        console.error(`[Blog API Error] Failed to parse JSON for ${endpoint}:`, { text, error });
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error(`[Blog API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // Upload image to S3
  private async uploadImageToS3(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const session = await getSession();
    const response = await fetch(`${API_BASE_URL}/s3/upload/blog-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.user?.accessToken}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.url;
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      console.log('[checkSlugAvailability] Checking slug:', slug);
      const response = await this.request<{ available: boolean }>(
        `/blog/admin/blogs/check-slug?slug=${encodeURIComponent(slug)}`
      );
      console.log('[checkSlugAvailability] Result:', response);
      return response.available;
    } catch (error) {
      console.error('[checkSlugAvailability] Error:', error);
      // If endpoint doesn't exist, assume available
      return true;
    }
  }

  // ============================================================================
  // BLOG CRUD OPERATIONS (Fixed)
  // ============================================================================

  async getBlogs(filters: BlogFilters = {}): Promise<{
    data: Blog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/blog/admin/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      data: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint);
  }

  async getBlog(id: number): Promise<Blog> {
    // Fixed: Ensure ID is valid
    if (!id || isNaN(id)) {
      throw new Error('Invalid blog ID provided');
    }
    return this.request<Blog>(`/blog/admin/blogs/${id}`);
  }

  async createBlog(blogData: CreateBlogData, imageFiles: File[] = []): Promise<Blog> {
    console.log('[createBlog] Starting creation...', { blogData, imageFiles: imageFiles.length });

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('title', blogData.title);
      formData.append('authorId', blogData.authorId.toString());
      formData.append('status', blogData.status || 'DRAFT');
      formData.append('featured', (blogData.featured || false).toString());

      // Add optional fields
      if (blogData.slug) formData.append('slug', blogData.slug);
      if (blogData.excerpt) formData.append('excerpt', blogData.excerpt);
      if (blogData.content) formData.append('content', blogData.content);
      if (blogData.featuredImage) formData.append('featuredImage', blogData.featuredImage);
      if (blogData.seoTitle) formData.append('seoTitle', blogData.seoTitle);
      if (blogData.seoDescription) formData.append('seoDescription', blogData.seoDescription);
      if (blogData.readTime) formData.append('readTime', blogData.readTime.toString());

      // Process images - match blob URLs with actual files
      const processedImages = blogData.images?.map(img => {
        // Check if this is a blob URL and we have the corresponding file
        const file = this.fileMap.get(img.url || '');
        if (file) {
          // This is a new file to upload
          imageFiles.push(file);
          return {
            ...img,
            url: '' // Clear URL since we'll upload the file
          };
        }
        return img;
      }) || [];

      formData.append('images', JSON.stringify(processedImages));

      // Handle tags and categories
      formData.append('tagIds', JSON.stringify(blogData.tagIds || []));
      formData.append('categoryIds', JSON.stringify(blogData.categoryIds || []));

      // Add ALL image files (from gallery and content)
      const allImageFiles = [...imageFiles, ...Array.from(this.fileMap.values())];
      allImageFiles.forEach((file, index) => {
        formData.append('files', file);
        console.log(`[createBlog] Added image file ${index}:`, file.name);
      });

      const session = await getSession();
      const response = await fetch(`${API_BASE_URL}/blog/admin/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[createBlog] Error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to create blog: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[createBlog] Success:', result);
      
      // Clear the file map after successful upload
      this.fileMap.clear();
      
      return result;
    } catch (error) {
      console.error('[createBlog] Error:', error);
      throw error;
    }
  }

  async updateBlog(id: number, blogData: UpdateBlogData, imageFiles: File[] = []): Promise<Blog> {
    // Fixed: Ensure ID is valid
    if (!id || isNaN(id)) {
      throw new Error('Invalid blog ID provided for update');
    }

    try {
      const formData = new FormData();

      // Add fields that are being updated
      Object.entries(blogData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'images') {
            // Process images - match blob URLs with actual files
            const processedImages = (value as BlogImage[]).map(img => {
              const file = this.fileMap.get(img.url || '');
              if (file) {
                imageFiles.push(file);
                return { ...img, url: '' };
              }
              return img;
            });
            formData.append(key, JSON.stringify(processedImages));
          } else if (key === 'tagIds' || key === 'categoryIds') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'status') {
            // Ensure status is properly set
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add ALL image files (from gallery and content)
      const allImageFiles = [...imageFiles, ...Array.from(this.fileMap.values())];
      allImageFiles.forEach((file) => {
        formData.append('files', file);
        console.log('[updateBlog] Added image file:', file.name);
      });

      const session = await getSession();
      const response = await fetch(`${API_BASE_URL}/blog/admin/blogs/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update blog: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Clear the file map after successful update
      this.fileMap.clear();
      
      return result;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(id: number): Promise<void> {
    // Fixed: Ensure ID is valid
    if (!id || isNaN(id)) {
      throw new Error('Invalid blog ID provided for deletion');
    }
    await this.request(`/blog/admin/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkBlogActions(data: {
    blogIds: number[];
    action: 'publish' | 'archive' | 'draft' | 'delete' | 'feature' | 'unfeature';
  }): Promise<{
    processedCount: number;
    failedCount: number;
    message: string;
  }> {
    return this.request('/blog/admin/blogs/bulk-actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadImage(file: File): Promise<{ url: string; alt?: string; caption?: string }> {
    // Create temporary blob URL for preview
    const blobUrl = URL.createObjectURL(file);
    
    // Store the file with its blob URL for later upload
    this.fileMap.set(blobUrl, file);
    
    return { url: blobUrl, alt: '', caption: '' };
  }

  async uploadMultipleImages(files: File[]): Promise<Array<{ url: string; alt?: string; caption?: string }>> {
    return Promise.all(files.map(file => this.uploadImage(file)));
  }

  // ============================================================================
  // PUBLIC BLOG OPERATIONS (Fixed endpoints)
  // ============================================================================

  async getPublishedBlogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    tagId?: number;
    categoryId?: number;
    featured?: boolean;
  } = {}): Promise<{
    data: Blog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/blog/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      data: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint);
  }

  async getFeaturedBlogs(limit: number = 5): Promise<Blog[]> {
    return this.request<Blog[]>(`/blog/blogs/featured?limit=${limit}`);
  }

  async getBlogBySlug(slug: string): Promise<Blog> {
    return this.request<Blog>(`/blog/blogs/${slug}`);
  }

  async searchBlogs(params: {
    query: string;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'popularity';
    tags?: string;
    categories?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    data: Blog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<{
      data: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/blog/search?${queryParams.toString()}`);
  }

  // ============================================================================
  // BLOG STATISTICS (Fixed endpoint)
  // ============================================================================

  async getBlogStats(): Promise<BlogStats> {
    return this.request<BlogStats>('/blog/stats');
  }

  // ============================================================================
  // TAG OPERATIONS (Fixed endpoints)
  // ============================================================================

  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/blog/tags');
  }

  async createTag(data: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
  }): Promise<Tag> {
    return this.request<Tag>('/blog/admin/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: number, data: Partial<{
    name: string;
    slug?: string;
    description?: string;
    color?: string;
  }>): Promise<Tag> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid tag ID provided for update');
    }
    return this.request<Tag>(`/blog/admin/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: number): Promise<void> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid tag ID provided for deletion');
    }
    await this.request(`/blog/admin/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // CATEGORY OPERATIONS (Fixed endpoints)
  // ============================================================================

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/blog/categories');
  }

  async getCategoryHierarchy(): Promise<Category[]> {
    return this.request<Category[]>('/blog/categories/hierarchy');
  }

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: number;
  }): Promise<Category> {
    return this.request<Category>('/blog/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<{
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    parentId?: number;
  }>): Promise<Category> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid category ID provided for update');
    }
    return this.request<Category>(`/blog/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid category ID provided for deletion');
    }
    await this.request(`/blog/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // EXPORT OPERATIONS (Fixed endpoint)
  // ============================================================================

  async exportBlogs(params: {
    format?: 'csv' | 'json';
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    dateFrom?: string;
    dateTo?: string;
    authorId?: number;
  } = {}): Promise<string> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/blog/admin/blogs/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} - ${response.statusText}`);
    }

    return await response.text();
  }

  // ============================================================================
  // ADDITIONAL METHODS BASED ON AVAILABLE ENDPOINTS
  // ============================================================================

  async getRelatedBlogs(slug: string, limit: number = 5): Promise<Blog[]> {
    return this.request<Blog[]>(`/blog/blogs/${slug}/related?limit=${limit}`);
  }

  async getTag(id: number): Promise<Tag> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid tag ID provided');
    }
    return this.request<Tag>(`/blog/tags/${id}`);
  }

  async getCategory(id: number): Promise<Category> {
    if (!id || isNaN(id)) {
      throw new Error('Invalid category ID provided');
    }
    return this.request<Category>(`/blog/categories/${id}`);
  }
}

// Export singleton instance
export const blogApi = new BlogApi();