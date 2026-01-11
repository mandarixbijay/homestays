// components/admin/DestinationsManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Plus, Eye, Edit, Trash2, X, Search, Grid, List, RefreshCw,
  SlidersHorizontal, FileDown, Star, Home,
  TrendingUp, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import {
  useDestinations, useAsyncOperation
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, Alert, ActionButton, Modal, EmptyState, Input, useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list';

interface DestinationFormData {
  name: string;
  description: string;
  imageUrl: string;
  isTopDestination: boolean;
  priority?: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'teal' | 'green' | 'yellow' | 'purple';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}> = ({ title, value, subtitle, color, icon, loading, onClick }) => {
  const colorClasses = {
    teal: 'from-[#224240]/10 via-[#2a5350]/5 to-transparent',
    green: 'from-green-500/10 via-green-400/5 to-transparent',
    yellow: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
    purple: 'from-purple-500/10 via-purple-400/5 to-transparent'
  };

  const borderColorClasses = {
    teal: 'border-[#224240]/20 hover:border-[#224240]/40',
    green: 'border-green-200 hover:border-green-300',
    yellow: 'border-yellow-200 hover:border-yellow-300',
    purple: 'border-purple-200 hover:border-purple-300'
  };

  const textColorClasses = {
    teal: 'text-[#224240]',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  const iconBgClasses = {
    teal: 'bg-gradient-to-br from-[#224240] to-[#2a5350]',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
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
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-2xl"></div>
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : (
              <p className={`text-4xl font-bold ${textColorClasses[color]}`}>{value}</p>
            )}
            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
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

const DestinationCard: React.FC<{
  destination: any;
  onView: (id: number) => void;
  onEdit: (destination: any) => void;
  onDelete: (id: number) => void;
  viewMode: ViewMode;
}> = ({ destination, onView, onEdit, onDelete, viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden"
      >
        {destination.isTopDestination && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center space-x-1 shadow-lg">
              <Star className="h-3 w-3 text-white fill-white" />
              <span className="text-xs font-bold text-white">Top</span>
            </div>
          </div>
        )}

        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {destination.imageUrl ? (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#224240] transition-colors">
              {destination.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {destination.description || 'No description'}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 font-medium">
              {destination._count?.homestays || 0} homestays
            </span>
            {destination.priority && (
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                Priority: {destination.priority}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ActionButton
              onClick={() => onView(destination.id)}
              variant="secondary"
              size="xs"
              icon={<Eye className="h-3.5 w-3.5" />}
            >
              View
            </ActionButton>
            <ActionButton
              onClick={() => onEdit(destination)}
              variant="secondary"
              size="xs"
              icon={<Edit className="h-3.5 w-3.5" />}
            >
              Edit
            </ActionButton>
            <ActionButton
              onClick={() => onDelete(destination.id)}
              variant="danger"
              size="xs"
              icon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </ActionButton>
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
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 p-4"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {destination.imageUrl ? (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-24 h-24 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#224240] transition-colors">
                  {destination.name}
                </h3>
                {destination.isTopDestination && (
                  <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center space-x-1">
                    <Star className="h-3 w-3 text-white fill-white" />
                    <span className="text-xs font-bold text-white">Top</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {destination.description || 'No description'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{destination._count?.homestays || 0} homestays</span>
                {destination.priority && <span>Priority: {destination.priority}</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <ActionButton onClick={() => onView(destination.id)} variant="secondary" size="xs" icon={<Eye className="h-3.5 w-3.5" />}>
                View
              </ActionButton>
              <ActionButton onClick={() => onEdit(destination)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
                Edit
              </ActionButton>
              <ActionButton onClick={() => onDelete(destination.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>
                Delete
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DestinationFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  destination: any | null;
  onSubmit: (data: DestinationFormData) => Promise<void>;
}> = ({ isOpen, onClose, destination, onSubmit }) => {
  const [formData, setFormData] = useState<DestinationFormData>({
    name: '',
    description: '',
    imageUrl: '',
    isTopDestination: false,
    priority: undefined
  });
  const { loading, error, execute, clearError } = useAsyncOperation();

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        description: destination.description || '',
        imageUrl: destination.imageUrl || '',
        isTopDestination: destination.isTopDestination || false,
        priority: destination.priority || undefined
      });
    } else {
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        isTopDestination: false,
        priority: undefined
      });
    }
    clearError();
  }, [destination, clearError]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      await execute(() => onSubmit(formData));
      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={destination ? 'Edit Destination' : 'Create Destination'}
      footer={
        <>
          <ActionButton onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSubmit} variant="primary" loading={loading}>
            {destination ? 'Update' : 'Create'}
          </ActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Destination Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Pokhara, Kathmandu"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Beautiful lakeside city..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#224240] focus:border-transparent transition-all"
          />
        </div>

        <Input
          label="Image URL"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTopDestination}
              onChange={(e) => setFormData({ ...formData, isTopDestination: e.target.checked })}
              className="w-4 h-4 text-[#224240] border-gray-300 rounded focus:ring-[#224240]"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as Top Destination
            </span>
          </label>
        </div>

        {formData.isTopDestination && (
          <Input
            label="Priority (optional)"
            type="number"
            value={formData.priority || ''}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="1"
            min="1"
          />
        )}

        {error && <Alert type="error" title="Error" message={error} onClose={clearError} />}
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DestinationsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast } = useToast();

  const { destinations, totalPages, total, loading, error, loadDestinations, createDestination, updateDestination, deleteDestination, clearError } = useDestinations();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [topDestinationsOnly, setTopDestinationsOnly] = useState<boolean | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const debouncedLoadData = useMemo(
    () => debounce((params: any) => {
      loadDestinations(params).catch(() => {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load destinations' });
      });
    }, 500),
    [loadDestinations, addToast]
  );

  const loadData = useCallback(async () => {
    const params: any = { page: currentPage, limit: 10 };
    if (search.trim()) params.name = search.trim();
    if (topDestinationsOnly !== undefined) params.isTopDestination = topDestinationsOnly;
    debouncedLoadData(params);
  }, [currentPage, search, topDestinationsOnly, debouncedLoadData]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
    }
  }, [status, session?.user?.role, router, loadData]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setTopDestinationsOnly(undefined);
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this destination? This action cannot be undone.')) return;
    try {
      await deleteDestination(id);
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Destination deleted successfully' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete destination' });
    }
  };

  const handleFormSubmit = async (data: DestinationFormData) => {
    try {
      if (editingDestination) {
        await updateDestination(editingDestination.id, data);
        addToast({ type: 'success', title: 'Success', message: 'Destination updated successfully' });
      } else {
        await createDestination(data);
        addToast({ type: 'success', title: 'Success', message: 'Destination created successfully' });
      }
      await loadData();
      setShowFormModal(false);
      setEditingDestination(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save destination');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Description', 'Is Top', 'Priority', 'Homestays'].join(','),
      ...destinations.map((d: any) => [
        d.id,
        `"${d.name || ''}"`,
        `"${d.description || ''}"`,
        d.isTopDestination ? 'Yes' : 'No',
        d.priority || '',
        d._count?.homestays || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `destinations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Success', message: 'Exported to CSV' });
  };

  const stats = useMemo(() => {
    const topCount = destinations.filter(d => d.isTopDestination).length;
    const totalHomestays = destinations.reduce((sum, d) => sum + (d._count?.homestays || 0), 0);
    return {
      total,
      topDestinations: topCount,
      totalHomestays
    };
  }, [destinations, total]);

  const analyticsData = useMemo(() => {
    // Top 5 destinations by homestay count
    const topByHomestays = [...destinations]
      .sort((a, b) => (b._count?.homestays || 0) - (a._count?.homestays || 0))
      .slice(0, 5);

    // Distribution metrics
    const avgHomestaysPerDestination = destinations.length > 0
      ? (destinations.reduce((sum, d) => sum + (d._count?.homestays || 0), 0) / destinations.length).toFixed(1)
      : '0';

    const destinationsWithoutHomestays = destinations.filter(d => (d._count?.homestays || 0) === 0).length;

    return {
      topByHomestays,
      avgHomestaysPerDestination,
      destinationsWithoutHomestays,
      coverageRate: destinations.length > 0
        ? (((destinations.length - destinationsWithoutHomestays) / destinations.length) * 100).toFixed(1)
        : '0'
    };
  }, [destinations]);

  if (status === 'loading') return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>);
  if (session?.user?.role !== 'ADMIN') return null;

  const hasFilters = search || topDestinationsOnly !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#224240] via-[#2a5350] to-[#336663] shadow-2xl">
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
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Destinations Management</h1>
                <p className="text-white/80 text-sm">Manage tourist destinations and their associated homestays</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={handleExport}
                variant="secondary"
                icon={<FileDown className="h-4 w-4" />}
                disabled={destinations.length === 0}
              >
                Export
              </ActionButton>
              <ActionButton
                onClick={() => {
                  setEditingDestination(null);
                  setShowFormModal(true);
                }}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Create Destination
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (<div className="mb-6"><Alert type="error" title="Error" message={error} onClose={clearError} /></div>)}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Destinations"
            value={stats.total}
            color="teal"
            icon={<MapPin className="h-6 w-6" />}
            onClick={handleClearFilters}
            subtitle="All destinations"
          />
          <StatCard
            title="Top Destinations"
            value={stats.topDestinations}
            color="yellow"
            icon={<Star className="h-6 w-6" />}
            onClick={() => { setTopDestinationsOnly(true); setCurrentPage(1); }}
            subtitle="Featured destinations"
          />
          <StatCard
            title="Total Homestays"
            value={stats.totalHomestays}
            color="purple"
            icon={<Home className="h-6 w-6" />}
            subtitle="Across all destinations"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-[#224240] to-[#2a5350] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-[#224240] to-[#2a5350] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 mb-8">
            {/* Distribution Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Avg Homestays/Destination"
                value={analyticsData.avgHomestaysPerDestination}
                color="teal"
                icon={<TrendingUp className="h-6 w-6" />}
                subtitle="Average per destination"
              />
              <StatCard
                title="Coverage Rate"
                value={`${analyticsData.coverageRate}%`}
                color="green"
                icon={<TrendingUp className="h-6 w-6" />}
                subtitle="Destinations with homestays"
              />
              <StatCard
                title="Empty Destinations"
                value={analyticsData.destinationsWithoutHomestays}
                color="yellow"
                icon={<MapPin className="h-6 w-6" />}
                subtitle="Needs attention"
              />
            </div>

            {/* Top Destinations by Homestay Count */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Star className="h-5 w-5 mr-2 text-[#224240]" />
                Top Destinations by Homestay Count
              </h3>
              <div className="space-y-4">
                {analyticsData.topByHomestays.map((dest: any, idx: number) => {
                  const maxHomestays = analyticsData.topByHomestays[0]?._count?.homestays || 1;
                  const percentage = ((dest._count?.homestays || 0) / maxHomestays) * 100;
                  return (
                    <div key={dest.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            <span className="text-sm font-bold">#{idx + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dest.name}</p>
                            <p className="text-xs text-gray-500">
                              {dest.isTopDestination && <span className="text-yellow-600">★ Top </span>}
                              Priority: {dest.priority || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#224240]">
                            {dest._count?.homestays || 0}
                          </p>
                          <p className="text-xs text-gray-500">homestays</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#224240] to-[#2a5350] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
                {analyticsData.topByHomestays.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No destination data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  showFilters
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {hasFilters && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#224240] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={handleSearchChange}
                      placeholder="Search destinations..."
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#224240] focus:border-transparent transition-all"
                    />
                  </div>
                  <select
                    value={topDestinationsOnly === undefined ? '' : topDestinationsOnly.toString()}
                    onChange={(e) => {
                      setTopDestinationsOnly(e.target.value === '' ? undefined : e.target.value === 'true');
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#224240] focus:border-transparent transition-all"
                  >
                    <option value="">All Destinations</option>
                    <option value="true">Top Destinations Only</option>
                    <option value="false">Non-Top Destinations</option>
                  </select>
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

        {/* Destinations List */}
        {loading && destinations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <LoadingSpinner size="lg" text="Loading destinations..." />
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <EmptyState
              icon={<MapPin className="h-16 w-16" />}
              title="No destinations found"
              description={hasFilters ? "No results match your filters" : "Get started by creating your first destination"}
              action={{
                label: hasFilters ? 'Clear Filters' : 'Create Destination',
                onClick: hasFilters ? handleClearFilters : () => setShowFormModal(true),
                icon: <Plus className="h-4 w-4" />,
                variant: 'primary'
              }}
            />
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              <AnimatePresence mode="popLayout">
                {destinations.map((d: any) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    onView={(id) => router.push(`/admin/destinations/${id}`)}
                    onEdit={setEditingDestination}
                    onDelete={handleDelete}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 font-medium">
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
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          </>
        )}
      </div>

      <DestinationFormModal
        isOpen={showFormModal || editingDestination !== null}
        onClose={() => {
          setShowFormModal(false);
          setEditingDestination(null);
        }}
        destination={editingDestination}
        onSubmit={handleFormSubmit}
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
