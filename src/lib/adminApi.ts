// lib/adminApi.ts
import api from './api';

export interface DashboardMetrics {
  totalHomestays: number;
  pendingApprovals: number;
  totalBookings: number;
  totalRevenue: number;
  recentActivity: RecentActivity[];
  topHomestays: TopHomestay[];
  bookingStats: BookingStats;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'registration' | 'approval' | 'review';
  message: string;
  timestamp: string;
  user?: string;
  homestayName?: string;
}

export interface TopHomestay {
  id: number;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface BookingStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  growth: number;
}

// Fetch dashboard metrics
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await api.get('/admin/dashboard/metrics');
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to fetch dashboard metrics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch metrics');
  }
}

// Fetch all homestays
export async function getAllHomestays() {
  try {
    const response = await api.get('/admin/homestays');
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to fetch homestays:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch homestays');
  }
}

// Fetch pending homestays
export async function getPendingHomestays() {
  try {
    const response = await api.get('/admin/homestays?status=PENDING');
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to fetch pending homestays:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pending homestays');
  }
}

// Fetch all users
export async function getAllUsers(page: number = 1, limit: number = 10) {
  try {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to fetch users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
}

// Fetch all bookings
export async function getAllBookings() {
  try {
    const response = await api.get('/admin/bookings');
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to fetch bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
}

// Approve homestay
export async function approveHomestay(id: number) {
  try {
    const response = await api.patch(`/admin/homestays/${id}/approve`);
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to approve homestay:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve homestay');
  }
}

// Reject homestay
export async function rejectHomestay(id: number, reason?: string) {
  try {
    const response = await api.patch(`/admin/homestays/${id}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to reject homestay:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject homestay');
  }
}

// Delete homestay
export async function deleteHomestay(id: number) {
  try {
    const response = await api.delete(`/admin/homestays/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('[AdminAPI] Failed to delete homestay:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete homestay');
  }
}