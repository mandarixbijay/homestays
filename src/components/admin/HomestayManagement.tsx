import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  MapPin,
  User,
  Star,
  Calendar,
  Filter,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

import {
  useHomestays,
  useFilters,
  HomestayFilters,
  useAsyncOperation
} from '@/hooks/useAdminApi';

import {
  LoadingSpinner,
  Alert,
  ActionButton,
  Card,
  SearchInput,
  StatusBadge,
  Modal,
  EmptyState,
  Input,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

type HomestayStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ApprovalModalData {
  homestayId: number;
  homestayName: string;
  status: HomestayStatus;
  rejectionReason: string;
}

interface HomestayStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalRooms: number;
  averageRating: number;
  growthStats?: {
    totalGrowth: number;
    pendingGrowth: number;
    approvedGrowth: number;
    rejectedGrowth: number;
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: React.ReactNode;
  growth?: number;
  loading?: boolean;
  onClick?: () => void;
}> = ({ title, value, subtitle, color, icon, growth, loading, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800'
  };

  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  const getGrowthIcon = () => {
    if (growth === undefined) return null;
    if (growth > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getGrowthColor = () => {
    if (growth === undefined) return 'text-gray-500';
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <Card 
      className={`${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            {icon && (
              <div className={`${textColorClasses[color]}`}>
                {icon}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold mt-1 ${textColorClasses[color]}`}>
              {value}
            </p>
          )}
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          
          {growth !== undefined && (
            <div className={`flex items-center mt-2 text-xs ${getGrowthColor()}`}>
              {getGrowthIcon()}
              <span className="ml-1 font-medium">
                {growth > 0 ? '+' : ''}{growth}% from last month
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const HomestayCard: React.FC<{
  homestay: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onApprove: (homestay: any, status: HomestayStatus) => void;
}> = ({ homestay, onView, onEdit, onDelete, onApprove }) => {
  const mainImage = homestay.images?.find((img: any) => img.isMain) || homestay.images?.[0];

  return (
    <Card className="hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex space-x-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={homestay.name || 'Homestay'}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 ${mainImage ? 'hidden' : ''}`}>
            <Home className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {homestay.name || homestay.propertyName || 'Unnamed Homestay'}
              </h3>

              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{homestay.address || homestay.propertyAddress || 'No address provided'}</span>
              </div>

              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>
                  {homestay.owner?.name || 'Unknown Owner'} 
                  {homestay.owner?.id && ` (ID: ${homestay.owner.id})`}
                  {!homestay.owner?.id && homestay.ownerId && ` (ID: ${homestay.ownerId})`}
                </span>
              </div>

              <div className="mt-2 flex items-center space-x-4 flex-wrap gap-y-1">
                <StatusBadge status={homestay.status || 'PENDING'} variant="small" />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {homestay.rooms?.length || 0} rooms
                </span>

                {homestay.rating && homestay.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {homestay.rating}
                      {homestay.reviews && ` (${homestay.reviews} reviews)`}
                    </span>
                  </div>
                )}

                {homestay.discount && homestay.discount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {homestay.discount}% OFF
                  </span>
                )}

                {homestay.vipAccess && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    VIP
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center text-xs text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  Created {homestay.createdAt ? new Date(homestay.createdAt).toLocaleDateString() : 'Unknown'}
                  {homestay.updatedAt && homestay.updatedAt !== homestay.createdAt && (
                    <span className="ml-2">
                      • Updated {new Date(homestay.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4">
              {homestay.status === 'PENDING' && (
                <>
                  <ActionButton
                    onClick={() => onApprove(homestay, 'APPROVED')}
                    variant="success"
                    size="xs"
                    icon={<Check className="h-3 w-3" />}
                  >
                    Approve
                  </ActionButton>
                  <ActionButton
                    onClick={() => onApprove(homestay, 'REJECTED')}
                    variant="danger"
                    size="xs"
                    icon={<X className="h-3 w-3" />}
                  >
                    Reject
                  </ActionButton>
                </>
              )}

              <ActionButton
                onClick={() => onView(homestay.id)}
                variant="secondary"
                size="xs"
                icon={<Eye className="h-3 w-3" />}
              >
                View
              </ActionButton>

              <ActionButton
                onClick={() => onEdit(homestay.id)}
                variant="secondary"
                size="xs"
                icon={<Edit className="h-3 w-3" />}
              >
                Edit
              </ActionButton>

              <ActionButton
                onClick={() => onDelete(homestay.id)}
                variant="danger"
                size="xs"
                icon={<Trash2 className="h-3 w-3" />}
              >
                Delete
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FilterPanel: React.FC<{
  filters: HomestayFilters;
  onFilterChange: (key: keyof HomestayFilters, value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading?: boolean;
}> = ({ filters, onFilterChange, onClearFilters, onRefresh, loading }) => {
  return (
    <Card title="Filters & Actions" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => onFilterChange('search', value)}
          placeholder="Search by name..."
          loading={loading}
          onClear={() => onFilterChange('search', '')}
        />

        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            disabled={loading}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <Input
          type="number"
          value={filters.ownerId}
          onChange={(e) => onFilterChange('ownerId', e.target.value)}
          placeholder="Owner ID"
          disabled={loading}
        />

        <Input
          value={filters.address}
          onChange={(e) => onFilterChange('address', e.target.value)}
          placeholder="Address"
          disabled={loading}
        />
      </div>

      <div className="mt-4 flex justify-between">
        <div className="flex space-x-2">
          <ActionButton
            onClick={onClearFilters}
            variant="secondary"
            size="sm"
            icon={<X className="h-4 w-4" />}
            disabled={loading}
          >
            Clear Filters
          </ActionButton>
          
          <ActionButton
            onClick={onRefresh}
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            loading={loading}
          >
            Refresh
          </ActionButton>
        </div>

        <div className="flex space-x-2">
          <ActionButton
            onClick={() => {/* Export functionality */ }}
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            disabled={loading}
          >
            Export
          </ActionButton>
          <ActionButton
            onClick={() => {/* Import functionality */ }}
            variant="secondary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            disabled={loading}
          >
            Import
          </ActionButton>
        </div>
      </div>
    </Card>
  );
};

const ApprovalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: ApprovalModalData | null;
  onSubmit: (data: ApprovalModalData) => Promise<void>;
}> = ({ isOpen, onClose, data, onSubmit }) => {
  const [formData, setFormData] = useState<ApprovalModalData | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation();

  useEffect(() => {
    setFormData(data);
    if (data) {
      clearError(); // Reset error when modal opens with new data
    }
  }, [data, clearError]);

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      await execute(() => onSubmit(formData));
      onClose();
    } catch (error: any) {
      console.error('Approval error in modal:', error);
      // Error is displayed via the error state
    }
  };

  if (!formData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        clearError();
      }}
      title={`${formData.status === 'APPROVED' ? 'Approve' : 'Reject'} Homestay`}
      footer={
        <>
          <ActionButton onClick={() => {
            onClose();
            clearError();
          }} variant="secondary" disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleSubmit}
            variant={formData.status === 'APPROVED' ? 'success' : 'danger'}
            loading={loading}
            disabled={formData.status === 'REJECTED' && !formData.rejectionReason.trim()}
          >
            {formData.status === 'APPROVED' ? 'Approve' : 'Reject'}
          </ActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to {formData.status.toLowerCase()} &quot;{formData.homestayName}&quot;?
        </p>

        {formData.status === 'REJECTED' && (
          <Input
            label="Rejection Reason"
            value={formData.rejectionReason}
            onChange={(e) => setFormData(prev => prev ? { ...prev, rejectionReason: e.target.value } : null)}
            placeholder="Please provide a reason for rejection..."
            required
            error={formData.status === 'REJECTED' && !formData.rejectionReason.trim() ? 'Rejection reason is required' : undefined}
          />
        )}
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={clearError}
          />
        )}
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImprovedHomestayManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast } = useToast();

  // Hooks
  const {
    homestays,
    totalPages,
    total,
    loading,
    error,
    loadHomestays,
    deleteHomestay,
    approveHomestay,
    clearError
  } = useHomestays();

  const { filters, updateFilter, clearFilters } = useFilters<HomestayFilters>({
    search: '',
    status: undefined,
    ownerId: '',
    address: '',
  });

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalModalData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate real-time stats from current homestays data
  const stats: HomestayStats = useMemo(() => {
    const pendingCount = homestays.filter((h: any) => h.status === 'PENDING').length;
    const approvedCount = homestays.filter((h: any) => h.status === 'APPROVED').length;
    const rejectedCount = homestays.filter((h: any) => h.status === 'REJECTED').length;
    const totalRooms = homestays.reduce((sum: number, h: any) => sum + (h.rooms?.length || 0), 0);
    
    // Calculate average rating from homestays with ratings
    const homestaysWithRatings = homestays.filter((h: any) => h.rating && h.rating > 0);
    const averageRating = homestaysWithRatings.length > 0 
      ? homestaysWithRatings.reduce((sum: number, h: any) => sum + h.rating, 0) / homestaysWithRatings.length
      : 0;

    return {
      total,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      totalRooms,
      averageRating: Number(averageRating.toFixed(1))
    };
  }, [homestays, total]);

  // Effects
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadHomestaysData();
    }
  }, [status, session, router, currentPage, filters]);

  // Handlers
  const loadHomestaysData = useCallback(async () => {
    try {
      await loadHomestays({
        page: currentPage,
        limit: 10,
        ...filters,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load homestays'
      });
    }
  }, [currentPage, filters, loadHomestays, addToast]);

  const handleFilterChange = useCallback((key: keyof HomestayFilters, value: string) => {
    updateFilter(key, value);
    setCurrentPage(1); // Reset to first page when filters change
  }, [updateFilter]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHomestaysData();
      addToast({
        type: 'success',
        title: 'Refreshed',
        message: 'Data updated successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh data'
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadHomestaysData, addToast]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this homestay? This action cannot be undone.')) return;

    try {
      await deleteHomestay(id);
      await loadHomestaysData();
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Homestay deleted successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete homestay'
      });
    }
  }, [deleteHomestay, loadHomestaysData, addToast]);

  const handleApproval = useCallback((homestay: any, status: HomestayStatus) => {
    setApprovalData({
      homestayId: homestay.id,
      homestayName: homestay.name || homestay.propertyName || 'Unnamed Homestay',
      status,
      rejectionReason: ''
    });
    setShowApprovalModal(true);
  }, []);

  const submitApproval = useCallback(async (data: ApprovalModalData) => {
    try {
      await approveHomestay(data.homestayId, {
        status: data.status,
        rejectionReason: data.rejectionReason
      });
      await loadHomestaysData();
      addToast({
        type: 'success',
        title: 'Success',
        message: `Homestay ${data.status.toLowerCase()} successfully`
      });
      setShowApprovalModal(false);
    } catch (error: any) {
      // Error is handled in ApprovalModal via useAsyncOperation
      console.error('Approval error:', error);
    }
  }, [approveHomestay, loadHomestaysData, addToast]);

  // Early returns
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const isLoading = loading || refreshing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Homestay Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage and monitor all homestay properties
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={() => router.push('/admin/homestays/create')}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                disabled={isLoading}
              >
                Create Homestay
              </ActionButton>
              <ActionButton
                onClick={() => router.push('/admin/homestays/bulk-create')}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                disabled={isLoading}
              >
                Bulk Create
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={clearError}
              actions={
                <ActionButton 
                  onClick={handleRefresh} 
                  variant="secondary" 
                  size="sm"
                  disabled={isLoading}
                >
                  Retry
                </ActionButton>
              }
            />
          </div>
        )}

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          loading={isLoading}
        />

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Homestays"
            value={stats.total}
            color="blue"
            icon={<Home className="h-5 w-5" />}
            loading={isLoading && homestays.length === 0}
            onClick={() => {
              clearFilters();
              setCurrentPage(1);
            }}
          />
          
          <StatCard
            title="Pending Approval"
            value={stats.pending}
            color="yellow"
            icon={<Calendar className="h-5 w-5" />}
            loading={isLoading && homestays.length === 0}
            onClick={() => {
              updateFilter('status', 'PENDING');
              setCurrentPage(1);
            }}
          />
          
          <StatCard
            title="Approved"
            value={stats.approved}
            color="green"
            icon={<Check className="h-5 w-5" />}
            loading={isLoading && homestays.length === 0}
            onClick={() => {
              updateFilter('status', 'APPROVED');
              setCurrentPage(1);
            }}
          />
          
          <StatCard
            title="Rejected"
            value={stats.rejected}
            color="red"
            icon={<X className="h-5 w-5" />}
            loading={isLoading && homestays.length === 0}
            onClick={() => {
              updateFilter('status', 'REJECTED');
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            subtitle="Across all homestays"
            color="purple"
            loading={isLoading && homestays.length === 0}
          />
          
          <StatCard
            title="Average Rating"
            value={stats.averageRating > 0 ? stats.averageRating : 'N/A'}
            subtitle={stats.averageRating > 0 ? 'Based on rated properties' : 'No ratings yet'}
            color="blue"
            icon={<Star className="h-5 w-5" />}
            loading={isLoading && homestays.length === 0}
          />
        </div>

        {/* Main Content */}
        {isLoading && homestays.length === 0 ? (
          <Card>
            <LoadingSpinner size="lg" text="Loading homestays..." />
          </Card>
        ) : homestays.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Home className="h-12 w-12" />}
              title="No homestays found"
              description={
                Object.values(filters).some(v => v !== '' && v !== undefined)
                  ? "No homestays match your current filters. Try adjusting your search criteria."
                  : "No homestays have been created yet. Get started by creating your first homestay."
              }
              action={{
                label: Object.values(filters).some(v => v !== '' && v !== undefined) 
                  ? 'Clear Filters' 
                  : 'Create Homestay',
                onClick: Object.values(filters).some(v => v !== '' && v !== undefined)
                  ? handleClearFilters
                  : () => router.push('/admin/homestays/create'),
                icon: Object.values(filters).some(v => v !== '' && v !== undefined) 
                  ? <X className="h-4 w-4" />
                  : <Plus className="h-4 w-4" />,
                variant: 'primary'
              }}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {homestays.map((homestay: any) => (
              <HomestayCard
                key={homestay.id}
                homestay={homestay}
                onView={(id) => router.push(`/admin/homestays/${id}`)}
                onEdit={(id) => router.push(`/admin/homestays/${id}/edit`)}
                onDelete={handleDelete}
                onApprove={handleApproval}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
            </div>

            <div className="flex items-center space-x-2">
              <ActionButton
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                variant="secondary"
                size="sm"
              >
                Previous
              </ActionButton>

              <span className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>

              <ActionButton
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                variant="secondary"
                size="sm"
              >
                Next
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        data={approvalData}
        onSubmit={submitApproval}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            className="min-w-80 shadow-lg"
          />
        ))}
      </div>
    </div>
  );
}