import { useState, useCallback } from 'react';
import { blogApi } from '@/lib/api/completeBlogApi';

type Blog = { id: number; [key: string]: any };

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlogs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.getBlogs(filters);
      setBlogs(data.data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await blogApi.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { blogs, loading, error, loadBlogs, deleteBlog };
}