// Complete Blog API Client Implementation
// File: lib/api/completeBlogApi.ts

import { getSession } from 'next-auth/react';

// Use proxy path for client-side requests, direct URL for server-side
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/backend' // Use proxy path for client-side requests
  : 'http://13.61.8.56:3001'; // Direct URL for server-side requests

// ============================================================================
// BLOG TYPES (Enhanced)
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

export interface UpdateBlogData extends Partial<CreateBlogData> {}

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

  // ============================================================================
  // BLOG CRUD OPERATIONS
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

      // Handle images
      const imageMetadata = blogData.images || [];
      formData.append('images', JSON.stringify(imageMetadata));

      // Handle tags and categories
      formData.append('tagIds', JSON.stringify(blogData.tagIds || []));
      formData.append('categoryIds', JSON.stringify(blogData.categoryIds || []));

      // Add image files
      imageFiles.forEach((file, index) => {
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
      return result;
    } catch (error) {
      console.error('[createBlog] Error:', error);
      throw error;
    }
  }

  async updateBlog(id: number, blogData: UpdateBlogData, imageFiles: File[] = []): Promise<Blog> {
    try {
      const formData = new FormData();

      // Add fields that are being updated
      Object.entries(blogData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'images') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'tagIds' || key === 'categoryIds') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add image files
      imageFiles.forEach((file) => {
        formData.append('files', file);
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

      return await response.json();
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(id: number): Promise<void> {
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

  // ============================================================================
  // PUBLIC BLOG OPERATIONS
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
    return this.request<Blog>(`/blog/blogs/slug/${slug}`);
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
  // BLOG STATISTICS
  // ============================================================================

  async getBlogStats(): Promise<BlogStats> {
    return this.request<BlogStats>('/blog/stats');
  }

  // ============================================================================
  // TAG OPERATIONS
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
    return this.request<Tag>(`/blog/admin/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: number): Promise<void> {
    await this.request(`/blog/admin/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // CATEGORY OPERATIONS
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
    return this.request<Category>(`/blog/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await this.request(`/blog/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // EXPORT OPERATIONS
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
}

// Export singleton instance
export const blogApi = new BlogApi();

