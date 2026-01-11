// hooks/useSessionManager.ts
import { useSession, signOut, getSession } from 'next-auth/react';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56';

/**
 * Check if the current session is valid by calling /auth/me endpoint
 */
export async function checkSession(): Promise<any | null> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Refresh the tokens using the /auth/refresh endpoint
 */
export async function refreshTokens(): Promise<any | null> {
  try {
    const session = await getSession();
    const refreshToken = session?.user?.refreshToken;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: refreshToken ? JSON.stringify({ token: refreshToken }) : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Ensure the user is authenticated, attempting refresh if needed
 */
export async function ensureAuthenticated(): Promise<any | null> {
  let session = await checkSession();

  if (!session) {
    // Access token expired, try refresh
    const refreshResult = await refreshTokens();
    if (refreshResult?.status === 'success') {
      session = await checkSession();
    }
  }

  return session;
}

interface ExtendedSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    role?: string;
    permissions?: string[];
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    accessToken?: string | null;
    refreshToken?: string | null;
    tokenExpiry?: number;
    image?: string | null;
  };
  error?: string;
}

export function useSessionManager() {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshAttempts = useRef(0);
  const maxRefreshAttempts = 3;

  const typedSession = session as ExtendedSession | null;
  const hasRefreshError = typedSession?.error === 'RefreshAccessTokenError';

  // ✅ Auto-refresh is now handled by NextAuth JWT callback
  // This effect monitors for near-expiry and triggers update()
  useEffect(() => {
    if (status !== 'authenticated' || !typedSession?.user?.tokenExpiry) {
      return;
    }

    const scheduleRefresh = () => {
      const timeUntilExpiry = (typedSession.user?.tokenExpiry || 0) - Date.now();
      // Refresh 10 minutes before expiry, but at least 30 seconds from now
      const refreshTime = Math.max(timeUntilExpiry - (10 * 60 * 1000), 30000);

      console.log('[SessionManager] Token expires in', Math.round(timeUntilExpiry / 1000), 'seconds, scheduling refresh in', Math.round(refreshTime / 1000), 'seconds');

      // If token is already near expiry or expired, refresh immediately
      if (timeUntilExpiry <= 10 * 60 * 1000) {
        console.log('[SessionManager] Token near expiry, refreshing immediately...');
        handleRefresh();
        return undefined;
      }

      // Schedule refresh for later
      const refreshTimer = setTimeout(handleRefresh, refreshTime);
      return () => clearTimeout(refreshTimer);
    };

    const handleRefresh = async () => {
      console.log('[SessionManager] Auto-refresh triggered...');
      try {
        const refreshResult = await refreshTokens();
        if (refreshResult?.status === 'success') {
          console.log('[SessionManager] API refresh successful, updating NextAuth session...');
          await update();
          refreshAttempts.current = 0;
        } else {
          console.warn('[SessionManager] API refresh returned non-success, falling back to NextAuth update');
          await update();
        }
      } catch (error) {
        console.error('[SessionManager] API refresh failed, falling back to NextAuth update:', error);
        await update();
      }
    };

    const cleanup = scheduleRefresh();

    // Also handle page visibility changes - refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeUntilExpiry = (typedSession.user?.tokenExpiry || 0) - Date.now();
        // If token is near expiry when user returns, refresh immediately
        if (timeUntilExpiry <= 15 * 60 * 1000) {
          console.log('[SessionManager] Page visible and token near expiry, refreshing...');
          handleRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [typedSession, status, update]);

  // Handle refresh errors with retry logic
  useEffect(() => {
    if (hasRefreshError) {
      refreshAttempts.current += 1;

      if (refreshAttempts.current < maxRefreshAttempts) {
        console.warn(`[SessionManager] Refresh attempt ${refreshAttempts.current}/${maxRefreshAttempts} failed, retrying...`);
        // Wait with exponential backoff before retrying
        const backoffDelay = Math.pow(2, refreshAttempts.current) * 1000;
        setTimeout(async () => {
          try {
            const refreshResult = await refreshTokens();
            if (refreshResult?.status === 'success') {
              console.log('[SessionManager] Retry refresh successful');
              await update();
              refreshAttempts.current = 0;
            }
          } catch (error) {
            console.error('[SessionManager] Retry refresh failed:', error);
          }
        }, backoffDelay);
      } else {
        console.error('[SessionManager] Max refresh attempts reached, signing out...');
        refreshAttempts.current = 0;
        signOut({
          redirect: true,
          callbackUrl: '/signin?error=SessionExpired'
        });
      }
    }
  }, [hasRefreshError, update]);

  // Manual session refresh with enhanced error handling
  const refreshSession = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log('[SessionManager] Manually refreshing session...');

      // First try direct API refresh
      const refreshResult = await refreshTokens();
      if (refreshResult?.status === 'success') {
        console.log('[SessionManager] API refresh successful');
        await update(); // Update NextAuth session
        refreshAttempts.current = 0;
      } else {
        console.log('[SessionManager] API refresh failed, trying NextAuth update');
        await update(); // Fallback to NextAuth update
      }
    } catch (error) {
      console.error('[SessionManager] Manual refresh failed:', error);
      await signOut({
        redirect: true,
        callbackUrl: '/signin?error=SessionExpired'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [update, isRefreshing]);

  const isTokenNearExpiry = useCallback(() => {
    if (!typedSession?.user?.tokenExpiry) return false;
    const timeUntilExpiry = typedSession.user.tokenExpiry - Date.now();
    return timeUntilExpiry < (10 * 60 * 1000);
  }, [typedSession]);

  const forceSignOut = useCallback(async (reason?: string) => {
    console.log('[SessionManager] Force sign out:', reason);
    await signOut({ 
      redirect: true,
      callbackUrl: `/signin${reason ? `?error=${reason}` : ''}`
    });
  }, []);

  return {
    session: typedSession,
    status,
    isRefreshing,
    hasRefreshError,
    isTokenNearExpiry: isTokenNearExpiry(),
    refreshSession,
    forceSignOut,
  };
}

// Enhanced hook specifically for API operations
export function useAuthenticatedApi() {
  const { session, status, hasRefreshError, refreshSession, forceSignOut } = useSessionManager();

  const isAuthenticated = status === 'authenticated' && !hasRefreshError && session?.user?.accessToken;

  const getAuthHeaders = useCallback(() => {
    if (!isAuthenticated || !session?.user?.accessToken) {
      throw new Error('No valid access token available');
    }
    
    return {
      'Authorization': `Bearer ${session.user.accessToken}`,
    };
  }, [isAuthenticated, session]);

  const handleApiError = useCallback(async (error: any, retry?: () => Promise<any>) => {
    if (error.response?.status === 401) {
      console.log('[AuthAPI] 401 error detected, attempting refresh...');
      
      try {
        await refreshSession();
        
        if (retry) {
          return await retry();
        }
      } catch (refreshError) {
        console.error('[AuthAPI] Refresh failed:', refreshError);
        await forceSignOut('SessionExpired');
        throw new Error('Session expired. Please log in again.');
      }
    }
    
    throw error;
  }, [refreshSession, forceSignOut]);

  return {
    isAuthenticated,
    session,
    status,
    getAuthHeaders,
    handleApiError,
    refreshSession,
  };
}

// Router-aware session hook
export function useSessionManagerWithRouter() {
  const sessionManager = useSessionManager();
  const router = useRouter();

  const redirectToSignIn = useCallback((reason?: string) => {
    const currentPath = window.location.pathname;
    const returnUrl = encodeURIComponent(currentPath);
    router.push(`/signin?returnUrl=${returnUrl}${reason ? `&error=${reason}` : ''}`);
  }, [router]);

  const redirectTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return {
    ...sessionManager,
    redirectToSignIn,
    redirectTo,
  };
}

// HOC to protect pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    requireRole?: string;
  }
) {
  const AuthenticatedComponent: React.FC<P> = (props: P) => {
    const { session, status, hasRefreshError } = useSessionManager();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      if (!isMounted || status === 'loading') return;

      if (status === 'unauthenticated' || hasRefreshError) {
        const currentPath = window.location.pathname;
        const returnUrl = encodeURIComponent(currentPath);
        router.push(`${options?.redirectTo || '/signin'}?returnUrl=${returnUrl}`);
        return;
      }

      if (options?.requireRole && session?.user?.role !== options.requireRole) {
        router.push('/unauthorized');
        return;
      }
    }, [session, status, hasRefreshError, router, isMounted]);

    if (!isMounted || status === 'loading') {
      return <div>Loading...</div>;
    }

    if (status === 'unauthenticated' || hasRefreshError) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

// Component wrapper
interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRole?: string;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({ 
  children, 
  fallback, 
  requireRole 
}) => {
  const { session, status, hasRefreshError } = useSessionManager();

  if (status === 'loading') {
    return <>{fallback || <div>Loading...</div>}</>;
  }

  if (status === 'unauthenticated' || hasRefreshError) {
    return <>{fallback || <div>Please log in to view this content.</div>}</>;
  }

  if (requireRole && session?.user?.role !== requireRole) {
    return <>{fallback || <div>You don&apos;t have permission to view this content.</div>}</>;
  }

  return <>{children}</>;
};

// Hook for checking auth status
export function useAuthStatus() {
  const { data: session, status } = useSession();
  const typedSession = session as ExtendedSession | null;
  
  return {
    isAuthenticated: status === 'authenticated' && !!typedSession?.user?.accessToken,
    isLoading: status === 'loading',
    user: typedSession?.user,
    hasRole: (role: string) => typedSession?.user?.role === role,
    hasPermission: (permission: string) => 
      typedSession?.user?.permissions?.includes(permission) || false,
  };
}

// Hook for admin functionality
export function useAdminAuth() {
  const authStatus = useAuthStatus();
  const { forceSignOut } = useSessionManager();
  
  const isAdmin = authStatus.hasRole('ADMIN') || authStatus.hasRole('SUPER_ADMIN');
  
  return {
    ...authStatus,
    isAdmin,
    requireAdmin: () => {
      if (!authStatus.isAuthenticated) {
        throw new Error('Authentication required');
      }
      if (!isAdmin) {
        throw new Error('Admin access required');
      }
    },
    signOutAdmin: () => forceSignOut('AdminSignOut'),
  };
}

// Hook for admin with router
export function useAdminAuthWithRouter() {
  const adminAuth = useAdminAuth();
  const router = useRouter();

  const redirectToAdmin = useCallback(() => {
    router.push('/admin');
  }, [router]);

  const redirectToSignIn = useCallback((reason?: string) => {
    const currentPath = window.location.pathname;
    const returnUrl = encodeURIComponent(currentPath);
    router.push(`/signin?returnUrl=${returnUrl}${reason ? `&error=${reason}` : ''}`);
  }, [router]);

  return {
    ...adminAuth,
    redirectToAdmin,
    redirectToSignIn,
  };
}