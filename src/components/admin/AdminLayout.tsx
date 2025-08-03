import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Home,
  Settings,
  Users,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
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
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
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
                          className={`text-sm font-medium ${
                            index === breadcrumbs.length - 1
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