// components/admin/ImprovedHomestayManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, Component, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Home, Plus, Eye, Edit, Trash2, Check, X, MapPin, User, Star, Calendar,
  Filter, Download, Upload, RefreshCw, TrendingUp, TrendingDown, Minus,
  Search, Grid, List, MoreVertical, ChevronRight, CheckSquare, Square,
  Settings, SlidersHorizontal, FileDown, Loader2
} from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
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
type ViewMode = 'grid' | 'list';

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
  color: 'teal' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  trend?: { value: number; isPositive: boolean };
}> = ({ title, value, subtitle, color, icon, loading, onClick, trend }) => {
  const colorClasses = {
    teal: 'from-[#224240]/10 via-[#2a5350]/5 to-transparent',
    green: 'from-green-500/10 via-green-400/5 to-transparent',
    yellow: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
    red: 'from-red-500/10 via-red-400/5 to-transparent',
    purple: 'from-purple-500/10 via-purple-400/5 to-transparent'
  };

  const borderColorClasses = {
    teal: 'border-[#224240]/20 hover:border-[#224240]/40',
    green: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700',
    yellow: 'border-yellow-200 hover:border-yellow-300 dark:border-yellow-800 dark:hover:border-yellow-700',
    red: 'border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700',
    purple: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700'
  };

  const textColorClasses = {
    teal: 'text-[#224240] dark:text-[#2a5350]',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  const iconBgClasses = {
    teal: 'bg-gradient-to-br from-[#224240] to-[#2a5350]',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    red: 'bg-gradient-to-br from-red-500 to-red-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border ${borderColorClasses[color]} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none"></div>

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5 blur-2xl"></div>
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 dark:bg-white/5 blur-xl"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex items-baseline space-x-2">
                <p className={`text-4xl font-bold ${textColorClasses[color]}`}>{value}</p>
                {trend && (
                  <div className={`flex items-center text-sm font-semibold ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="ml-1">{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </div>
            )}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
          </div>
          {icon && (
            <div className={`p-3 rounded-xl ${iconBgClasses[color]} shadow-lg`}>
              <div className="text-white">{icon}</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HomestayCard: React.FC<{
  homestay: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onApprove: (homestay: any, status: HomestayStatus) => void;
  viewMode: ViewMode;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}> = ({ homestay, onView, onEdit, onDelete, onApprove, viewMode, isSelected, onSelect }) => {
  const mainImage = homestay.images?.find((img: any) => img.isMain) || homestay.images?.[0];

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {onSelect && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(homestay.id);
              }}
              className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-[#224240]" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={homestay.name || 'Homestay'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#224240] dark:group-hover:text-[#2a5350] transition-colors">
              {homestay.name || homestay.propertyName || 'Unnamed Homestay'}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="line-clamp-1">{homestay.address || homestay.propertyAddress || 'No address'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="line-clamp-1">{homestay.owner?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={homestay.status || 'PENDING'} variant="small" />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {homestay.rooms?.length || 0} rooms
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {homestay.status === 'PENDING' && (
              <>
                <ActionButton
                  onClick={() => onApprove(homestay, 'APPROVED')}
                  variant="success"
                  size="xs"
                  icon={<Check className="h-3.5 w-3.5" />}
                >
                  Approve
                </ActionButton>
                <ActionButton
                  onClick={() => onApprove(homestay, 'REJECTED')}
                  variant="danger"
                  size="xs"
                  icon={<X className="h-3.5 w-3.5" />}
                >
                  Reject
                </ActionButton>
              </>
            )}
            <ActionButton
              onClick={() => onView(homestay.id)}
              variant="secondary"
              size="xs"
              icon={<Eye className="h-3.5 w-3.5" />}
            />
            <ActionButton
              onClick={() => onEdit(homestay.id)}
              variant="secondary"
              size="xs"
              icon={<Edit className="h-3.5 w-3.5" />}
            />
            <ActionButton
              onClick={() => onDelete(homestay.id)}
              variant="danger"
              size="xs"
              icon={<Trash2 className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center space-x-4">
        {onSelect && (
          <button
            onClick={() => onSelect(homestay.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-[#224240]" />
            ) : (
              <Square className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}

        <div className="flex-shrink-0">
          {mainImage ? (
            <img src={mainImage.url} alt={homestay.name || 'Homestay'} className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-600" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              <Home className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-[#224240] dark:group-hover:text-[#2a5350] transition-colors">
                {homestay.name || homestay.propertyName || 'Unnamed Homestay'}
              </h3>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{homestay.address || homestay.propertyAddress || 'No address'}</span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{homestay.owner?.name || 'Unknown'} {homestay.ownerId && `(ID: ${homestay.ownerId})`}</span>
              </div>
              <div className="mt-2 flex items-center space-x-4">
                <StatusBadge status={homestay.status || 'PENDING'} variant="small" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{homestay.rooms?.length || 0} rooms</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {homestay.status === 'PENDING' && (
                <>
                  <ActionButton onClick={() => onApprove(homestay, 'APPROVED')} variant="success" size="xs" icon={<Check className="h-3.5 w-3.5" />}>Approve</ActionButton>
                  <ActionButton onClick={() => onApprove(homestay, 'REJECTED')} variant="danger" size="xs" icon={<X className="h-3.5 w-3.5" />}>Reject</ActionButton>
                </>
              )}
              <ActionButton onClick={() => onView(homestay.id)} variant="secondary" size="xs" icon={<Eye className="h-3.5 w-3.5" />}>View</ActionButton>
              <ActionButton onClick={() => onEdit(homestay.id)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>Edit</ActionButton>
              <ActionButton onClick={() => onDelete(homestay.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>Delete</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${formData.status === 'APPROVED' ? 'Approve' : 'Reject'} Homestay`}
      footer={
        <>
          <ActionButton onClick={onClose} variant="secondary" disabled={loading}>Cancel</ActionButton>
          <ActionButton onClick={handleSubmit} variant={formData.status === 'APPROVED' ? 'success' : 'danger'} loading={loading}>
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
            placeholder="Reason..."
            required
          />
        )}
        {error && (<Alert type="error" title="Error" message={error} onClose={clearError} />)}
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

  const { homestays, totalPages, total, loading, error, loadHomestays, deleteHomestay, approveHomestay, clearError } = useHomestays();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerIdFilter, setOwnerIdFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalModalData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [syncingMap, setSyncingMap] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [autoSyncInProgress, setAutoSyncInProgress] = useState(false);

  // Fetch current sync status from cache
  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sitemap/update');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setSyncedCount(data.stats.approved || 0);
          console.log('[HomestayManagement] Sync status:', data.stats);
        }
      }
    } catch (error) {
      console.error('[HomestayManagement] Error fetching sync status:', error);
    }
  }, []);

  // Debounced API call for loading data
  const debouncedLoadData = useMemo(
    () => debounce((params: any) => {
      console.log('[HomestayManagement] Debounced load with params:', params);
      loadHomestays(params).catch(error => {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load homestays' });
      });
    }, 500),
    [loadHomestays, addToast]
  );

  const loadData = useCallback(async () => {
    const params: any = { page: currentPage, limit: 10 };
    if (search.trim()) params.name = search.trim();
    if (statusFilter) params.status = statusFilter;
    if (ownerIdFilter.trim()) params.ownerId = ownerIdFilter.trim();
    if (addressFilter.trim()) params.address = addressFilter.trim();
    debouncedLoadData(params);
  }, [currentPage, search, statusFilter, ownerIdFilter, addressFilter, debouncedLoadData]);

  // Handle search input change (instant state update for smooth typing)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('[HomestayManagement] Search input changed:', value);
    setSearch(value);
    if (value !== search) {
      setCurrentPage(1);
    }
  }, [search]);

  useEffect(() => {
    return () => debouncedLoadData.cancel();
  }, [debouncedLoadData]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      loadData();
      fetchSyncStatus(); // Load current sync count from cache
    }
  }, [status, session?.user?.role, router, loadData, fetchSyncStatus]);

  // Auto-sync current page homestays to sitemap when homestays load
  useEffect(() => {
    if (homestays.length > 0 && status === 'authenticated') {
      // Delay auto-sync slightly to not block UI
      const timer = setTimeout(() => {
        autoSyncCurrentPage(homestays);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [homestays, status, autoSyncCurrentPage]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
    setOwnerIdFilter('');
    setAddressFilter('');
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return;
    try {
      await deleteHomestay(id);
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Deleted' });

      // Refresh sync status (full sync can be done manually if needed)
      fetchSyncStatus();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed' });
    }
  };

  const handleApproval = (homestay: any, status: HomestayStatus) => {
    setApprovalData({
      homestayId: homestay.id,
      homestayName: homestay.name || homestay.propertyName || 'Unnamed',
      status,
      rejectionReason: ''
    });
    setShowApprovalModal(true);
  };

  const submitApproval = async (data: ApprovalModalData) => {
    try {
      await approveHomestay(data.homestayId, { status: data.status, rejectionReason: data.rejectionReason });
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Done' });
      setShowApprovalModal(false);

      // Refresh sync status after approval/rejection
      if (data.status === 'APPROVED' || data.status === 'REJECTED') {
        fetchSyncStatus();
      }
    } catch (error: any) { }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === homestays.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(homestays.map((h: any) => h.id)));
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Approve ${selectedIds.size} homestays?`)) return;

    try {
      const promises = Array.from(selectedIds).map(id =>
        approveHomestay(id, { status: 'APPROVED', rejectionReason: '' })
      );
      await Promise.all(promises);
      await loadData();
      setSelectedIds(new Set());
      addToast({ type: 'success', title: 'Success', message: `Approved ${selectedIds.size} homestays` });

      // Refresh sync status after bulk approval
      fetchSyncStatus();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Some operations failed' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} homestays? This cannot be undone.`)) return;

    try {
      const promises = Array.from(selectedIds).map(id => deleteHomestay(id));
      await Promise.all(promises);
      await loadData();
      setSelectedIds(new Set());
      addToast({ type: 'success', title: 'Success', message: `Deleted ${selectedIds.size} homestays` });

      // Refresh sync status after bulk deletion
      fetchSyncStatus();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Some operations failed' });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Address', 'Status', 'Owner', 'Rooms'].join(','),
      ...homestays.map((h: any) => [
        h.id,
        `"${h.name || h.propertyName || 'Unnamed'}"`,
        `"${h.address || h.propertyAddress || 'No address'}"`,
        h.status || 'PENDING',
        `"${h.owner?.name || 'Unknown'}"`,
        h.rooms?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homestays-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Success', message: 'Exported to CSV' });
  };

  // Auto-sync current page homestays to sitemap (runs in background)
  const autoSyncCurrentPage = useCallback(async (homestaysToSync: any[]) => {
    try {
      // Only sync APPROVED homestays
      const approvedHomestays = homestaysToSync.filter(h => h.status === 'APPROVED');

      if (approvedHomestays.length === 0) {
        return;
      }

      setAutoSyncInProgress(true);

      const response = await fetch('/api/sitemap/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homestays: approvedHomestays.map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            status: h.status,
            updatedAt: h.updatedAt,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auto-sync] Updated sitemap with', approvedHomestays.length, 'homestays');
        console.log('[Auto-sync] Cache stats:', data.stats);

        // Update synced count from the actual cache stats
        if (data.stats && data.stats.approved !== undefined) {
          setSyncedCount(data.stats.approved);
        }
      }
    } catch (error) {
      console.error('[Auto-sync] Error:', error);
      // Silent fail - don't bother user with auto-sync errors
    } finally {
      setAutoSyncInProgress(false);
    }
  }, []);

  // Manual full sitemap sync - fetches ALL homestays and updates cache
  const handleSyncSitemap = async () => {
    try {
      setSyncingMap(true);
      console.log('[Manual Sync] Starting full sitemap sync...');

      // Fetch all homestays (all pages) with authentication
      const allHomestays: any[] = [];
      let currentPageNum = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `/admin/homestays?page=${currentPageNum}&limit=50`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch homestays: ${response.status}`);
        }

        const data = await response.json();
        const pageHomestays = data.homestays || data.data || [];

        allHomestays.push(...pageHomestays);
        console.log(`[Manual Sync] Fetched page ${currentPageNum}, got ${pageHomestays.length} homestays, total: ${allHomestays.length}`);

        // Check if there are more pages
        const totalPages = data.totalPages || Math.ceil((data.total || 0) / 50);
        hasMore = currentPageNum < totalPages && pageHomestays.length > 0;
        currentPageNum++;
      }

      console.log(`[Manual Sync] Fetched ${allHomestays.length} total homestays`);

      // Update cache with all homestays
      const updateResponse = await fetch('/api/sitemap/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homestays: allHomestays.map(h => ({
            id: h.id,
            name: h.name || h.propertyName,
            address: h.address || h.propertyAddress,
            status: h.status,
            updatedAt: h.updatedAt,
          })),
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update sitemap cache');
      }

      const updateData = await updateResponse.json();
      console.log('[Manual Sync] Cache updated:', updateData.stats);

      // Update synced count from cache stats
      if (updateData.stats && updateData.stats.approved !== undefined) {
        setSyncedCount(updateData.stats.approved);
      }

      // Revalidate sitemap to regenerate XML
      await fetch('/api/sitemap/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setLastSyncTime(new Date());
      addToast({
        type: 'success',
        title: 'Sitemap Synced',
        message: `Successfully synced ${updateData.stats?.approved || 0} approved homestays to sitemap`
      });
    } catch (error: any) {
      console.error('[Manual Sync] Error:', error);
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: error.message || 'Failed to sync sitemap'
      });
    } finally {
      setSyncingMap(false);
    }
  };

  const stats = useMemo(() => {
    const pendingCount = homestays.filter((h: any) => h.status === 'PENDING').length;
    const approvedCount = homestays.filter((h: any) => h.status === 'APPROVED').length;
    const rejectedCount = homestays.filter((h: any) => h.status === 'REJECTED').length;
    const totalRooms = homestays.reduce((sum: number, h: any) => sum + (h.rooms?.length || 0), 0);
    return { total, pending: pendingCount, approved: approvedCount, rejected: rejectedCount, totalRooms };
  }, [homestays, total]);

  if (status === 'loading') return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>);
  if (session?.user?.role !== 'ADMIN') return null;

  const hasFilters = search || statusFilter || ownerIdFilter || addressFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#224240] via-[#2a5350] to-[#336663] dark:from-[#1a332f] dark:via-[#224240] dark:to-[#2a5350] shadow-2xl">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Homestay Management</h1>
                <p className="text-white/80 text-sm">Manage and monitor all homestay properties</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ActionButton
                  onClick={handleSyncSitemap}
                  variant="secondary"
                  icon={syncingMap ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  disabled={syncingMap}
                  title={lastSyncTime ? `Last synced: ${lastSyncTime.toLocaleTimeString()}` : 'Sync sitemap with latest homestays'}
                >
                  {syncingMap ? 'Syncing...' : 'Sync Sitemap'}
                </ActionButton>
                {/* Out of sync badge */}
                {syncedCount < stats.approved && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-lg animate-pulse">
                    {stats.approved - syncedCount}
                  </span>
                )}
                {/* Auto-sync in progress indicator */}
                {autoSyncInProgress && (
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <ActionButton
                onClick={handleExport}
                variant="secondary"
                icon={<FileDown className="h-4 w-4" />}
                disabled={homestays.length === 0}
              >
                Export
              </ActionButton>
              <ActionButton
                onClick={() => router.push('/admin/homestays/create')}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Create Homestay
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (<div className="mb-6"><Alert type="error" title="Error" message={error} onClose={clearError} /></div>)}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Homestays"
            value={stats.total}
            color="teal"
            icon={<Home className="h-6 w-6" />}
            onClick={handleClearFilters}
            subtitle="All properties"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            color="yellow"
            icon={<Calendar className="h-6 w-6" />}
            onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }}
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            color="green"
            icon={<Check className="h-6 w-6" />}
            onClick={() => { setStatusFilter('APPROVED'); setCurrentPage(1); }}
            subtitle="Active listings"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            color="red"
            icon={<X className="h-6 w-6" />}
            onClick={() => { setStatusFilter('REJECTED'); setCurrentPage(1); }}
            subtitle="Declined properties"
          />
        </div>

        {/* Sitemap Sync Status */}
        {stats.approved > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <RefreshCw className={`h-5 w-5 text-white ${autoSyncInProgress ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sitemap Sync Status</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {syncedCount >= stats.approved ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">✓ All approved homestays synced</span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {syncedCount} / {stats.approved} synced • {stats.approved - syncedCount} pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {syncedCount < stats.approved && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {autoSyncInProgress ? 'Syncing current page...' : 'Navigate pages to sync more'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters & Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  showFilters
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {hasFilters && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>}
              </button>

              {selectedIds.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {selectedIds.size} selected
                  </span>
                  <ActionButton onClick={handleBulkApprove} variant="success" size="sm" icon={<Check className="h-4 w-4" />}>
                    Approve
                  </ActionButton>
                  <ActionButton onClick={handleBulkDelete} variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />}>
                    Delete
                  </ActionButton>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Inputs */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ErrorBoundary>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name..."
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#224240] focus:border-transparent transition-all"
                      />
                    </div>
                  </ErrorBoundary>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#224240] focus:border-transparent transition-all"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <Input
                    type="number"
                    value={ownerIdFilter}
                    onChange={(e) => { setOwnerIdFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="Filter by Owner ID"
                  />
                  <Input
                    value={addressFilter}
                    onChange={(e) => { setAddressFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="Filter by Address"
                  />
                </div>
                {hasFilters && (
                  <div className="mt-4">
                    <ActionButton
                      onClick={handleClearFilters}
                      variant="secondary"
                      size="sm"
                      icon={<X className="h-4 w-4" />}
                    >
                      Clear All Filters
                    </ActionButton>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Homestays List */}
        {loading && homestays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <LoadingSpinner size="lg" text="Loading homestays..." />
          </div>
        ) : homestays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <EmptyState
              icon={<Home className="h-16 w-16" />}
              title="No homestays found"
              description={hasFilters ? "No results match your filters" : "Get started by creating your first homestay"}
              action={{
                label: hasFilters ? 'Clear Filters' : 'Create Homestay',
                onClick: hasFilters ? handleClearFilters : () => router.push('/admin/homestays/create'),
                icon: <Plus className="h-4 w-4" />,
                variant: 'primary'
              }}
            />
          </div>
        ) : (
          <>
            {homestays.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {selectedIds.size === homestays.length ? (
                      <CheckSquare className="h-5 w-5 text-[#224240]" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {homestays.length} of {total} homestays
                </p>
              </div>
            )}

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              <AnimatePresence mode="popLayout">
                {homestays.map((h: any) => (
                  <HomestayCard
                    key={h.id}
                    homestay={h}
                    onView={(id) => router.push(`/admin/homestays/${id}`)}
                    onEdit={(id) => router.push(`/admin/homestays/${id}/edit`)}
                    onDelete={handleDelete}
                    onApprove={handleApproval}
                    viewMode={viewMode}
                    isSelected={selectedIds.has(h.id)}
                    onSelect={handleSelectItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <ActionButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </ActionButton>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#224240] text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <ActionButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        data={approvalData}
        onSubmit={submitApproval}
      />

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <Alert
            key={t.id}
            type={t.type}
            title={t.title}
            message={t.message}
            className="min-w-80 shadow-lg"
          />
        ))}
      </div>
    </div>
  );
}
