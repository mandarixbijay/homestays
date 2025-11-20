// components/admin/TopHomestaysManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Star, Plus, Eye, Edit, Trash2, X, Search, Grid, List, RefreshCw,
  SlidersHorizontal, FileDown, Award, TrendingUp, Crown, Home, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import {
  useTopHomestays, useAsyncOperation, useHomestays
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, Alert, ActionButton, Card, Modal, EmptyState, Input, useToast
} from '@/components/admin/AdminComponents';

type ViewMode = 'grid' | 'list';

interface TopHomestayFormData {
  homestayId: number;
  strategy: 'MANUAL' | 'INSIGHT_BASED';
  category?: string;
  priority?: number;
  isActive: boolean;
}

const CATEGORIES = [
  { value: 'editor_choice', label: "Editor's Choice" },
  { value: 'most_booked', label: 'Most Booked' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'best_value', label: 'Best Value' },
  { value: 'trending', label: 'Trending' }
];

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
    teal: 'text-[#224240] dark:text-[#2a5350]',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  const iconBgClasses = {
    teal: 'bg-gradient-to-br from-[#224240] to-[#2a5350]',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600'
  };

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border ${borderColorClasses[color]} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none"></div>
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5 blur-2xl"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : (
              <p className={`text-4xl font-bold ${textColorClasses[color]}`}>{value}</p>
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

const TopHomestayCard: React.FC<{
  topHomestay: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  viewMode: ViewMode;
}> = ({ topHomestay, onEdit, onDelete, viewMode }) => {
  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (viewMode === 'grid') {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center space-x-1 shadow-lg">
            <Crown className="h-3 w-3 text-white fill-white" /><span className="text-xs font-bold text-white">Top</span>
          </div>
          {!topHomestay.isActive && (
            <div className="px-3 py-1 bg-gray-500 rounded-full"><span className="text-xs font-bold text-white">Inactive</span></div>
          )}
        </div>

        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
          {topHomestay.homestay?.images?.[0]?.url ? (
            <img src={topHomestay.homestay.images[0].url} alt={topHomestay.homestay.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Star className="h-16 w-16 text-yellow-500" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{topHomestay.homestay?.name || 'Unnamed'}</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              {topHomestay.strategy === 'MANUAL' ? 'Manual' : 'Insight Based'}
            </span>
            {topHomestay.category && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                {getCategoryBadge(topHomestay.category)}
              </span>
            )}
            {topHomestay.priority && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                Priority: {topHomestay.priority}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ActionButton onClick={() => onEdit(topHomestay)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>Edit</ActionButton>
            <ActionButton onClick={() => onDelete(topHomestay.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>Remove</ActionButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {topHomestay.homestay?.images?.[0]?.url ? (
            <img src={topHomestay.homestay.images[0].url} alt={topHomestay.homestay.name} className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              <Star className="h-10 w-10 text-yellow-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{topHomestay.homestay?.name || 'Unnamed'}</h3>
                <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {!topHomestay.isActive && <span className="px-2 py-0.5 bg-gray-500 rounded-full text-xs font-bold text-white">Inactive</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                  {topHomestay.strategy === 'MANUAL' ? 'Manual' : 'Insight Based'}
                </span>
                {topHomestay.category && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                    {getCategoryBadge(topHomestay.category)}
                  </span>
                )}
                {topHomestay.priority && <span>Priority: {topHomestay.priority}</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <ActionButton onClick={() => onEdit(topHomestay)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>Edit</ActionButton>
              <ActionButton onClick={() => onDelete(topHomestay.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>Remove</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TopHomestayFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  topHomestay: any | null;
  onSubmit: (data: TopHomestayFormData) => Promise<void>;
}> = ({ isOpen, onClose, topHomestay, onSubmit }) => {
  const [formData, setFormData] = useState<TopHomestayFormData>({
    homestayId: 0,
    strategy: 'MANUAL',
    category: '',
    priority: undefined,
    isActive: true
  });
  const { loading, error, execute, clearError } = useAsyncOperation();
  const { homestays, loadHomestays } = useHomestays();

  useEffect(() => {
    loadHomestays({ status: 'APPROVED', limit: 100 });
  }, []);

  useEffect(() => {
    if (topHomestay) {
      setFormData({
        homestayId: topHomestay.homestayId,
        strategy: topHomestay.strategy,
        category: topHomestay.category || '',
        priority: topHomestay.priority || undefined,
        isActive: topHomestay.isActive
      });
    } else {
      setFormData({ homestayId: 0, strategy: 'MANUAL', category: '', priority: undefined, isActive: true });
    }
    clearError();
  }, [topHomestay, clearError]);

  const handleSubmit = async () => {
    if (!formData.homestayId) return;
    try {
      const submitData = {
        ...formData,
        category: formData.category || undefined,
        priority: formData.priority || undefined
      };
      await execute(() => onSubmit(submitData));
      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={topHomestay ? 'Edit Top Homestay' : 'Add Top Homestay'}
      footer={<><ActionButton onClick={onClose} variant="secondary" disabled={loading}>Cancel</ActionButton>
      <ActionButton onClick={handleSubmit} variant="primary" loading={loading}>{topHomestay ? 'Update' : 'Add'}</ActionButton></>}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Homestay *</label>
          <select value={formData.homestayId} onChange={(e) => setFormData({ ...formData, homestayId: parseInt(e.target.value) })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required disabled={!!topHomestay}>
            <option value="0">Select homestay...</option>
            {homestays.map((h: any) => (<option key={h.id} value={h.id}>{h.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strategy *</label>
          <select value={formData.strategy} onChange={(e) => setFormData({ ...formData, strategy: e.target.value as 'MANUAL' | 'INSIGHT_BASED' })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="MANUAL">Manual Selection</option>
            <option value="INSIGHT_BASED">Insight Based</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category (optional)</label>
          <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Select category...</option>
            {CATEGORIES.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
          </select>
        </div>

        <Input label="Priority (optional)" type="number" value={formData.priority || ''} onChange={(e) => setFormData({ ...formData, priority: e.target.value ? parseInt(e.target.value) : undefined })}
          placeholder="1" min="1" />

        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-[#224240] border-gray-300 rounded" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
        </label>

        {error && <Alert type="error" title="Error" message={error} onClose={clearError} />}
      </div>
    </Modal>
  );
};

export default function TopHomestaysManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const { topHomestays, totalPages, total, loading, error, loadTopHomestays, createTopHomestay, updateTopHomestay, deleteTopHomestay, clearError } = useTopHomestays();

  const [currentPage, setCurrentPage] = useState(1);
  const [strategyFilter, setStrategyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedLoadData = useMemo(() => debounce((params: any) => {
    loadTopHomestays(params).catch(error => { addToast({ type: 'error', title: 'Error', message: 'Failed to load' }); });
  }, 500), [loadTopHomestays, addToast]);

  const loadData = useCallback(async () => {
    const params: any = { page: currentPage, limit: 10 };
    if (strategyFilter) params.strategy = strategyFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (activeFilter !== undefined) params.isActive = activeFilter;
    debouncedLoadData(params);
  }, [currentPage, strategyFilter, categoryFilter, activeFilter, debouncedLoadData]);

  useEffect(() => () => debouncedLoadData.cancel(), [debouncedLoadData]);
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') { router.push('/'); return; }
    if (status === 'authenticated') loadData();
  }, [status, session?.user?.role, router, loadData]);

  const handleClearFilters = useCallback(() => {
    setStrategyFilter('');
    setCategoryFilter('');
    setActiveFilter(undefined);
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Remove from top homestays?')) return;
    try {
      await deleteTopHomestay(id);
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Removed' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed' });
    }
  };

  const handleFormSubmit = async (data: TopHomestayFormData) => {
    try {
      if (editingItem) {
        await updateTopHomestay(editingItem.id, data);
        addToast({ type: 'success', title: 'Success', message: 'Updated' });
      } else {
        await createTopHomestay(data);
        addToast({ type: 'success', title: 'Success', message: 'Added' });
      }
      await loadData();
      setShowFormModal(false);
      setEditingItem(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Homestay', 'Strategy', 'Category', 'Priority', 'Active'].join(','),
      ...topHomestays.map((t: any) => [t.id, `"${t.homestay?.name || ''}"`, t.strategy, t.category || '', t.priority || '', t.isActive ? 'Yes' : 'No'].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-homestays-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Success', message: 'Exported' });
  };

  const stats = useMemo(() => {
    const manualCount = topHomestays.filter(t => t.strategy === 'MANUAL').length;
    const activeCount = topHomestays.filter(t => t.isActive).length;
    return { total, manual: manualCount, active: activeCount };
  }, [topHomestays, total]);

  if (status === 'loading') return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>);
  if (session?.user?.role !== 'ADMIN') return null;

  const hasFilters = strategyFilter || categoryFilter || activeFilter !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#224240] via-[#2a5350] to-[#336663] dark:from-[#1a332f] dark:via-[#224240] dark:to-[#2a5350] shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg"><Star className="h-8 w-8 text-white" /></div>
              <div><h1 className="text-3xl font-bold text-white mb-1">Top Homestays</h1>
              <p className="text-white/80 text-sm">Manage featured homestays and rankings</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <ActionButton onClick={handleExport} variant="secondary" icon={<FileDown className="h-4 w-4" />} disabled={topHomestays.length === 0}>Export</ActionButton>
              <ActionButton onClick={() => { setEditingItem(null); setShowFormModal(true); }} variant="primary" icon={<Plus className="h-4 w-4" />}>Add Top Homestay</ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (<div className="mb-6"><Alert type="error" title="Error" message={error} onClose={clearError} /></div>)}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Top Homestays" value={stats.total} color="teal" icon={<Star className="h-6 w-6" />} subtitle="Featured listings" />
          <StatCard title="Manual Selection" value={stats.manual} color="purple" icon={<Award className="h-6 w-6" />} onClick={() => { setStrategyFilter('MANUAL'); setCurrentPage(1); }} subtitle="Curated picks" />
          <StatCard title="Active" value={stats.active} color="green" icon={<TrendingUp className="h-6 w-6" />} onClick={() => { setActiveFilter(true); setCurrentPage(1); }} subtitle="Currently shown" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${showFilters ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                <SlidersHorizontal className="h-4 w-4" /><span>Filters</span>
                {hasFilters && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
                <Grid className="h-5 w-5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
                <List className="h-5 w-5" /></button>
              <button onClick={() => loadData()} disabled={loading} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 transition-colors">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <select value={strategyFilter} onChange={(e) => { setStrategyFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">All Strategies</option><option value="MANUAL">Manual</option><option value="INSIGHT_BASED">Insight Based</option>
                  </select>
                  <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                  </select>
                  <select value={activeFilter === undefined ? '' : activeFilter.toString()} onChange={(e) => { setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true'); setCurrentPage(1); }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">All Status</option><option value="true">Active Only</option><option value="false">Inactive Only</option>
                  </select>
                </div>
                {hasFilters && (
                  <div className="mt-4"><ActionButton onClick={handleClearFilters} variant="secondary" size="sm" icon={<X className="h-4 w-4" />}>Clear All</ActionButton></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading && topHomestays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <LoadingSpinner size="lg" text="Loading..." /></div>
        ) : topHomestays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <EmptyState icon={<Star className="h-16 w-16" />} title="No top homestays" description={hasFilters ? "No results" : "Add your first top homestay"}
              action={{ label: hasFilters ? 'Clear' : 'Add', onClick: hasFilters ? handleClearFilters : () => setShowFormModal(true), icon: <Plus className="h-4 w-4" />, variant: 'primary' }} /></div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <AnimatePresence mode="popLayout">
              {topHomestays.map((t: any) => (<TopHomestayCard key={t.id} topHomestay={t} onEdit={(item) => { setEditingItem(item); setShowFormModal(true); }} onDelete={handleDelete} viewMode={viewMode} />))}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Page {currentPage} of {totalPages}</div>
            <div className="flex items-center space-x-2">
              <ActionButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" size="sm">Previous</ActionButton>
              <ActionButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary" size="sm">Next</ActionButton>
            </div>
          </div>
        )}
      </div>

      <TopHomestayFormModal isOpen={showFormModal || editingItem !== null} onClose={() => { setShowFormModal(false); setEditingItem(null); }} topHomestay={editingItem} onSubmit={handleFormSubmit} />

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (<Alert key={t.id} type={t.type} title={t.title} message={t.message} className="min-w-80 shadow-lg" />))}
      </div>
    </div>
  );
}
