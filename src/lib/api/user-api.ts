// src/lib/api/user-api.ts

import { getSession } from 'next-auth/react';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  mobileNumber: string | null;
  role: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  dateOfBirth: string | null;
  address: string | null;
  emergencyContact: string | null;
  alternativePhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  alternativePhone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * API Client for User Profile Management
 */
class UserApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      typeof window !== 'undefined'
        ? '/api/backend/users'
        : 'http://13.61.8.56:3001/users';
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
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return response.json();
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserProfileDto): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/me`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to change password' }));
      throw new Error(error.message || 'Failed to change password');
    }

    return response.json();
  }
}

// Export singleton instance
export const userApi = new UserApiClient();
