// src/lib/api/guest-dashboard-api.ts

import { getSession } from 'next-auth/react';
import type {
  GuestDashboard,
  GetBookingsQuery,
  PaginatedBookings,
  BookingDetails,
  CancelBookingResponse,
  BookingReceipt,
  CreateReviewDto,
  CreateReviewResponse,
  Review,
  Favorite,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  CreateRefundDto,
  RefundResponse,
  PaginatedRefunds,
} from '@/types/guest-dashboard';

/**
 * API Client for Guest Dashboard
 * Handles all guest dashboard-related API calls
 */
class GuestDashboardApiClient {
  private baseUrl: string;

  constructor() {
    // Use proxy in client-side, direct URL in server-side
    this.baseUrl =
      typeof window !== 'undefined'
        ? '/api/backend/guest-dashboard'
        : 'http://13.61.8.56:3001/guest-dashboard';
  }

  /**
   * Get authorization headers with JWT token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No authentication token found. Please sign in.');
    }

    return {
      Authorization: `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return filteredParams ? `?${filteredParams}` : '';
  }

  // ============ DASHBOARD ENDPOINTS ============

  /**
   * Get guest dashboard overview
   */
  async getDashboard(): Promise<GuestDashboard> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data' }));
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }

    return response.json();
  }

  // ============ BOOKING ENDPOINTS ============

  /**
   * Get paginated list of bookings with filters
   */
  async getBookings(query?: GetBookingsQuery): Promise<PaginatedBookings> {
    const headers = await this.getAuthHeaders();
    const queryString = query ? this.buildQueryString(query) : '';

    const response = await fetch(`${this.baseUrl}/bookings${queryString}`, {
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
   * Get detailed information for a specific booking
   */
  async getBookingDetails(bookingId: number): Promise<BookingDetails> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
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
   * Cancel a booking
   */
  async cancelBooking(bookingId: number): Promise<CancelBookingResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to cancel booking' }));
      throw new Error(error.message || 'Failed to cancel booking');
    }

    return response.json();
  }

  /**
   * Get booking receipt
   */
  async getBookingReceipt(bookingId: number): Promise<BookingReceipt> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/receipt`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch receipt' }));
      throw new Error(error.message || 'Failed to fetch receipt');
    }

    return response.json();
  }

  // ============ REVIEW ENDPOINTS ============

  /**
   * Create a review for a booking
   */
  async createReview(bookingId: number, dto: CreateReviewDto): Promise<CreateReviewResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/review`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit review' }));
      throw new Error(error.message || 'Failed to submit review');
    }

    return response.json();
  }

  /**
   * Get all reviews written by the guest
   */
  async getReviews(): Promise<Review[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/reviews`, {
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

  // ============ FAVORITES ENDPOINTS ============

  /**
   * Add homestay to favorites
   */
  async addFavorite(homestayId: number): Promise<AddFavoriteResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/favorites/${homestayId}`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add to favorites' }));
      throw new Error(error.message || 'Failed to add to favorites');
    }

    return response.json();
  }

  /**
   * Get all favorites
   */
  async getFavorites(): Promise<Favorite[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/favorites`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch favorites' }));
      throw new Error(error.message || 'Failed to fetch favorites');
    }

    return response.json();
  }

  /**
   * Remove homestay from favorites
   */
  async removeFavorite(homestayId: number): Promise<RemoveFavoriteResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/favorites/${homestayId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove from favorites' }));
      throw new Error(error.message || 'Failed to remove from favorites');
    }

    return response.json();
  }

  // ============ REFUND ENDPOINTS ============

  /**
   * Create a refund request for a cancelled booking
   */
  async createRefund(bookingId: number, dto: CreateRefundDto): Promise<RefundResponse> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/refund`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create refund request' }));
      throw new Error(error.message || 'Failed to create refund request');
    }

    return response.json();
  }

  /**
   * Get all refunds for the guest
   */
  async getRefunds(page: number = 1, limit: number = 10): Promise<PaginatedRefunds> {
    const headers = await this.getAuthHeaders();
    const queryString = this.buildQueryString({ page, limit });

    const response = await fetch(`${this.baseUrl}/refunds${queryString}`, {
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
}

// Export singleton instance
export const guestDashboardApi = new GuestDashboardApiClient();
