import React, { useState, useEffect, useCallback } from 'react';
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
  Upload
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

// ============================================================================
// COMPONENTS
// ============================================================================

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
              alt={homestay.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {homestay.name}
              </h3>

              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{homestay.address}</span>
              </div>

              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{homestay.owner?.name} (ID: {homestay.owner?.id})</span>
              </div>

              <div className="mt-2 flex items-center space-x-4">
                <StatusBadge status={homestay.status} variant="small" />

                <span className="text-smt text-gray-500 dark:text-gray-400">
                  {homestay.rooms?.length || 0} rooms
                </span>

                {homestay.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {homestay.rating} ({homestay.reviews} reviews)
                    </span>
                  </div>
                )}

                {homestay.discount > 0 && (
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
                Created {new Date(homestay.createdAt).toLocaleDateString()}
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
  loading?: boolean;
}> = ({ filters, onFilterChange, onClearFilters, loading }) => {
  return (
    <Card title="Filters" className="mb-6">
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
        />

        <Input
          value={filters.address}
          onChange={(e) => onFilterChange('address', e.target.value)}
          placeholder="Address"
        />
      </div>

      <div className="mt-4 flex justify-between">
        <ActionButton
          onClick={onClearFilters}
          variant="secondary"
          size="sm"
          icon={<X className="h-4 w-4" />}
        >
          Clear Filters
        </ActionButton>

        <div className="flex space-x-2">
          <ActionButton
            onClick={() => {/* Export functionality */ }}
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </ActionButton>
          <ActionButton
            onClick={() => {/* Import functionality */ }}
            variant="secondary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
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

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this homestay?')) return;

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
      homestayName: homestay.name,
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
              >
                Create Homestay
              </ActionButton>
              <ActionButton
                onClick={() => router.push('/admin/homestays/bulk-create')}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
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
            />
          </div>
        )}

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Homestays</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {homestays.filter((h: any) => h.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {homestays.filter((h: any) => h.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {homestays.filter((h: any) => h.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
          </Card>
        </div>

        {/* Main Content */}
        {loading && homestays.length === 0 ? (
          <Card>
            <LoadingSpinner size="lg" text="Loading homestays..." />
          </Card>
        ) : homestays.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Home className="h-12 w-12" />}
              title="No homestays found"
              description="No homestays match your current filters. Try adjusting your search criteria or create a new homestay."
              action={{
                label: 'Create Homestay',
                onClick: () => router.push('/admin/homestays/create'),
                icon: <Plus className="h-4 w-4" />,
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
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
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