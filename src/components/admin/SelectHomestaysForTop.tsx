// components/admin/SelectHomestaysForTop.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, Home, Star, Crown, Target, Tag, CheckCircle, Award,
  Grid, List, ChevronLeft, ChevronRight, Users, MapPin, User
} from 'lucide-react';
import {
  useHomestays, useTopHomestays
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, ActionButton, useToast, Alert
} from '@/components/admin/AdminComponents';

type ViewMode = 'grid' | 'table';

const CATEGORIES = [
  { value: 'editor_choice', label: "Editor's Choice" },
  { value: 'most_booked', label: 'Most Booked' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'best_value', label: 'Best Value' },
  { value: 'trending', label: 'Trending' }
];

export default function SelectHomestaysForTop() {
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const { homestays, loading: homestaysLoading, total, totalPages, loadHomestays } = useHomestays();
  const { createTopHomestay } = useTopHomestays();

  const [topTemplate, setTopTemplate] = useState<any>(null);
  const [selectedHomestays, setSelectedHomestays] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('APPROVED');
  const [addressFilter, setAddressFilter] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    // Load top homestay template from localStorage
    const stored = localStorage.getItem('top_template');
    if (stored) {
      setTopTemplate(JSON.parse(stored));
    } else {
      addToast({ type: 'error', title: 'Error', message: 'No configuration found' });
      router.push('/admin/top-homestays');
    }
  }, []);

  useEffect(() => {
    // Load homestays with filters
    const params: any = {
      page: currentPage,
      limit: 20,
    };

    if (searchQuery) params.name = searchQuery;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (addressFilter) params.address = addressFilter;

    loadHomestays(params);
  }, [currentPage, searchQuery, statusFilter, addressFilter]);

  const toggleHomestaySelection = (homestayId: number) => {
    setSelectedHomestays(prev =>
      prev.includes(homestayId)
        ? prev.filter(id => id !== homestayId)
        : [...prev, homestayId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedHomestays.length === homestays.length) {
      setSelectedHomestays([]);
    } else {
      setSelectedHomestays(homestays.map(h => h.id));
    }
  };

  const handleCreateTopHomestays = async () => {
    if (selectedHomestays.length === 0) {
      addToast({ type: 'error', title: 'Error', message: 'Please select at least one homestay' });
      return;
    }

    setIsCreating(true);

    try {
      // Create a top homestay record for each selected homestay
      for (const homestayId of selectedHomestays) {
        await createTopHomestay({
          ...topTemplate,
          homestayId
        });
      }

      // Clear template from localStorage
      localStorage.removeItem('top_template');

      addToast({
        type: 'success',
        title: 'Success',
        message: `Featured ${selectedHomestays.length} homestay${selectedHomestays.length !== 1 ? 's' : ''} successfully`
      });

      // Redirect back to top homestays list
      router.push('/admin/top-homestays');
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create featured homestays' });
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getHomestayImage = (homestay: any) => {
    return homestay.images?.find((img: any) => img.isMain)?.url || homestay.images?.[0]?.url;
  };

  const getLowestRoomPrice = (homestay: any) => {
    if (!homestay.rooms || homestay.rooms.length === 0) return null;
    const prices = homestay.rooms.map((r: any) => r.price).filter((p: number) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  if (!topTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={() => {
                  if (confirm('Discard configuration and go back?')) {
                    localStorage.removeItem('top_template');
                    router.push('/admin/top-homestays');
                  }
                }}
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <span>Select Homestays to Feature</span>
                </h1>
                <p className="text-sm text-gray-600">
                  Step 2: Choose which homestays to add to top/featured section
                </p>
              </div>
            </div>

            <ActionButton
              onClick={handleCreateTopHomestays}
              variant="primary"
              disabled={selectedHomestays.length === 0 || isCreating}
              loading={isCreating}
              icon={<CheckCircle className="h-4 w-4" />}
            >
              Feature {selectedHomestays.length} Homestay{selectedHomestays.length !== 1 ? 's' : ''}
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Summary */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Featured Configuration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Strategy</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center mt-1">
                    <Target className="h-4 w-4 mr-1" />
                    {topTemplate.strategy === 'MANUAL' ? 'Manual Selection' : 'Insight Based'}
                  </p>
                </div>
                {topTemplate.category && (
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-sm font-bold text-purple-600 flex items-center mt-1">
                      <Tag className="h-4 w-4 mr-1" />
                      {getCategoryLabel(topTemplate.category)}
                    </p>
                  </div>
                )}
                {topTemplate.priority && (
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="text-sm font-bold text-[#1A403D] flex items-center mt-1">
                      <Award className="h-4 w-4 mr-1" />
                      {topTemplate.priority}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {topTemplate.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D]"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <input
              type="text"
              value={addressFilter}
              onChange={(e) => { setAddressFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by address..."
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D]"
            />

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#224240] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#224240] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <strong>{selectedHomestays.length}</strong> selected • <strong>{total}</strong> total
            </p>
            <div className="flex items-center space-x-3">
              {selectedHomestays.length > 0 && (
                <button
                  onClick={() => setSelectedHomestays([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear selection
                </button>
              )}
              {homestays.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-[#224240] hover:underline font-medium"
                >
                  {selectedHomestays.length === homestays.length ? 'Deselect All' : 'Select All on Page'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Homestays Display */}
        {homestaysLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : homestays.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No homestays found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestays.map((homestay: any) => {
              const image = getHomestayImage(homestay);
              const lowestPrice = getLowestRoomPrice(homestay);
              const isSelected = selectedHomestays.includes(homestay.id);

              return (
                <div
                  key={homestay.id}
                  onClick={() => toggleHomestaySelection(homestay.id)}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all hover:shadow-lg overflow-hidden ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex items-center space-x-1">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  )}

                  {image ? (
                    <img
                      src={image}
                      alt={homestay.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Home className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">
                      {homestay.name}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {homestay.address || 'No address'}
                    </p>

                    {homestay.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {homestay.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        homestay.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {homestay.status}
                      </span>
                      {lowestPrice && (
                        <span className="text-sm font-bold text-[#224240]">
                          NPR {lowestPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {homestay.facilities && homestay.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {homestay.facilities.slice(0, 3).map((f: any, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {f.facility?.name || f.name}
                          </span>
                        ))}
                        {homestay.facilities.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            +{homestay.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {homestay.rooms?.length || 0} room{homestay.rooms?.length !== 1 ? 's' : ''}
                      </span>
                      {homestay.rating && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {homestay.rating} ({homestay.reviews || 0})
                        </span>
                      )}
                    </div>

                    {homestay.owner && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {homestay.owner.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedHomestays.length === homestays.length && homestays.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-yellow-500 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homestay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {homestays.map((homestay: any) => {
                    const image = getHomestayImage(homestay);
                    const lowestPrice = getLowestRoomPrice(homestay);
                    const isSelected = selectedHomestays.includes(homestay.id);

                    return (
                      <tr
                        key={homestay.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-yellow-50' : ''
                        }`}
                        onClick={() => toggleHomestaySelection(homestay.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleHomestaySelection(homestay.id);
                            }}
                            className="w-4 h-4 text-yellow-500 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {image ? (
                              <img src={image} alt={homestay.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Home className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{homestay.name}</p>
                              {homestay.rating && (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                  {homestay.rating} ({homestay.reviews || 0} reviews)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {homestay.address || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {homestay.owner?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            homestay.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {homestay.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {homestay.rooms?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#224240]">
                          {lowestPrice ? `NPR ${lowestPrice.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {homestay.facilities?.slice(0, 2).map((f: any, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {f.facility?.name || f.name}
                              </span>
                            ))}
                            {homestay.facilities && homestay.facilities.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{homestay.facilities.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <ActionButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </ActionButton>
              <ActionButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
                icon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
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
