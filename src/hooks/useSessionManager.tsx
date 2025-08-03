import { useSession, signOut } from 'next-auth/react';
import { useEffect, useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

// Type definitions for better TypeScript support
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

  // Type the session properly
  const typedSession = session as ExtendedSession | null;

  // Check if session has refresh error
  const hasRefreshError = typedSession?.error === 'RefreshAccessTokenError';

  // Auto-refresh session periodically
  useEffect(() => {
    if (status === 'authenticated' && typedSession?.user?.tokenExpiry) {
      const timeUntilExpiry = typedSession.user.tokenExpiry - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // Refresh 5 mins before expiry, minimum 1 minute

      if (refreshTime > 0) {
        const refreshTimer = setTimeout(() => {
          console.log('[SessionManager] Auto-refreshing session...');
          update(); // This will trigger the JWT callback
        }, refreshTime);

        return () => clearTimeout(refreshTimer);
      }
    }
  }, [typedSession, status, update]);

  // Handle refresh errors
  useEffect(() => {
    if (hasRefreshError) {
      console.error('[SessionManager] Session refresh failed, signing out...');
      signOut({ 
        redirect: true,
        callbackUrl: '/signin?error=SessionExpired'
      });
    }
  }, [hasRefreshError]);

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('[SessionManager] Manually refreshing session...');
      await update();
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

  // Check if token is about to expire
  const isTokenNearExpiry = useCallback(() => {
    if (!typedSession?.user?.tokenExpiry) return false;
    const timeUntilExpiry = typedSession.user.tokenExpiry - Date.now();
    return timeUntilExpiry < (10 * 60 * 1000); // Less than 10 minutes
  }, [typedSession]);

  // Force sign out (without router dependency)
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

  // Check if we have a valid session for API calls
  const isAuthenticated = status === 'authenticated' && !hasRefreshError && session?.user?.accessToken;

  // Get authorization headers
  const getAuthHeaders = useCallback(() => {
    if (!isAuthenticated || !session?.user?.accessToken) {
      throw new Error('No valid access token available');
    }
    
    return {
      'Authorization': `Bearer ${session.user.accessToken}`,
    };
  }, [isAuthenticated, session]);

  // Handle API errors (401, etc.)
  const handleApiError = useCallback(async (error: any, retry?: () => Promise<any>) => {
    if (error.status === 401 || error.message?.includes('401')) {
      console.log('[AuthAPI] 401 error detected, attempting refresh...');
      
      try {
        await refreshSession();
        
        // If retry function provided, try the API call again
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

// Router-aware session hook (use this in components where router is available)
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

// HOC to protect pages that require authentication
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

    // Handle client-side mounting
    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      if (!isMounted || status === 'loading') return; // Wait for mounting and session loading

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

    // Show loading until mounted and session is loaded
    if (!isMounted || status === 'loading') {
      return <div>Loading...</div>;
    }

    if (status === 'unauthenticated' || hasRefreshError) {
      return null; // Will redirect
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

// Component wrapper for protecting specific UI elements
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

// Hook for checking authentication status without automatic redirects
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

// Hook for admin-specific functionality
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

// Hook for admin with router capabilities (use in components where router is available)
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