import { getSession, signOut } from 'next-auth/react';
import { CreateHomestayDto } from '@/types/admin';

// Extend the session user type to include accessToken and refreshToken
declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      refreshToken?: string;
      [key: string]: any;
    };
  }
}

// Use proxy path for client-side requests, direct URL for server-side
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/backend' // Use proxy path for client-side requests
  : 'http://13.61.8.56:3001'; // Direct URL for server-side requests

interface DashboardStats {
  totalHomestays: number;
  pendingHomestays: number;
  approvedHomestays: number;
  rejectedHomestays: number;
  totalUsers: number;
  activeUsers: number;
  totalRooms: number;
  averageRating: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  recentActivity: ActivityItem[];
  growthStats: {
    homestaysGrowth: number;
    usersGrowth: number;
    bookingsGrowth: number;
    revenueGrowth: number;
  };
}

interface ActivityItem {
  id: number;
  type: 'homestay_created' | 'homestay_approved' | 'homestay_rejected' | 'user_registered' | 'booking_created' | 'payment_received';
  description: string;
  timestamp: string;
  userId?: number;
  homestayId?: number;
  bookingId?: number;
  metadata?: {
    userName?: string;
    homestayName?: string;
    amount?: number;
    status?: string;
  };
}

class AdminApiClient {
  private async getAuthHeaders() {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token found');
    }
    
    return {
      'Authorization': `Bearer ${session.user.accessToken}`,
    };
  }

  private async refreshToken(): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    try {
      console.log('[refreshToken] Attempting to refresh token...');
      
      // Get current session to extract refresh token
      const session = await getSession();
      const refreshToken = session?.user?.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[refreshToken] Error:', { status: response.status, error: errorText });
        throw new Error(`Refresh token failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.data?.accessToken || !result.data?.refreshToken || !result.data?.user) {
        throw new Error('Invalid refresh token response');
      }

      console.log('[refreshToken] Token refreshed successfully');

      // Update the session with new tokens
      // This requires triggering a session update
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'updateTokens',
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        }),
      });

      return result.data;
    } catch (error) {
      console.error('[refreshToken] Error:', error);
      // Sign out if refresh fails
      await signOut({ redirect: false });
      throw new Error('Session expired. Please log in again.');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.body instanceof FormData
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
        credentials: 'include',
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount < 1) {
        console.log('[API] Token expired, attempting refresh...');
        try {
          await this.refreshToken();
          // Retry the original request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API Error] ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API Error: ${response.status} - ${errorText}`);
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
        console.error(`[API Error] Failed to parse JSON for ${endpoint}:`, { text, error });
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, {
        error: error.message,
        status: error.status,
      });
      throw error;
    }
  }

  async forceRefreshToken(): Promise<void> {
    try {
      await this.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }
  

  // ============================================================================
  // DASHBOARD API METHODS
  // ============================================================================

  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getUsersCount(): Promise<{ total: number }> {
    return this.request<{ total: number }>('/admin/users/count');
  }

  async getMonthlyGrowthStats(): Promise<{
    homestaysGrowth: number;
    usersGrowth: number;
    bookingsGrowth: number;
    revenueGrowth: number;
  }> {
    return this.request('/admin/dashboard/growth');
  }

  async getSystemActivity(limit: number = 10): Promise<ActivityItem[]> {
    return this.request<ActivityItem[]>(`/admin/dashboard/activity?limit=${limit}`);
  }

  async getHomestaysByStatus(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    return this.request('/admin/homestays/stats');
  }

  async getAverageRating(): Promise<{ averageRating: number; totalRatings: number }> {
    return this.request('/admin/homestays/ratings/average');
  }

  async getTotalRoomsCount(): Promise<{ totalRooms: number }> {
    return this.request('/admin/homestays/rooms/count');
  }

  // Analytics endpoints
  async getHomestaysAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request<{
      totalHomestays: number;
      newHomestays: number;
      approvedHomestays: number;
      rejectedHomestays: number;
      pendingHomestays: number;
      growthPercentage: number;
      chartData: Array<{
        date: string;
        count: number;
        status: string;
      }>;
    }>(`/admin/analytics/homestays?period=${period}`);
  }

  async getUsersAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request<{
      totalUsers: number;
      newUsers: number;
      activeUsers: number;
      growthPercentage: number;
      chartData: Array<{
        date: string;
        count: number;
        type: string;
      }>;
    }>(`/admin/analytics/users?period=${period}`);
  }

  async getBookingsAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request<{
      totalBookings: number;
      revenue: number;
      averageBookingValue: number;
      occupancyRate: number;
      growthPercentage: number;
      chartData: Array<{
        date: string;
        bookings: number;
        revenue: number;
      }>;
    }>(`/admin/analytics/bookings?period=${period}`);
  }

  // ============================================================================
  // HELPER METHODS (existing code)
  // ============================================================================

  // Helper to clean image metadata for API
  private cleanImageMetadata(images: any[]) {
    return images.map(img => ({
      url: img.url || undefined,
      isMain: Boolean(img.isMain),
      tags: Array.isArray(img.tags) ? img.tags : []
    })).filter(img => img.url !== undefined && img.url !== '');
  }

  // Helper to prepare image metadata for new uploads
  private prepareImageMetadata(images: any[]) {
    return images.map(img => ({
      isMain: Boolean(img.isMain),
      tags: Array.isArray(img.tags) ? img.tags : []
    }));
  }

  // ============================================================================
  // HOMESTAY OPERATIONS (existing code)
  // ============================================================================

  async createHomestay(homestayData: CreateHomestayDto, imageFiles: File[] = []) {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;

    console.log('[createHomestay] Starting creation...');
    console.log('[createHomestay] Input data:', JSON.stringify(homestayData, null, 2));
    console.log('[createHomestay] Image files count:', imageFiles.length);

    try {
      const formData = new FormData();

      formData.append('propertyName', homestayData.propertyName);
      formData.append('propertyAddress', homestayData.propertyAddress);
      formData.append('contactNumber', homestayData.contactNumber);
      formData.append('ownerId', homestayData.ownerId.toString());
      formData.append('status', homestayData.status);
      formData.append('discount', homestayData.discount.toString());
      formData.append('vipAccess', homestayData.vipAccess.toString());
      
      if (homestayData.description) {
        formData.append('description', homestayData.description);
      }

      const existingHomestayImages = homestayData.imageMetadata.filter(img => img.url);
      const newHomestayImages = homestayData.imageMetadata.filter(img => !img.url);

      const homestayImageMetadata = [
        ...this.cleanImageMetadata(existingHomestayImages),
        ...this.prepareImageMetadata(newHomestayImages)
      ];

      let currentImageIndex = 0;
      const processedRooms = homestayData.rooms.map(room => {
        const existingRoomImages = room.images.filter(img => img.url);
        const newRoomImages = room.images.filter(img => !img.url);

        const roomImageMetadata = [
          ...this.cleanImageMetadata(existingRoomImages),
          ...this.prepareImageMetadata(newRoomImages)
        ];

        currentImageIndex += newRoomImages.length;

        return {
          name: room.name,
          description: room.description || '',
          totalArea: Number(room.totalArea) || 0,
          areaUnit: room.areaUnit,
          maxOccupancy: {
            adults: Number(room.maxOccupancy.adults) || 0,
            children: Number(room.maxOccupancy.children) || 0
          },
          minOccupancy: {
            adults: Number(room.minOccupancy.adults) || 0,
            children: Number(room.minOccupancy.children) || 0
          },
          price: {
            value: Number(room.price.value) || 0,
            currency: room.price.currency
          },
          includeBreakfast: Boolean(room.includeBreakfast),
          beds: room.beds.map(bed => ({
            bedTypeId: Number(bed.bedTypeId),
            quantity: Number(bed.quantity) || 1
          })),
          images: roomImageMetadata
        };
      });

      formData.append('imageMetadata', JSON.stringify(homestayImageMetadata));
      formData.append('facilityIds', JSON.stringify(homestayData.facilityIds || []));
      formData.append('customFacilities', JSON.stringify(homestayData.customFacilities || []));
      formData.append('rooms', JSON.stringify(processedRooms));

      imageFiles.forEach((file, index) => {
        formData.append('images', file);
        console.log(`[createHomestay] Added image ${index + 1}: ${file.name} (${file.size} bytes)`);
      });

      const expectedNewImages = newHomestayImages.length + 
        homestayData.rooms.reduce((count, room) => 
          count + room.images.filter(img => !img.url).length, 0);

      if (expectedNewImages !== imageFiles.length) {
        throw new Error(`Expected ${expectedNewImages} new image files, but received ${imageFiles.length}`);
      }

      console.log('[createHomestay] Sending request...');

      const response = await fetch(`${API_BASE_URL}/admin/homestays`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[createHomestay] Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[createHomestay] Success:', result);
      return result;

    } catch (error) {
      console.error('[createHomestay] Error:', error);
      throw error;
    }
  }

  async createBulkHomestays(homestays: CreateHomestayDto[], imageFiles: File[]) {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;

    console.log('[createBulkHomestays] Starting bulk creation...');
    console.log('[createBulkHomestays] Homestays count:', homestays.length);
    console.log('[createBulkHomestays] Image files count:', imageFiles.length);

    try {
      const formData = new FormData();

      let expectedImageCount = 0;
      const processedHomestays = homestays.map(homestay => {
        const newHomestayImages = homestay.imageMetadata.filter(img => !img.url);
        const newRoomImages = homestay.rooms.reduce((count, room) => 
          count + room.images.filter(img => !img.url).length, 0);
        
        expectedImageCount += newHomestayImages.length + newRoomImages;

        const existingHomestayImages = homestay.imageMetadata.filter(img => img.url);
        const homestayImageMetadata = [
          ...this.cleanImageMetadata(existingHomestayImages),
          ...this.prepareImageMetadata(newHomestayImages)
        ];

        const processedRooms = homestay.rooms.map(room => {
          const existingRoomImages = room.images.filter(img => img.url);
          const newRoomImagesForRoom = room.images.filter(img => !img.url);

          const roomImageMetadata = [
            ...this.cleanImageMetadata(existingRoomImages),
            ...this.prepareImageMetadata(newRoomImagesForRoom)
          ];

          return {
            name: room.name,
            description: room.description || '',
            totalArea: Number(room.totalArea) || 0,
            areaUnit: room.areaUnit,
            maxOccupancy: {
              adults: Number(room.maxOccupancy.adults) || 0,
              children: Number(room.maxOccupancy.children) || 0
            },
            minOccupancy: {
              adults: Number(room.minOccupancy.adults) || 0,
              children: Number(room.minOccupancy.children) || 0
            },
            price: {
              value: Number(room.price.value) || 0,
              currency: room.price.currency
            },
            includeBreakfast: Boolean(room.includeBreakfast),
            beds: room.beds.map(bed => ({
              bedTypeId: Number(bed.bedTypeId),
              quantity: Number(bed.quantity) || 1
            })),
            images: roomImageMetadata
          };
        });

        return {
          propertyName: homestay.propertyName,
          propertyAddress: homestay.propertyAddress,
          contactNumber: homestay.contactNumber,
          description: homestay.description || '',
          imageMetadata: homestayImageMetadata,
          facilityIds: homestay.facilityIds || [],
          customFacilities: homestay.customFacilities || [],
          ownerId: Number(homestay.ownerId),
          rooms: processedRooms,
          status: homestay.status,
          discount: Number(homestay.discount) || 0,
          vipAccess: Boolean(homestay.vipAccess)
        };
      });

      if (expectedImageCount !== imageFiles.length) {
        throw new Error(`Expected ${expectedImageCount} new image files, but received ${imageFiles.length}`);
      }

      formData.append('homestays', JSON.stringify(processedHomestays));

      imageFiles.forEach((file, index) => {
        formData.append('images', file);
        console.log(`[createBulkHomestays] Added image ${index + 1}: ${file.name} (${file.size} bytes)`);
      });

      console.log('[createBulkHomestays] Sending request...');

      const response = await fetch(`${API_BASE_URL}/admin/homestays/bulk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[createBulkHomestays] Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[createBulkHomestays] Success:', result);
      return result;

    } catch (error) {
      console.error('[createBulkHomestays] Error:', error);
      throw error;
    }
  }

 async getHomestays(params?: any) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/admin/homestays${query}`);
  }

  async getHomestay(id: number) {
    return this.request<any>(`/admin/homestays/${id}`);
  }

  async updateHomestay(id: number, homestayData: any, imageFiles: File[] = []) {
    const formData = new FormData();
    
    formData.append('propertyName', homestayData.propertyName);
    formData.append('propertyAddress', homestayData.propertyAddress);
    formData.append('contactNumber', homestayData.contactNumber);
    formData.append('ownerId', homestayData.ownerId.toString());
    formData.append('status', homestayData.status);
    formData.append('discount', homestayData.discount.toString());
    formData.append('vipAccess', homestayData.vipAccess.toString());
    
    if (homestayData.description) {
      formData.append('description', homestayData.description);
    }

    const existingHomestayImages = homestayData.imageMetadata.filter((img: any) => img.url);
    const newHomestayImages = homestayData.imageMetadata.filter((img: any) => !img.url);
    const homestayImageMetadata = [
      ...this.cleanImageMetadata(existingHomestayImages),
      ...this.prepareImageMetadata(newHomestayImages)
    ];

    const processedRooms = homestayData.rooms.map((room: any) => {
      const existingRoomImages = room.images.filter((img: any) => img.url);
      const newRoomImages = room.images.filter((img: any) => !img.url);
      const roomImageMetadata = [
        ...this.cleanImageMetadata(existingRoomImages),
        ...this.prepareImageMetadata(newRoomImages)
      ];

      return {
        name: room.name,
        description: room.description || '',
        totalArea: Number(room.totalArea) || 0,
        areaUnit: room.areaUnit,
        maxOccupancy: {
          adults: Number(room.maxOccupancy.adults) || 0,
          children: Number(room.maxOccupancy.children) || 0
        },
        minOccupancy: {
          adults: Number(room.minOccupancy.adults) || 0,
          children: Number(room.minOccupancy.children) || 0
        },
        price: {
          value: Number(room.price.value) || 0,
          currency: room.price.currency
        },
        includeBreakfast: Boolean(room.includeBreakfast),
        beds: room.beds.map((bed: any) => ({
          bedTypeId: Number(bed.bedTypeId),
          quantity: Number(bed.quantity) || 1
        })),
        images: roomImageMetadata
      };
    });

    formData.append('imageMetadata', JSON.stringify(homestayImageMetadata));
    formData.append('facilityIds', JSON.stringify(homestayData.facilityIds || []));
    formData.append('customFacilities', JSON.stringify(homestayData.customFacilities || []));
    formData.append('rooms', JSON.stringify(processedRooms));

    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });

    const expectedNewImages = newHomestayImages.length + 
      homestayData.rooms.reduce((count: number, room: any) => 
        count + room.images.filter((img: any) => !img.url).length, 0);

    if (expectedNewImages !== imageFiles.length) {
      throw new Error(`Expected ${expectedNewImages} new image files, but received ${imageFiles.length}`);
    }

    const session = await getSession();
    const accessToken = session?.user?.accessToken;

    return this.request<any>(`/admin/homestays/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      credentials: 'include',
    });
  }

  async deleteHomestay(id: number) {
    try {
      const response = await this.request<any>(`/admin/homestays/${id}`, { method: 'DELETE' });
      return response || { success: true, message: 'Homestay deleted successfully' };
    } catch (error: any) {
      throw new Error(
        error.message.includes('Invalid server response')
          ? 'Failed to delete homestay: Invalid server response'
          : error.message || 'Failed to delete homestay'
      );
    }
  }

  async approveHomestay(id: number, data: { status: string; rejectionReason?: string }) {
    try {
      const response = await this.request<any>(`/admin/homestays/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response || { success: true, message: `Homestay ${data.status.toLowerCase()} successfully` };
    } catch (error: any) {
      console.error('[approveHomestay] Error:', {
        id,
        data,
        error: error.message,
        status: error.status,
      });
      throw new Error(
        error.message.includes('Invalid server response')
          ? `Failed to ${data.status.toLowerCase()} homestay: Invalid server response`
          : error.message || `Failed to ${data.status.toLowerCase()} homestay`
      );
    }
  }

  // ============================================================================
  // MASTER DATA OPERATIONS (existing code)
  // ============================================================================

  async getFacilities() {
    return this.request<any[]>('/admin/facilities');
  }

  async getBedTypes() {
    return this.request<any[]>('/admin/bed-types');
  }

  async getCurrencies() {
    return this.request<any[]>('/admin/currencies');
  }

  async getAreaUnits() {
    return this.request<any[]>('/admin/area-units');
  }

  async createFacility(data: any) {
    return this.request('/admin/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFacility(id: number, data: any) {
    return this.request(`/admin/facilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFacility(id: number) {
    return this.request(`/admin/facilities/${id}`, { method: 'DELETE' });
  }

  async createBedType(data: any) {
    return this.request('/admin/bed-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBedType(id: number, data: any) {
    return this.request(`/admin/bed-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBedType(id: number) {
    return this.request(`/admin/bed-types/${id}`, { method: 'DELETE' });
  }

  async createCurrency(data: any) {
    return this.request('/admin/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCurrency(id: number, data: any) {
    return this.request(`/admin/currencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCurrency(id: number) {
    return this.request(`/admin/currencies/${id}`, { method: 'DELETE' });
  }

  async createAreaUnit(data: any) {
    return this.request('/admin/area-units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAreaUnit(id: number, data: any) {
    return this.request(`/admin/area-units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAreaUnit(id: number) {
    return this.request(`/admin/area-units/${id}`, { method: 'DELETE' });
  }
}

export const adminApi = new AdminApiClient();