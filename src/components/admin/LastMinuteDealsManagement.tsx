// components/admin/LastMinuteDealsManagement.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Zap, Plus, Edit, Trash2, X, Grid, List, RefreshCw,
  SlidersHorizontal, FileDown, Calendar, Percent, DollarSign,
  Clock, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import {
  useLastMinuteDeals, useAsyncOperation, useHomestays
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, Alert, ActionButton, Modal, EmptyState, Input, useToast
} from '@/components/admin/AdminComponents';

type ViewMode = 'grid' | 'list';

interface DealFormData {
  homestayId: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FLAT';
  startDate: string;
  endDate: string;
  isActive: boolean;
  description?: string;
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'teal' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}> = ({ title, value, subtitle, color, icon, loading, onClick }) => {
  const colorClasses = {
    teal: 'from-[#224240]/10 via-[#2a5350]/5 to-transparent',
    green: 'from-green-500/10 via-green-400/5 to-transparent',
    yellow: 'from-yellow-500/10 via-yellow-400/5 to-transparent',
    red: 'from-red-500/10 via-red-400/5 to-transparent'
  };

  const borderColorClasses = {
    teal: 'border-[#224240]/20 hover:border-[#224240]/40',
    green: 'border-green-200 hover:border-green-300',
    yellow: 'border-yellow-200 hover:border-yellow-300',
    red: 'border-red-200 hover:border-red-300'
  };

  const textColorClasses = {
    teal: 'text-[#224240] dark:text-[#2a5350]',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400'
  };

  const iconBgClasses = {
    teal: 'bg-gradient-to-br from-[#224240] to-[#2a5350]',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    red: 'bg-gradient-to-br from-red-500 to-red-600'
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border ${borderColorClasses[color]} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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

const DealCard: React.FC<{
  deal: any;
  onEdit: (deal: any) => void;
  onDelete: (id: number) => void;
  viewMode: ViewMode;
}> = ({ deal, onEdit, onDelete, viewMode }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isActive = deal.isActive && new Date(deal.endDate) > new Date();
  const isExpired = new Date(deal.endDate) < new Date();

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
          {isActive && !isExpired && (
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <span className="text-xs font-bold text-white">Active</span>
            </div>
          )}
          {isExpired && (
            <div className="px-3 py-1 bg-gray-500 rounded-full">
              <span className="text-xs font-bold text-white">Expired</span>
            </div>
          )}
          {!deal.isActive && (
            <div className="px-3 py-1 bg-red-500 rounded-full">
              <span className="text-xs font-bold text-white">Inactive</span>
            </div>
          )}
        </div>

        <div className="relative h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 overflow-hidden">
          {deal.homestay?.images?.[0]?.url ? (
            <img
              src={deal.homestay.images[0].url}
              alt={deal.homestay.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="h-16 w-16 text-yellow-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-2">
                <div className={`px-4 py-2 rounded-xl ${deal.discountType === 'PERCENTAGE' ? 'bg-yellow-500' : 'bg-orange-500'} shadow-lg`}>
                  <div className="flex items-center space-x-2">
                    {deal.discountType === 'PERCENTAGE' ? <Percent className="h-5 w-5 text-white" /> : <DollarSign className="h-5 w-5 text-white" />}
                    <span className="text-2xl font-bold text-white">{deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''}</span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {deal.homestay?.name || 'Unnamed Homestay'}
          </h3>
          {deal.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{deal.description}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4 space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(deal.startDate)}</span>
            </div>
            <span>-</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(deal.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ActionButton onClick={() => onEdit(deal)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
              Edit
            </ActionButton>
            <ActionButton onClick={() => onDelete(deal.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </ActionButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {deal.homestay?.images?.[0]?.url ? (
            <img src={deal.homestay.images[0].url} alt={deal.homestay.name} className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl flex items-center justify-center">
              <Zap className="h-10 w-10 text-yellow-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{deal.homestay?.name || 'Unnamed'}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${isActive && !isExpired ? 'bg-green-500' : isExpired ? 'bg-gray-500' : 'bg-red-500'}`}>
                  {isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                </div>
              </div>
              {deal.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{deal.description}</p>}
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  {deal.discountType === 'PERCENTAGE' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  <span className="font-bold">{deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''} OFF</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(deal.startDate)} - {formatDate(deal.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <ActionButton onClick={() => onEdit(deal)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>Edit</ActionButton>
              <ActionButton onClick={() => onDelete(deal.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>Delete</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DealFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  deal: any | null;
  onSubmit: (data: DealFormData) => Promise<void>;
}> = ({ isOpen, onClose, deal, onSubmit }) => {
  const [formData, setFormData] = useState<DealFormData>({
    homestayId: 0,
    discount: 0,
    discountType: 'PERCENTAGE',
    startDate: '',
    endDate: '',
    isActive: true,
    description: ''
  });
  const { loading, error, execute, clearError } = useAsyncOperation();
  const { homestays, loadHomestays } = useHomestays();

  useEffect(() => {
    loadHomestays({ status: 'APPROVED', limit: 100 });
  }, [loadHomestays]);

  useEffect(() => {
    if (deal) {
      setFormData({
        homestayId: deal.homestayId,
        discount: deal.discount,
        discountType: deal.discountType,
        startDate: new Date(deal.startDate).toISOString().split('T')[0],
        endDate: new Date(deal.endDate).toISOString().split('T')[0],
        isActive: deal.isActive,
        description: deal.description || ''
      });
    } else {
      setFormData({
        homestayId: 0,
        discount: 0,
        discountType: 'PERCENTAGE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        description: ''
      });
    }
    clearError();
  }, [deal, clearError]);

  const handleSubmit = async () => {
    if (!formData.homestayId || !formData.discount || !formData.startDate || !formData.endDate) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      await execute(() => onSubmit(submitData));
      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={deal ? 'Edit Deal' : 'Create Last Minute Deal'}
      footer={<><ActionButton onClick={onClose} variant="secondary" disabled={loading}>Cancel</ActionButton>
      <ActionButton onClick={handleSubmit} variant="primary" loading={loading}>{deal ? 'Update' : 'Create'}</ActionButton></>}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Homestay *</label>
          <select value={formData.homestayId} onChange={(e) => setFormData({ ...formData, homestayId: parseInt(e.target.value) })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required disabled={!!deal}>
            <option value="0">Select homestay...</option>
            {homestays.map((h: any) => (<option key={h.id} value={h.id}>{h.name}</option>))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Discount Amount *" type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value ? parseFloat(e.target.value) : 0 })}
            placeholder="20" min="0" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
            <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date *" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="End Date *" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Limited time offer..." rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>

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

export default function LastMinuteDealsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const { deals, totalPages, total, loading, error, loadDeals, createDeal, updateDeal, deleteDeal, clearError } = useLastMinuteDeals();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedLoadData = useMemo(() => debounce((params: any) => {
    loadDeals(params).catch(error => { addToast({ type: 'error', title: 'Error', message: 'Failed to load deals' }); });
  }, 500), [loadDeals, addToast]);

  const loadData = useCallback(async () => {
    const params: any = { page: currentPage, limit: 10 };
    if (activeFilter !== undefined) params.isActive = activeFilter;
    debouncedLoadData(params);
  }, [currentPage, activeFilter, debouncedLoadData]);

  useEffect(() => () => debouncedLoadData.cancel(), [debouncedLoadData]);
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') { router.push('/'); return; }
    if (status === 'authenticated') loadData();
  }, [status, session?.user?.role, router, loadData]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await deleteDeal(id);
      await loadData();
      addToast({ type: 'success', title: 'Success', message: 'Deal deleted' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
    }
  };

  const handleFormSubmit = async (data: DealFormData) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, data);
        addToast({ type: 'success', title: 'Success', message: 'Deal updated' });
      } else {
        await createDeal(data);
        addToast({ type: 'success', title: 'Success', message: 'Deal created' });
      }
      await loadData();
      setShowFormModal(false);
      setEditingDeal(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save deal');
    }
  };


  const handleExport = () => {
    const csvContent = [
      ['ID', 'Homestay', 'Discount', 'Type', 'Start Date', 'End Date', 'Active'].join(','),
      ...deals.map((d: any) => [d.id, `"${d.homestay?.name || ''}"`, d.discount, d.discountType,
        new Date(d.startDate).toISOString().split('T')[0], new Date(d.endDate).toISOString().split('T')[0], d.isActive ? 'Yes' : 'No'].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Success', message: 'Exported' });
  };

  const stats = useMemo(() => {
    const activeCount = deals.filter(d => d.isActive && new Date(d.endDate) > new Date()).length;
    const expiredCount = deals.filter(d => new Date(d.endDate) < new Date()).length;
    return { total, active: activeCount, expired: expiredCount };
  }, [deals, total]);

  if (status === 'loading') return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>);
  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#224240] via-[#2a5350] to-[#336663] dark:from-[#1a332f] dark:via-[#224240] dark:to-[#2a5350] shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg"><Zap className="h-8 w-8 text-white" /></div>
              <div><h1 className="text-3xl font-bold text-white mb-1">Last Minute Deals</h1>
              <p className="text-white/80 text-sm">Manage special offers and discounts</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <ActionButton onClick={handleExport} variant="secondary" icon={<FileDown className="h-4 w-4" />} disabled={deals.length === 0}>Export</ActionButton>
              <ActionButton onClick={() => { setEditingDeal(null); setShowFormModal(true); }} variant="primary" icon={<Plus className="h-4 w-4" />}>Create Deal</ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (<div className="mb-6"><Alert type="error" title="Error" message={error} onClose={clearError} /></div>)}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Deals" value={stats.total} color="teal" icon={<Zap className="h-6 w-6" />} subtitle="All deals" />
          <StatCard title="Active Deals" value={stats.active} color="green" icon={<Tag className="h-6 w-6" />} onClick={() => { setActiveFilter(true); setCurrentPage(1); }} subtitle="Currently running" />
          <StatCard title="Expired Deals" value={stats.expired} color="red" icon={<Clock className="h-6 w-6" />} subtitle="Past deals" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${showFilters ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                <SlidersHorizontal className="h-4 w-4" /><span>Filters</span>
                {activeFilter !== undefined && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>}
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
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <select value={activeFilter === undefined ? '' : activeFilter.toString()}
                    onChange={(e) => { setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true'); setCurrentPage(1); }}
                    className="w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">All Deals</option><option value="true">Active Only</option><option value="false">Inactive Only</option>
                  </select>
                  {activeFilter !== undefined && (
                    <div className="mt-4"><ActionButton onClick={() => setActiveFilter(undefined)} variant="secondary" size="sm" icon={<X className="h-4 w-4" />}>Clear</ActionButton></div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading && deals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <LoadingSpinner size="lg" text="Loading deals..." /></div>
        ) : deals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <EmptyState icon={<Zap className="h-16 w-16" />} title="No deals found" description="Create your first last minute deal"
              action={{ label: 'Create Deal', onClick: () => setShowFormModal(true), icon: <Plus className="h-4 w-4" />, variant: 'primary' }} /></div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <AnimatePresence mode="popLayout">
              {deals.map((d: any) => (<DealCard key={d.id} deal={d} onEdit={setEditingDeal} onDelete={handleDelete} viewMode={viewMode} />))}
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

      <DealFormModal isOpen={showFormModal || editingDeal !== null} onClose={() => { setShowFormModal(false); setEditingDeal(null); }} deal={editingDeal} onSubmit={handleFormSubmit} />

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (<Alert key={t.id} type={t.type} title={t.title} message={t.message} className="min-w-80 shadow-lg" />))}
      </div>
    </div>
  );
}
