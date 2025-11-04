// hooks/useAdminDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardMetrics, 
  getAllHomestays,
  getPendingHomestays,
  getAllBookings,
  DashboardMetrics 
} from '@/lib/adminApi';

export function useAdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [pendingHomestays, setPendingHomestays] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [metricsData, homestaysData, pendingData, bookingsData] = await Promise.allSettled([
        getDashboardMetrics(),
        getAllHomestays(),
        getPendingHomestays(),
        getAllBookings(),
      ]);

      // Process metrics
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      } else {
        console.error('Failed to fetch metrics:', metricsData.reason);
      }

      // Process homestays
      if (homestaysData.status === 'fulfilled') {
        setHomestays(homestaysData.value);
      } else {
        console.error('Failed to fetch homestays:', homestaysData.reason);
      }

      // Process pending homestays
      if (pendingData.status === 'fulfilled') {
        setPendingHomestays(pendingData.value);
      } else {
        console.error('Failed to fetch pending homestays:', pendingData.reason);
      }

      // Process bookings
      if (bookingsData.status === 'fulfilled') {
        setBookings(bookingsData.value);
      } else {
        console.error('Failed to fetch bookings:', bookingsData.reason);
      }

    } catch (err: any) {
      console.error('[useAdminDashboard] Error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate metrics from actual data if backend doesn't provide them
  const calculatedMetrics = useCallback(() => {
    if (metrics) return metrics;

    // Fallback calculation from fetched data
    return {
      totalHomestays: homestays.length,
      pendingApprovals: pendingHomestays.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      recentActivity: [],
      topHomestays: [],
      bookingStats: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        growth: 0,
      },
    };
  }, [metrics, homestays, pendingHomestays, bookings]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics: calculatedMetrics(),
    homestays,
    pendingHomestays,
    bookings,
    loading,
    error,
    refresh: fetchDashboardData,
  };
}