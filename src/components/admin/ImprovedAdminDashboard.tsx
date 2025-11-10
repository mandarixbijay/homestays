// components/admin/ImprovedAdminDashboard.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, Component, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Home, Users, Settings, Clock, CheckCircle,
  AlertCircle, Plus, Eye, Edit, Activity, Star, MapPin,
  RefreshCw, Download, Bed
} from 'lucide-react';
import { debounce } from 'lodash';
import { useHomestays } from '@/hooks/useAdminApi';
import { Homestay } from '@/types/admin';
import {
  LoadingSpinner,
  Alert,
  ActionButton,
  Card,
  StatusBadge,
  SearchInput,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  totalHomestays: number;
  pendingHomestays: number;
  approvedHomestays: number;
  rejectedHomestays: number;
  totalRooms: number;
  averageRating: number;
  recentActivity: any[];
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary extends Component<{ children: ReactNode }> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    return this.props.children;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

const calculateHomestayStats = (homestays: Homestay[]) => {
  console.log('[Dashboard] Calculating stats from homestays:', {
    total: homestays.length,
    sample: homestays.slice(0, 2).map(h => ({
      id: h.id,
      name: h.name,
      status: h.status,
      rooms: h.rooms?.length,
      rating: h.rating
    })),
    allStatuses: homestays.map(h => ({
      id: h.id,
      status: h.status,
      rooms: h.rooms?.length,
      rating: h.rating
    }))
  });

  const stats = {
    totalHomestays: homestays.length,
    pendingHomestays: homestays.filter(h => h.status?.toUpperCase() === 'PENDING').length,
    approvedHomestays: homestays.filter(h => h.status?.toUpperCase() === 'APPROVED').length,
    rejectedHomestays: homestays.filter(h => h.status?.toUpperCase() === 'REJECTED').length,
    totalRooms: homestays.reduce((total, h) => total + (Array.isArray(h.rooms) ? h.rooms.length : 0), 0),
    averageRating: 0
  };

  const homestaysWithRatings = homestays.filter(h => typeof h.rating === 'number' && h.rating > 0);
  if (homestaysWithRatings.length > 0) {
    const totalRating = homestaysWithRatings.reduce((sum, h) => sum + Number(h.rating), 0);
    stats.averageRating = Number((totalRating / homestaysWithRatings.length).toFixed(1));
  }

  console.log('[Dashboard] Calculated stats:', stats);
  return stats;
};

const generateRecentActivity = (homestays: Homestay[]) => {
  const activities: any[] = [];
  
  const sortedHomestays = [...homestays]
    .filter(h => h.createdAt || h.updatedAt)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

  sortedHomestays.slice(0, 5).forEach(homestay => {
    let description = `New homestay "${homestay.name || 'Unknown'}" was created`;
    if (homestay.status?.toUpperCase() === 'APPROVED') {
      description = `Homestay "${homestay.name || 'Unknown'}" was approved`;
    } else if (homestay.status?.toUpperCase() === 'REJECTED') {
      description = `Homestay "${homestay.name || 'Unknown'}" was rejected`;
    } else if (homestay.status?.toUpperCase() === 'PENDING') {
      description = `New homestay "${homestay.name || 'Unknown'}" submitted for approval`;
    }
    
    activities.push({
      description,
      timestamp: homestay.updatedAt || homestay.createdAt,
      type: 'create',
      homestayId: homestay.id
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
};

// ============================================================================
// COMPONENTS
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
  loading?: boolean;
}> = ({ title, value, icon, color

, onClick, loading }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1' : ''}`}
    >
      <div
        className="flex items-center justify-between"
        {...(onClick ? { onClick } : {})}
        style={onClick ? { cursor: 'pointer' } : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        onKeyPress={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="mt-1">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}> = ({ title, description, icon, color, onClick }) => {
  return (
    <div
      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <Card>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const RecentHomestayCard: React.FC<{
  homestay: Homestay;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}> = ({ homestay, onView, onEdit }) => {
  const mainImage = homestay.images?.find((img: any) => img.isMain) || homestay.images?.[0];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={homestay.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <Home className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {homestay.name || 'Unknown'}
              </h4>
              
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{homestay.address || 'No address'}</span>
              </div>
              
              <div className="mt-1 flex items-center space-x-4">
                <StatusBadge status={homestay.status || 'PENDING'} variant="small" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {homestay.rooms?.length || 0} rooms
                </span>
                {homestay.rating && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {homestay.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-4">
              <ActionButton
                onClick={() => onView(homestay.id)}
                variant="secondary"
                size="xs"
                icon={<Eye className="h-3 w-3" />}
              />
              
              <ActionButton
                onClick={() => onEdit(homestay.id)}
                variant="secondary"
                size="xs"
                icon={<Edit className="h-3 w-3" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed: React.FC<{
  activities: any[];
  loading?: boolean;
}> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white">
              {activity.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImprovedAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const { 
    homestays, 
    loading: homestaysLoading, 
    error: homestaysError, 
    loadHomestays,
    setHomestays,
    clearError 
  } = useHomestays();

  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalHomestays: 0,
    pendingHomestays: 0,
    approvedHomestays: 0,
    rejectedHomestays: 0,
    totalRooms: 0,
    averageRating: 0,
    recentActivity: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Debounced search
  const handleSearchChange = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    return () => handleSearchChange.cancel();
  }, [handleSearchChange]);

  // Effects
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (homestays && homestays.length >= 0) {
      console.log('[Dashboard] Homestays loaded:', homestays.length);
      const calculatedStats = calculateHomestayStats(homestays);
      const recentActivity = generateRecentActivity(homestays);
      
      setStats({
        ...calculatedStats,
        recentActivity
      });
    }
  }, [homestays]);

  // Data loading
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log('[Dashboard] Loading homestays...');
      let allHomestays: Homestay[] = [];
      let page = 1;
      let totalPages = 1;
      const limit = 100;

      while (page <= totalPages) {
        const result = await loadHomestays({ limit, page });
        if (result) {
          allHomestays = [...allHomestays, ...(result.data || [])];
          totalPages = result.totalPages || 1;
          console.log(`[Dashboard] Fetched page ${page}/${totalPages}, homestays: ${result.data?.length}`);
          page++;
        } else {
          break;
        }
      }

      setHomestays(allHomestays);
      console.log('[Dashboard] All homestays loaded:', allHomestays.length);
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadHomestays, addToast, setHomestays]);

  // Handlers
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'homestays':
        router.push('/admin/homestays');
        break;
      case 'create-homestay':
        router.push('/admin/homestays/create');
        break;
      case 'bulk-create':
        router.push('/admin/homestays/bulk-create');
        break;
      case 'master-data':
        router.push('/admin/master-data');
        break;
      case 'users':
        router.push('/admin/users');
        break;
      default:
        break;
    }
  }, [router]);

  const handleRefresh = useCallback(async () => {
    await loadDashboardData();
    addToast({
      type: 'success',
      title: 'Refreshed',
      message: 'Dashboard data updated'
    });
  }, [loadDashboardData, addToast]);

  const filteredHomestays = homestays.filter((homestay: Homestay) =>
    (homestay.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (homestay.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Early return for loading
  if (status === 'loading' || (homestaysLoading && homestays.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {session.user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={handleRefresh}
                variant="secondary"
                loading={refreshing}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {homestaysError && (
          <div className="mb-8">
            <Alert
              type="error"
              title="Error"
              message={homestaysError}
              onClose={clearError}
              actions={
                <ActionButton onClick={loadDashboardData} variant="secondary" size="sm">
                  Try Again
                </ActionButton>
              }
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Homestays"
            value={stats.totalHomestays}
            icon={<Home className="h-6 w-6" />}
            color="blue"
            onClick={() => handleQuickAction('homestays')}
            loading={homestaysLoading}
          />
          
          <StatCard
            title="Pending Approval"
            value={stats.pendingHomestays}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            onClick={() => router.push('/admin/homestays?status=PENDING')}
            loading={homestaysLoading}
          />
          
          <StatCard
            title="Approved"
            value={stats.approvedHomestays}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            onClick={() => router.push('/admin/homestays?status=APPROVED')}
            loading={homestaysLoading}
          />
          
          <StatCard
            title="Rejected"
            value={stats.rejectedHomestays}
            icon={<AlertCircle className="h-6 w-6" />}
            color="red"
            onClick={() => router.push('/admin/homestays?status=REJECTED')}
            loading={homestaysLoading}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={<Bed className="h-6 w-6" />}
            color="purple"
            loading={homestaysLoading}
          />
          
          <StatCard
            title="Average Rating"
            value={stats.averageRating || 'N/A'}
            icon={<Star className="h-6 w-6" />}
            color="yellow"
            loading={homestaysLoading}
          />
          
          <StatCard
            title="Active Listings"
            value={stats.approvedHomestays}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            loading={homestaysLoading}
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card title="Quick Actions" subtitle="Common administrative tasks">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard
                  title="Create Homestay"
                  description="Add a new homestay property"
                  icon={<Plus className="h-6 w-6" />}
                  color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  onClick={() => handleQuickAction('create-homestay')}
                />
                
                <QuickActionCard
                  title="Bulk Create"
                  description="Add multiple homestays at once"
                  icon={<Home className="h-6 w-6" />}
                  color="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  onClick={() => handleQuickAction('bulk-create')}
                />
                
                <QuickActionCard
                  title="Manage Users"
                  description="User accounts and permissions"
                  icon={<Users className="h-6 w-6" />}
                  color="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                  onClick={() => handleQuickAction('users')}
                />
                
                <QuickActionCard
                  title="Master Data"
                  description="Facilities, bed types, currencies"
                  icon={<Settings className="h-6 w-6" />}
                  color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                  onClick={() => handleQuickAction('master-data')}
                />
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card title="Recent Activity">
              <ActivityFeed 
                activities={stats.recentActivity} 
                loading={homestaysLoading}
              />
            </Card>
          </div>
        </div>

        {/* Recent Homestays */}
        <Card
          title="Recent Homestays"
          subtitle={`${filteredHomestays.length} of ${homestays.length} homestays`}
          actions={
            <div className="flex items-center space-x-3">
              <ErrorBoundary>
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search homestays..."
                  className="w-64"
                  onClear={() => setSearchTerm('')}
                />
              </ErrorBoundary>
              <ActionButton
                onClick={() => handleQuickAction('homestays')}
                variant="secondary"
                size="sm"
              >
                View All
              </ActionButton>
            </div>
          }
          loading={homestaysLoading}
        >
          {filteredHomestays.length > 0 ? (
            <div className="space-y-4">
              {filteredHomestays.slice(0, 5).map((homestay: Homestay) => (
                <RecentHomestayCard
                  key={homestay.id}
                  homestay={homestay}
                  onView={(id) => router.push(`/admin/homestays/${id}`)}
                  onEdit={(id) => router.push(`/admin/homestays/${id}/edit`)}
                />
              ))}
              {filteredHomestays.length > 5 && (
                <div className="text-center pt-4">
                  <ActionButton
                    onClick={() => handleQuickAction('homestays')}
                    variant="secondary"
                  >
                    View {filteredHomestays.length - 5} More
                  </ActionButton>
                </div>
              )}
            </div>
          ) : homestaysLoading ? (
            <LoadingSpinner text="Loading homestays..." />
          ) : (
            <div className="text-center py-8">
              <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No homestays found' : 'No homestays yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Get started by creating your first homestay.'
                }
              </p>
              {!searchTerm && (
                <div className="mt-4">
                  <ActionButton
                    onClick={() => handleQuickAction('create-homestay')}
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Homestay
                  </ActionButton>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}