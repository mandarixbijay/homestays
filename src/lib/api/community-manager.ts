import { getSession, signOut } from 'next-auth/react';

// Use proxy path for client-side requests, direct URL for server-side
const API_BASE_URL = typeof window !== 'undefined'
  ? '/api/backend' // Use proxy path for client-side requests
  : 'http://13.61.8.56:3001'; // Direct URL for server-side requests

export interface CommunityManagerProfile {
  id: number;
  fullName: string;
  image?: string | null;
  phone?: string | null;
  email?: string | null;
  alternatePhone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  communities: {
    id: number;
    name: string;
    isActive: boolean;
  }[];
}

export interface ManagedCommunity {
  id: number;
  name: string;
  description: string | null;
  images: string[];
  pricePerPerson: number;
  currency: string;
  isActive: boolean;
  totalRooms: number;
  totalCapacity: number;
  homestays: {
    id: number;
    name: string;
    address: string;
  }[];
  meals: any[];
  activities: any[];
  nearbyAttractions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityBooking {
  id: number;
  groupBookingId: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  isCommunityBooking: boolean;
  communityId: number;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  community: {
    id: number;
    name: string;
  };
  user: {
    name: string;
    email: string;
    mobileNumber: string;
  } | null;
  roomAssignments: {
    id: number;
    guestsAssigned: number;
    homestay: {
      id: number;
      name: string;
    };
    room: {
      id: number;
      name: string;
    };
  }[];
  payments: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCommunities: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

class CommunityManagerApiClient {
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

  // ============================================================================
  // COMMUNITY MANAGER DASHBOARD API METHODS
  // ============================================================================

  /**
   * Get the logged-in community manager's profile
   */
  async getProfile(): Promise<CommunityManagerProfile> {
    return this.request<CommunityManagerProfile>('/community-manager/dashboard/profile');
  }

  /**
   * Get all communities managed by this manager
   */
  async getMyCommunities(): Promise<ManagedCommunity[]> {
    return this.request<ManagedCommunity[]>('/community-manager/dashboard/communities');
  }

  /**
   * Get all bookings for managed communities
   * @param status Optional status filter
   */
  async getMyBookings(status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): Promise<CommunityBooking[]> {
    const queryParam = status ? `?status=${status}` : '';
    return this.request<CommunityBooking[]>(`/community-manager/dashboard/bookings${queryParam}`);
  }

  /**
   * Get a specific booking by ID
   * @param bookingId Booking ID
   */
  async getBooking(bookingId: number): Promise<CommunityBooking> {
    return this.request<CommunityBooking>(`/community-manager/dashboard/bookings/${bookingId}`);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/community-manager/dashboard/stats');
  }
}

// Export singleton instance
export const communityManagerApi = new CommunityManagerApiClient();
