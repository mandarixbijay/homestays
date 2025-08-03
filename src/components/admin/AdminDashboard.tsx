// components/admin/ImprovedAdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Home, Users, Settings, TrendingUp, Clock, CheckCircle,
  AlertCircle, Plus, Eye, Edit, Trash2, Search, Filter, Activity,
  Calendar, Star, MapPin, Phone, BarChart3, PieChart, ArrowUp,
  ArrowDown, RefreshCw, Download, Bell, User,
  Bed
} from 'lucide-react';

import {
  useAsyncOperation,
  useHomestays,
} from '@/hooks/useAdminApi';

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
  totalUsers: number;
  totalRooms: number;
  averageRating: number;
  recentActivity: any[];
}

// ============================================================================
// UTILITIES
// ============================================================================

const calculateHomestayStats = (homestays: any[]) => {
  const stats = {
    totalHomestays: homestays.length,
    pendingHomestays: homestays.filter(h => h.status === 'PENDING').length,
    approvedHomestays: homestays.filter(h => h.status === 'APPROVED').length,
    rejectedHomestays: homestays.filter(h => h.status === 'REJECTED').length,
    totalRooms: homestays.reduce((total, h) => total + (h.rooms?.length || 0), 0),
    averageRating: 0
  };

  // Calculate average rating from homestays that have ratings
  const homestaysWithRatings = homestays.filter(h => h.rating && h.rating > 0);
  if (homestaysWithRatings.length > 0) {
    const totalRating = homestaysWithRatings.reduce((sum, h) => sum + h.rating, 0);
    stats.averageRating = Number((totalRating / homestaysWithRatings.length).toFixed(1));
  }

  return stats;
};

const generateRecentActivity = (homestays: any[]) => {
  const activities: any[] = [];
  
  // Sort homestays by createdAt or updatedAt, most recent first
  const sortedHomestays = [...homestays].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Generate activities for recent homestays
  sortedHomestays.slice(0, 10).forEach(homestay => {
    const createdAt = new Date(homestay.createdAt);
    const updatedAt = new Date(homestay.updatedAt);
    
    // If updated recently and different from created date, show update activity
    if (homestay.updatedAt && updatedAt.getTime() !== createdAt.getTime()) {
      activities.push({
        description: `Homestay "${homestay.name}" was updated`,
        timestamp: homestay.updatedAt,
        type: 'update',
        homestayId: homestay.id
      });
    }
    
    // Show creation activity
    if (homestay.createdAt) {
      let description = `New homestay "${homestay.name}" was created`;
      if (homestay.status === 'APPROVED') {
        description = `Homestay "${homestay.name}" was approved`;
      } else if (homestay.status === 'REJECTED') {
        description = `Homestay "${homestay.name}" was rejected`;
      } else if (homestay.status === 'PENDING') {
        description = `New homestay "${homestay.name}" submitted for approval`;
      }
      
      activities.push({
        description,
        timestamp: homestay.createdAt,
        type: 'create',
        homestayId: homestay.id
      });
    }
  });

  // Sort activities by timestamp, most recent first
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // Show only 5 most recent activities
};

// ============================================================================
// COMPONENTS (StatCard, QuickActionCard, RecentHomestayCard, ActivityFeed remain the same)
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}> = ({ title, value, change, changeType, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  const changeColorClasses = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
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
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${changeColorClasses[changeType || 'neutral']}`}>
              {changeType === 'increase' && <ArrowUp className="h-3 w-3 mr-1" />}
              {changeType === 'decrease' && <ArrowDown className="h-3 w-3 mr-1" />}
              <span className="text-xs font-medium">
                {Math.abs(change)}% from last month
              </span>
            </div>
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
  homestay: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}> = ({ homestay, onView, onEdit, onApprove, onReject }) => {
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
                {homestay.name}
              </h4>
              
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{homestay.address}</span>
              </div>
              
              <div className="mt-1 flex items-center space-x-4">
                <StatusBadge status={homestay.status} variant="small" />
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
              {homestay.status === 'PENDING' && onApprove && onReject && (
                <>
                  <ActionButton
                    onClick={() => onApprove(homestay.id)}
                    variant="success"
                    size="xs"
                    icon={<CheckCircle className="h-3 w-3" />}
                  />
                  <ActionButton
                    onClick={() => onReject(homestay.id)}
                    variant="danger"
                    size="xs"
                    icon={<AlertCircle className="h-3 w-3" />}
                  />
                </>
              )}
              
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
}> = ({ activities }) => {
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
    clearError 
  } = useHomestays();

  const { loading: statsLoading, execute: loadStats } = useAsyncOperation<DashboardStats>();

  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalHomestays: 0,
    pendingHomestays: 0,
    approvedHomestays: 0,
    rejectedHomestays: 0,
    totalUsers: 0, // This would need a separate API call
    totalRooms: 0,
    averageRating: 0,
    recentActivity: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  // Update stats when homestays data changes
  useEffect(() => {
    if (homestays && homestays.length >= 0) {
      const calculatedStats = calculateHomestayStats(homestays);
      const recentActivity = generateRecentActivity(homestays);
      
      setStats(prevStats => ({
        ...prevStats,
        ...calculatedStats,
        recentActivity
      }));
    }
  }, [homestays]);

  // Data loading
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Load all homestays (we need all for accurate stats)
      await loadHomestays({ limit: 1000, page: 1 }); // Load many homestays for accurate stats
      
      // Load additional dashboard stats that require separate API calls
      // TODO: Add these API endpoints to get real data
      /*
      await loadStats(async () => {
        const [usersCount] = await Promise.all([
          adminApi.getUsersCount(), // Need to add this endpoint
          // Could add more endpoints like:
          // adminApi.getMonthlyGrowthStats(),
          // adminApi.getSystemStats(),
        ]);
        
        return {
          totalUsers: usersCount,
          // Add other stats that need separate API calls
        };
      });
      */

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadHomestays, addToast]);

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

  const filteredHomestays = homestays.filter((homestay: any) =>
    homestay.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homestay.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <ActionButton
                onClick={() => {/* Export functionality */}}
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
              >
                Export
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
          />
          
          <StatCard
            title="Pending Approval"
            value={stats.pendingHomestays}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            onClick={() => router.push('/admin/homestays?status=PENDING')}
          />
          
          <StatCard
            title="Approved"
            value={stats.approvedHomestays}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            onClick={() => router.push('/admin/homestays?status=APPROVED')}
          />
          
          <StatCard
            title="Average Rating"
            value={stats.averageRating || 'N/A'}
            icon={<Star className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 'N/A'}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            onClick={() => handleQuickAction('users')}
          />
          
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={<Bed className="h-6 w-6" />}
            color="green"
          />
          
          <StatCard
            title="Rejected"
            value={stats.rejectedHomestays}
            icon={<AlertCircle className="h-6 w-6" />}
            color="red"
            onClick={() => router.push('/admin/homestays?status=REJECTED')}
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
            <Card title="Recent Activity" loading={homestaysLoading}>
              <ActivityFeed activities={stats.recentActivity} />
            </Card>
          </div>
        </div>

        {/* Recent Homestays */}
        <Card
          title="Recent Homestays"
          subtitle={`${filteredHomestays.length} of ${homestays.length} homestays`}
          actions={
            <div className="flex items-center space-x-3">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search homestays..."
                className="w-64"
                onClear={() => setSearchTerm('')}
              />
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
              {filteredHomestays.slice(0, 5).map((homestay: any) => (
                <RecentHomestayCard
                  key={homestay.id}
                  homestay={homestay}
                  onView={(id) => router.push(`/admin/homestays/${id}`)}
                  onEdit={(id) => router.push(`/admin/homestays/${id}/edit`)}
                  onApprove={(id) => {
                    addToast({
                      type: 'success',
                      title: 'Approved',
                      message: 'Homestay approved successfully'
                    });
                  }}
                  onReject={(id) => {
                    addToast({
                      type: 'success', 
                      title: 'Rejected',
                      message: 'Homestay rejected'
                    });
                  }}
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