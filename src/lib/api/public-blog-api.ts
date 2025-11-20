// lib/api/public-blog-api.ts - Optimized version with caching
import { cache } from 'react';

export interface PublicBlog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: 'PUBLISHED';
  featured: boolean;
  publishedAt: string;
  readTime?: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  author: {
    id: number;
    name: string;
    email?: string;
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

export interface BlogListResponse {
  data: PublicBlog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BlogSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  categoryId?: number;
  featured?: boolean;
  category?: string;
  tag?: string;
}

class PublicBlogApi {
  private baseUrl = typeof window !== 'undefined' 
    ? '/api/backend' 
    : 'http://13.61.8.56:3001'; // Direct URL for server-side

  // Helper function to process image URLs
  private processImageUrl(url: string | undefined): string {
    if (!url) return '/images/fallback-image.png';

    // If it's already a local path, return as-is
    if (url.startsWith('/')) return url;

    // Block example.com URLs (from your API mock data)
    if (url.includes('example.com')) {
      return '/images/fallback-image.png';
    }

    return url;
  }

  // Transform API response to match our interface
  private transformBlogData(apiData: any): PublicBlog {
    return {
      id: apiData.id,
      slug: apiData.slug,
      title: apiData.title,
      excerpt: apiData.excerpt,
      content: apiData.content,
      featuredImage: this.processImageUrl(apiData.featuredImage),
      status: apiData.status,
      featured: apiData.featured,
      publishedAt: apiData.publishedAt,
      readTime: apiData.readTime,
      viewCount: apiData.viewCount,
      seoTitle: apiData.seoTitle,
      seoDescription: apiData.seoDescription,
      author: {
        id: apiData.author.id,
        name: apiData.author.name,
        email: apiData.author.email,
      },
      images: apiData.images?.map((img: any) => ({
        id: img.id,
        url: this.processImageUrl(img.url),
        alt: img.alt || '',
        caption: img.caption || '',
        isMain: img.isMain || false,
      })) || [],
      tags: apiData.tags?.map((tagRel: any) => ({
        id: tagRel.tag?.id || tagRel.tagId,
        name: tagRel.tag?.name || tagRel.name,
        slug: tagRel.tag?.slug || tagRel.slug,
        color: tagRel.tag?.color || tagRel.color,
      })) || [],
      categories: apiData.categories?.map((catRel: any) => ({
        id: catRel.category?.id || catRel.categoryId,
        name: catRel.category?.name || catRel.name,
        slug: catRel.category?.slug || catRel.slug,
        color: catRel.category?.color || catRel.color,
      })) || [],
    };
  }

  private async request<T>(endpoint: string, cacheTime: number = 3600): Promise<T> {
    try {
      // Fix URL construction
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`[BlogAPI] Fetching: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: cacheTime, // Configurable cache time
          tags: ['blogs'] // Add tag for on-demand revalidation
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[BlogAPI] Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`[BlogAPI] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Get published blogs with pagination and filters
  async getPublishedBlogs(params: BlogSearchParams = {}): Promise<BlogListResponse> {
    const searchParams = new URLSearchParams();
    
    // Add parameters to search
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/blog/blogs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    try {
      const result = await this.request<any>(endpoint);
      
      // Handle both single blog and array responses
      if (Array.isArray(result)) {
        return {
          data: result.map(blog => this.transformBlogData(blog)),
          total: result.length,
          page: 1,
          totalPages: 1,
        };
      } else if (result.data && Array.isArray(result.data)) {
        return {
          ...result,
          data: result.data.map((blog: any) => this.transformBlogData(blog)),
        };
      } else {
        // If it's a single blog, wrap it in an array
        return {
          data: [this.transformBlogData(result)],
          total: 1,
          page: 1,
          totalPages: 1,
        };
      }
    } catch (error) {
      console.error('Error fetching published blogs:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }

  // Get featured blogs
  async getFeaturedBlogs(limit: number = 3): Promise<PublicBlog[]> {
    try {
      const result = await this.request<any>(`/blog/blogs/featured?limit=${limit}`, 1800); // Cache for 30 minutes

      if (Array.isArray(result)) {
        return result.map(blog => this.transformBlogData(blog));
      } else if (result.data && Array.isArray(result.data)) {
        return result.data.map((blog: any) => this.transformBlogData(blog));
      }

      return [];
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      return [];
    }
  }

  // Get blog by slug (with React cache for request deduplication)
  getBlogBySlug = cache(async (slug: string): Promise<PublicBlog> => {
    const result = await this.request<any>(`/blog/blogs/${slug}`, 3600); // Cache for 1 hour
    return this.transformBlogData(result);
  });

  // Search blogs
  async searchBlogs(params: {
    query: string;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'popularity';
  }): Promise<BlogListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    try {
      const result = await this.request<any>(`/blog/search?${searchParams.toString()}`);
      
      if (Array.isArray(result)) {
        return {
          data: result.map(blog => this.transformBlogData(blog)),
          total: result.length,
          page: 1,
          totalPages: 1,
        };
      } else if (result.data && Array.isArray(result.data)) {
        return {
          ...result,
          data: result.data.map((blog: any) => this.transformBlogData(blog)),
        };
      }
      
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error searching blogs:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }

  // Get related blogs
  async getRelatedBlogs(slug: string, limit: number = 3): Promise<PublicBlog[]> {
    try {
      const result = await this.request<any>(`/blog/blogs/${slug}/related?limit=${limit}`, 1800); // Cache for 30 minutes

      if (Array.isArray(result)) {
        return result.map(blog => this.transformBlogData(blog));
      } else if (result.data && Array.isArray(result.data)) {
        return result.data.map((blog: any) => this.transformBlogData(blog));
      }

      return [];
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      return [];
    }
  }

  // Get all categories (with React cache for request deduplication)
  getCategories = cache(async () => {
    try {
      const result = await this.request<any>(`/blog/categories`, 7200); // Cache for 2 hours
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  });

  // Get all tags (with React cache for request deduplication)
  getTags = cache(async () => {
    try {
      const result = await this.request<any>(`/blog/tags`, 7200); // Cache for 2 hours
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  });
}

export const publicBlogApi = new PublicBlogApi();