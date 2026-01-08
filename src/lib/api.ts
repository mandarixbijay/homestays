// lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56';

// Define custom request config type
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ✅ Single API instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ CRITICAL: Send cookies
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Request interceptor - Add token to headers
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        const token = session?.user?.accessToken;
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('[API] Failed to get session:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - Handle 401 and refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Only handle 401 errors
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Don't retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Don't retry if already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('[API] Token expired, attempting refresh...');

      // Get refresh token from session
      let refreshToken: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const session = await getSession();
          refreshToken = session?.user?.refreshToken || null;
        } catch (sessionError) {
          console.error('[API] Failed to get session for refresh:', sessionError);
        }
      }

      // ✅ Call backend refresh endpoint with token in body for better reliability
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        refreshToken ? { token: refreshToken } : {},
        {
          withCredentials: true, // Send cookies
          timeout: 10000
        }
      );

      if (response.data?.status === 'success' && response.data?.data?.accessToken) {
        const newAccessToken = response.data.data.accessToken;
        
        console.log('[API] Token refreshed successfully');
        
        // ✅ Update NextAuth session by triggering a session refetch
        if (typeof window !== 'undefined') {
          try {
            const sessionModule = await import('next-auth/react');
            await sessionModule.getSession(); // Force session refresh
          } catch (sessionError) {
            console.error('[API] Failed to refresh session:', sessionError);
          }
        }

        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      }

      throw new Error('Invalid refresh response');
    } catch (refreshError) {
      console.error('[API] Token refresh failed:', refreshError);
      processQueue(refreshError as AxiosError, null);
      
      // ✅ Force sign out on refresh failure
      if (typeof window !== 'undefined') {
        try {
          const { signOut } = await import('next-auth/react');
          await signOut({ 
            redirect: true,
            callbackUrl: '/signin?error=SessionExpired'
          });
        } catch (signOutError) {
          console.error('[API] Failed to sign out:', signOutError);
        }
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

// ✅ Helper for server-side API calls
export const createApiWithToken = (token?: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
  });
};

// Export the api instance
export { api };