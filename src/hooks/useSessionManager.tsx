// hooks/useSessionManager.ts
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

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

  const typedSession = session as ExtendedSession | null;
  const hasRefreshError = typedSession?.error === 'RefreshAccessTokenError';

  // ✅ Auto-refresh is now handled by NextAuth JWT callback
  // This effect just monitors for near-expiry and triggers update()
  useEffect(() => {
    if (status === 'authenticated' && typedSession?.user?.tokenExpiry) {
      const timeUntilExpiry = typedSession.user.tokenExpiry - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000);

      if (refreshTime > 0 && refreshTime < (50 * 60 * 1000)) {
        const refreshTimer = setTimeout(() => {
          console.log('[SessionManager] Triggering session refresh...');
          update(); // This triggers JWT callback which will refresh if needed
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
      await update(); // JWT callback will handle the actual refresh
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