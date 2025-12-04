// src/lib/api/host-dashboard-api.ts

import { getSession } from 'next-auth/react';
import type {
  HostDashboard,
  GetBookingsQuery,
  PaginatedHostBookings,
  HostBookingDetails,
  CancelBookingDto,
  CancelBookingResponse,
  UpdateBookingStatusDto,
  UpdateBookingStatusResponse,
  ConfirmBookingResponse,
  GetHostReviewsQuery,
  PaginatedHostReviews,
  HostReview,
  CreateReviewResponse,
  ReviewResponse,
  PaginatedRefunds,
  HostHomestayListItem,
  HostHomestayDetails,
  UpdateHomestayDto,
  RoomDetails,
  CreateRoomDto,
  UpdateRoomDto,
  Facility,
  BedType,
  Currency,
  AreaUnit,
} from '@/types/host-dashboard';

// Use proxy path for client-side requests, direct URL for server-side
const API_BASE_URL = typeof window !== 'undefined'
  ? '/api/backend'
  : 'http://13.61.8.56:3001';

class HostDashboardApiClient {
  private async getAuthHeaders() {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token found. Please login again.');
    }

    return {
      'Authorization': `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ============ HOST DASHBOARD ENDPOINTS ============

  /**
   * Get host dashboard overview with stats and recent bookings
   */
  async getDashboard(): Promise<HostDashboard> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard' }));
      throw new Error(error.message || 'Failed to fetch dashboard');
    }

    return response.json();
  }

  /**
   * Get paginated host bookings with optional filters
   */
  async getBookings(query?: GetBookingsQuery): Promise<PaginatedHostBookings> {
    const headers = await this.getAuthHeaders();
    const queryString = query ? this.buildQueryString(query) : '';

    const response = await fetch(`${API_BASE_URL}/host-dashboard/bookings${queryString}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch bookings' }));
      throw new Error(error.message || 'Failed to fetch bookings');
    }

    return response.json();
  }

  /**
   * Get detailed booking information
   */
  async getBookingDetails(bookingId: number): Promise<HostBookingDetails> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/bookings/${bookingId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch booking details' }));
      throw new Error(error.message || 'Failed to fetch booking details');
    }

    return response.json();
  }

  /**
   * Cancel a booking (host-initiated)
   */
  async cancelBooking(bookingId: number, dto: CancelBookingDto): Promise<CancelBookingResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to cancel booking' }));
      throw new Error(error.message || 'Failed to cancel booking');
    }

    return response.json();
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: number, dto: UpdateBookingStatusDto): Promise<UpdateBookingStatusResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update booking status' }));
      throw new Error(error.message || 'Failed to update booking status');
    }

    return response.json();
  }

  /**
   * Confirm a pending booking
   */
  async confirmBooking(bookingId: number): Promise<ConfirmBookingResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to confirm booking' }));
      throw new Error(error.message || 'Failed to confirm booking');
    }

    return response.json();
  }

  // ============ HOST REVIEW ENDPOINTS ============

  /**
   * Get all reviews for host's properties with filtering
   */
  async getReviews(query?: GetHostReviewsQuery): Promise<PaginatedHostReviews> {
    const headers = await this.getAuthHeaders();
    const queryString = query ? this.buildQueryString(query) : '';

    const response = await fetch(`${API_BASE_URL}/host-dashboard/reviews${queryString}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch reviews' }));
      throw new Error(error.message || 'Failed to fetch reviews');
    }

    return response.json();
  }

  /**
   * Get reviews for a specific homestay
   */
  async getHomestayReviews(homestayId: number): Promise<HostReview[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays/${homestayId}/reviews`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch homestay reviews' }));
      throw new Error(error.message || 'Failed to fetch homestay reviews');
    }

    return response.json();
  }

  /**
   * Respond to a guest review
   */
  async respondToReview(reviewId: number, response: string): Promise<ReviewResponse> {
    const headers = await this.getAuthHeaders();

    const result = await fetch(`${API_BASE_URL}/host-dashboard/reviews/${reviewId}/response`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ response }),
    });

    if (!result.ok) {
      const error = await result.json().catch(() => ({ message: 'Failed to respond to review' }));
      throw new Error(error.message || 'Failed to respond to review');
    }

    return result.json();
  }

  // ============ HOST REFUND ENDPOINTS ============

  /**
   * Get all refunds for host's bookings
   */
  async getRefunds(page: number = 1, limit: number = 10): Promise<PaginatedRefunds> {
    const headers = await this.getAuthHeaders();
    const queryString = this.buildQueryString({ page, limit });

    const response = await fetch(`${API_BASE_URL}/host-dashboard/refunds${queryString}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch refunds' }));
      throw new Error(error.message || 'Failed to fetch refunds');
    }

    return response.json();
  }

  // ============ HOST HOMESTAY MANAGEMENT ENDPOINTS ============

  /**
   * Get all homestays owned by the host
   */
  async getHomestays(): Promise<HostHomestayListItem[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch homestays' }));
      throw new Error(error.message || 'Failed to fetch homestays');
    }

    return response.json();
  }

  /**
   * Get detailed information about a specific homestay
   */
  async getHomestayDetails(homestayId: number): Promise<HostHomestayDetails> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays/${homestayId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch homestay details' }));
      throw new Error(error.message || 'Failed to fetch homestay details');
    }

    return response.json();
  }

  /**
   * Update homestay details
   */
  async updateHomestay(homestayId: number, dto: UpdateHomestayDto, files?: File[]): Promise<HostHomestayDetails> {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token found. Please login again.');
    }

    const formData = new FormData();

    // Add basic fields
    if (dto.name) formData.append('name', dto.name);
    if (dto.address) formData.append('address', dto.address);
    if (dto.contactNumber) formData.append('contactNumber', dto.contactNumber);
    if (dto.description) formData.append('description', dto.description);

    // Add facility IDs as JSON
    if (dto.facilityIds) {
      formData.append('facilityIds', JSON.stringify(dto.facilityIds));
    }

    // Add image metadata as JSON
    if (dto.images) {
      formData.append('images', JSON.stringify(dto.images));
    }

    // Add image files
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays/${homestayId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update homestay' }));
      throw new Error(error.message || 'Failed to update homestay');
    }

    return response.json();
  }

  // ============ HOST ROOM MANAGEMENT ENDPOINTS ============

  /**
   * Get all rooms for a homestay
   */
  async getHomestayRooms(homestayId: number): Promise<RoomDetails[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays/${homestayId}/rooms`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch rooms' }));
      throw new Error(error.message || 'Failed to fetch rooms');
    }

    return response.json();
  }

  /**
   * Get room details
   */
  async getRoomDetails(roomId: number): Promise<RoomDetails> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/rooms/${roomId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch room details' }));
      throw new Error(error.message || 'Failed to fetch room details');
    }

    return response.json();
  }

  /**
   * Create a new room for a homestay
   */
  async createRoom(homestayId: number, dto: CreateRoomDto, files: File[]): Promise<RoomDetails> {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token found. Please login again.');
    }

    const formData = new FormData();

    // Add all fields
    formData.append('name', dto.name);
    if (dto.description) formData.append('description', dto.description);
    if (dto.size !== undefined) formData.append('size', String(dto.size));
    formData.append('areaUnitId', String(dto.areaUnitId));
    formData.append('capacity', String(dto.capacity));
    formData.append('pricePerNight', String(dto.pricePerNight));
    formData.append('bedTypeId', String(dto.bedTypeId));
    formData.append('currencyId', String(dto.currencyId));
    formData.append('isAvailable', String(dto.isAvailable));

    // Add image files
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/host-dashboard/homestays/${homestayId}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create room' }));
      throw new Error(error.message || 'Failed to create room');
    }

    return response.json();
  }

  /**
   * Update room details
   */
  async updateRoom(roomId: number, dto: UpdateRoomDto, files?: File[]): Promise<RoomDetails> {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token found. Please login again.');
    }

    const formData = new FormData();

    // Add fields that are provided
    if (dto.name) formData.append('name', dto.name);
    if (dto.description) formData.append('description', dto.description);
    if (dto.size !== undefined) formData.append('size', String(dto.size));
    if (dto.areaUnitId !== undefined) formData.append('areaUnitId', String(dto.areaUnitId));
    if (dto.capacity !== undefined) formData.append('capacity', String(dto.capacity));
    if (dto.pricePerNight !== undefined) formData.append('pricePerNight', String(dto.pricePerNight));
    if (dto.bedTypeId !== undefined) formData.append('bedTypeId', String(dto.bedTypeId));
    if (dto.currencyId !== undefined) formData.append('currencyId', String(dto.currencyId));
    if (dto.isAvailable !== undefined) formData.append('isAvailable', String(dto.isAvailable));

    // Add image files
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/host-dashboard/rooms/${roomId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update room' }));
      throw new Error(error.message || 'Failed to update room');
    }

    return response.json();
  }

  /**
   * Delete a room
   */
  async deleteRoom(roomId: number): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/rooms/${roomId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete room' }));
      throw new Error(error.message || 'Failed to delete room');
    }
  }

  // ============ MASTER DATA ENDPOINTS ============

  /**
   * Get available facilities
   */
  async getFacilities(): Promise<Facility[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/master-data/facilities`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch facilities' }));
      throw new Error(error.message || 'Failed to fetch facilities');
    }

    return response.json();
  }

  /**
   * Get available bed types
   */
  async getBedTypes(): Promise<BedType[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/master-data/bed-types`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch bed types' }));
      throw new Error(error.message || 'Failed to fetch bed types');
    }

    return response.json();
  }

  /**
   * Get available currencies
   */
  async getCurrencies(): Promise<Currency[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/master-data/currencies`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch currencies' }));
      throw new Error(error.message || 'Failed to fetch currencies');
    }

    return response.json();
  }

  /**
   * Get available area units
   */
  async getAreaUnits(): Promise<AreaUnit[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/host-dashboard/master-data/area-units`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch area units' }));
      throw new Error(error.message || 'Failed to fetch area units');
    }

    return response.json();
  }
}

// Export singleton instance
export const hostDashboardApi = new HostDashboardApiClient();
