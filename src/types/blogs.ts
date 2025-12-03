// Lightweight interface for blog listings (thumbnails endpoint)
export interface BlogThumbnail {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  readTime?: number;
  viewCount: number;
  featured: boolean;
  author: {
    name: string;
  };
}

// Full blog interface for detail pages
export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  publishedAt?: string;
  readTime?: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  images: BlogImage[];
  tags: Tag[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogImage {
  id: number;
  url: string;
  alt?: string;
  caption?: string;
  isMain: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

// API Response interfaces
export interface BlogListResponse {
  data: BlogThumbnail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}