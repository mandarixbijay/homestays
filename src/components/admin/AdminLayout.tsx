import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Home,
  Settings,
  Users,
  Menu,
  X,
  ChevronRight,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAdminAuth, useSessionManager } from '@/hooks/useSessionManager';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// Loading component for admin areas
const AdminLoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Admin Panel</h3>
        <p className="text-gray-600 dark:text-gray-400">Verifying your permissions...</p>
      </div>
    </div>
  </div>
);

// Unauthorized access component
const UnauthorizedScreen = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <X className="mx-auto h-16 w-16" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don&rsquo;t have permission to access the admin panel.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => router.push('/signin')}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Sign In with Different Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin session status indicator
const AdminSessionIndicator = () => {
  const { isTokenNearExpiry, refreshSession, isRefreshing } = useSessionManager();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isTokenNearExpiry) {
      setShowWarning(true);
      // Auto-hide warning after 10 seconds
      const timer = setTimeout(() => setShowWarning(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isTokenNearExpiry]);

  if (!showWarning && !isRefreshing) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {isRefreshing && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 mb-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Refreshing session...</span>
        </div>
      )}

      {showWarning && !isRefreshing && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Session expiring soon</span>
            </div>
            <button
              onClick={refreshSession}
              className="text-xs bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Connection status indicator
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Offline</span>
        </>
      )}
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { data: session, status } = useSession();
  const { isAuthenticated, isLoading, isAdmin, user } = useAdminAuth();
  const { hasRefreshError } = useSessionManager();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Allow time for session to load
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only proceed if component is mounted and router is available
    if (!isMounted || !router) return;

    // Redirect to signin if not authenticated after loading
    if (!isLoading && !isAuthenticated && !isInitializing) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/signin?returnUrl=${returnUrl}&error=AdminRequired`);
    }
  }, [isAuthenticated, isLoading, isInitializing, router, pathname, isMounted]);

  // Show loading screen while session is being established or not mounted
  if (!isMounted || isLoading || isInitializing || status === 'loading') {
    return <AdminLoadingScreen />;
  }

  // Show unauthorized screen if user is authenticated but not admin
  if (isAuthenticated && !isAdmin) {
    return <UnauthorizedScreen />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || hasRefreshError) {
    return <AdminLoadingScreen />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin'
    },
    {
      name: 'Homestays',
      href: '/admin/homestays',
      icon: Home,
      current: pathname.startsWith('/admin/homestays')
    },
    {
      name: 'Master Data',
      href: '/admin/master-data',
      icon: Settings,
      current: pathname === '/admin/master-data'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users'
    }
  ];

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    ...(pathname !== '/admin' ? [
      { name: title || 'Page', href: pathname }
    ] : [])
  ];

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/signin?message=AdminSignedOut'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Session Management Indicators */}
      <AdminSessionIndicator />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${item.current
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User info and Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {user?.name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${item.current
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                >
                  <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User info with enhanced features */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <ConnectionStatus />
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {user?.name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrator
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Enhanced Top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title || 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus />
            </div>
          </div>
        </div>

        {/* Breadcrumbs - Desktop only */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <li key={breadcrumb.href}>
                      <div className="flex items-center">
                        {index > 0 && (
                          <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 mr-4" />
                        )}
                        <Link
                          href={breadcrumb.href}
                          className={`text-sm font-medium ${index === breadcrumbs.length - 1
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                          {breadcrumb.name}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;