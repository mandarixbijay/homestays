// components/admin/ImprovedHomestayManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, Component, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Home, Plus, Eye, Edit, Trash2, Check, X, MapPin, User, Star, Calendar,
  Filter, Download, Upload, RefreshCw, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { debounce } from 'lodash';
import {
  useHomestays, useAsyncOperation
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, Alert, ActionButton, Card, StatusBadge,
  Modal, EmptyState, Input, useToast
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
// COMPONENTS
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}> = ({ title, value, subtitle, color, icon, loading, onClick }) => {
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

  return (
    <Card className={`${colorClasses[color]}`}>
      <div
        className={`${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''} flex items-center justify-between`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            {icon && <div className={`${textColorClasses[color]}`}>{icon}</div>}
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold mt-1 ${textColorClasses[color]}`}>{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
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
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          {mainImage ? (
            <img src={mainImage.url} alt={homestay.name || 'Homestay'} className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{homestay.name || homestay.propertyName || 'Unnamed Homestay'}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{homestay.address || homestay.propertyAddress || 'No address'}</span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{homestay.owner?.name || 'Unknown'} {homestay.ownerId && `(ID: ${homestay.ownerId})`}</span>
              </div>
              <div className="mt-2 flex items-center space-x-4">
                <StatusBadge status={homestay.status || 'PENDING'} variant="small" />
                <span className="text-sm text-gray-500">{homestay.rooms?.length || 0} rooms</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              {homestay.status === 'PENDING' && (
                <>
                  <ActionButton onClick={() => onApprove(homestay, 'APPROVED')} variant="success" size="xs" icon={<Check className="h-3 w-3" />}>Approve</ActionButton>
                  <ActionButton onClick={() => onApprove(homestay, 'REJECTED')} variant="danger" size="xs" icon={<X className="h-3 w-3" />}>Reject</ActionButton>
                </>
              )}
              <ActionButton onClick={() => onView(homestay.id)} variant="secondary" size="xs" icon={<Eye className="h-3 w-3" />}>View</ActionButton>
              <ActionButton onClick={() => onEdit(homestay.id)} variant="secondary" size="xs" icon={<Edit className="h-3 w-3" />}>Edit</ActionButton>
              <ActionButton onClick={() => onDelete(homestay.id)} variant="danger" size="xs" icon={<Trash2 className="h-3 w-3" />}>Delete</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ApprovalModal: React.FC<{ isOpen: boolean; onClose: () => void; data: ApprovalModalData | null; onSubmit: (data: ApprovalModalData) => Promise<void>; }> = ({ isOpen, onClose, data, onSubmit }) => {
  const [formData, setFormData] = useState<ApprovalModalData | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation();

  useEffect(() => {
    setFormData(data);
    if (data) clearError();
  }, [data, clearError]);

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await execute(() => onSubmit(formData));
      onClose();
    } catch (error: any) { }
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${formData.status === 'APPROVED' ? 'Approve' : 'Reject'} Homestay`} footer={<><ActionButton onClick={onClose} variant="secondary" disabled={loading}>Cancel</ActionButton><ActionButton onClick={handleSubmit} variant={formData.status === 'APPROVED' ? 'success' : 'danger'} loading={loading}>{formData.status === 'APPROVED' ? 'Approve' : 'Reject'}</ActionButton></>}>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Are you sure you want to {formData.status.toLowerCase()} &quot;{formData.homestayName}&quot;?</p>
        {formData.status === 'REJECTED' && (<Input label="Rejection Reason" value={formData.rejectionReason} onChange={(e) => setFormData(prev => prev ? { ...prev, rejectionReason: e.target.value } : null)} placeholder="Reason..." required />)}
        {error && (<Alert type="error" title="Error" message={error} onClose={clearError} />)}
      </div>
    </Modal>
  );
};

// ============================================================================
//doğan
// MAIN COMPONENT
// ============================================================================

export default function ImprovedHomestayManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast } = useToast();

  const { homestays, totalPages, total, loading, error, loadHomestays, deleteHomestay, approveHomestay, clearError } = useHomestays();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerIdFilter, setOwnerIdFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalModalData | null>(null);

  // Debounced search
  const handleSearchChange = useMemo(
    () => debounce((value: string) => {
      console.log('Search changed:', value);
      setSearch(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    return () => handleSearchChange.cancel();
  }, [handleSearchChange]);

  const stats = useMemo(() => {
    const pendingCount = homestays.filter((h: any) => h.status === 'PENDING').length;
    const approvedCount = homestays.filter((h: any) => h.status === 'APPROVED').length;
    const rejectedCount = homestays.filter((h: any) => h.status === 'REJECTED').length;
    const totalRooms = homestays.reduce((sum: number, h: any) => sum + (h.rooms?.length || 0), 0);
    return { total, pending: pendingCount, approved: approvedCount, rejected: rejectedCount, totalRooms };
  }, [homestays, total]);

  const loadData = useCallback(async () => {
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (search.trim()) params.name = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (ownerIdFilter.trim()) params.ownerId = ownerIdFilter.trim();
      if (addressFilter.trim()) params.address = addressFilter.trim();

      console.log('Loading with params:', params);
      await loadHomestays(params);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load homestays' });
    }
  }, [currentPage, search, statusFilter, ownerIdFilter, addressFilter, loadHomestays, addToast]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, session?.user?.role, router, currentPage, search, statusFilter, ownerIdFilter, addressFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setOwnerIdFilter('');
    setAddressFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return;
    try {
      await deleteHomestay(id);
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Deleted' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed' });
    }
  };

  const handleApproval = (homestay: any, status: HomestayStatus) => {
    setApprovalData({ homestayId: homestay.id, homestayName: homestay.name || homestay.propertyName || 'Unnamed', status, rejectionReason: '' });
    setShowApprovalModal(true);
  };

  const submitApproval = async (data: ApprovalModalData) => {
    try {
      await approveHomestay(data.homestayId, { status: data.status, rejectionReason: data.rejectionReason });
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Done' });
      setShowApprovalModal(false);
    } catch (error: any) { }
  };

  if (status === 'loading') return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>);
  if (session?.user?.role !== 'ADMIN') return null;

  const hasFilters = search || statusFilter || ownerIdFilter || addressFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg"><Home className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Homestay Management</h1>
              </div>
            </div>
            <ActionButton onClick={() => router.push('/admin/homestays/create')} variant="primary" icon={<Plus className="h-4 w-4" />}>Create</ActionButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (<div className="mb-6"><Alert type="error" title="Error" message={error} onClose={clearError} /></div>)}

        <Card title="Filters" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ErrorBoundary>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by homestay name..."
                autoComplete="off"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </ErrorBoundary>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Input type="number" value={ownerIdFilter} onChange={(e) => { setOwnerIdFilter(e.target.value); setCurrentPage(1); }} placeholder="Owner ID" />
            <Input value={addressFilter} onChange={(e) => { setAddressFilter(e.target.value); setCurrentPage(1); }} placeholder="Address" />
          </div>
          <div className="mt-4">
            <ActionButton onClick={handleClearFilters} variant="secondary" size="sm" icon={<X className="h-4 w-4" />}>Clear Filters</ActionButton>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} color="blue" icon={<Home className="h-5 w-5" />} onClick={handleClearFilters} />
          <StatCard title="Pending" value={stats.pending} color="yellow" icon={<Calendar className="h-5 w-5" />} onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }} />
          <StatCard title="Approved" value={stats.approved} color="green" icon={<Check className="h-5 w-5" />} onClick={() => { setStatusFilter('APPROVED'); setCurrentPage(1); }} />
          <StatCard title="Rejected" value={stats.rejected} color="red" icon={<X className="h-5 w-5" />} onClick={() => { setStatusFilter('REJECTED'); setCurrentPage(1); }} />
        </div>

        {loading && homestays.length === 0 ? (
          <Card><LoadingSpinner size="lg" text="Loading..." /></Card>
        ) : homestays.length === 0 ? (
          <Card><EmptyState icon={<Home className="h-12 w-12" />} title="No homestays" description={hasFilters ? "No results" : "Create first"} action={{ label: hasFilters ? 'Clear' : 'Create', onClick: hasFilters ? handleClearFilters : () => router.push('/admin/homestays/create'), icon: <Plus className="h-4 w-4" />, variant: 'primary' }} /></Card>
        ) : (
          <div className="space-y-4">
            {homestays.map((h: any) => (<HomestayCard key={h.id} homestay={h} onView={(id) => router.push(`/admin/homestays/${id}`)} onEdit={(id) => router.push(`/admin/homestays/${id}/edit`)} onDelete={handleDelete} onApprove={handleApproval} />))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
            <div className="flex space-x-2">
              <ActionButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" size="sm">Prev</ActionButton>
              <ActionButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary" size="sm">Next</ActionButton>
            </div>
          </div>
        )}
      </div>

      <ApprovalModal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} data={approvalData} onSubmit={submitApproval} />
      <div className="fixed bottom-4 right-4 z-50 space-y-2">{toasts.map((t) => (<Alert key={t.id} type={t.type} title={t.title} message={t.message} className="min-w-80 shadow-lg" />))}</div>
    </div>
  );
}