import { useState, useCallback } from 'react';
import { blogApi } from '@/lib/api/completeBlogApi';
import type { BlogStats } from '@/lib/api/completeBlogApi';

function useBlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBlogStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogApi.getBlogStats();
      setStats(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, loadBlogStats };
}

export default useBlogStats;