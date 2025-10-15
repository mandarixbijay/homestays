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
  author: {
    id: number;
    name: string;
    email: string;
  };
  tags: Tag[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
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