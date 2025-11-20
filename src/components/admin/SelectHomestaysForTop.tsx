// components/admin/SelectHomestaysForTop.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, Home, Star, Crown, Target, Tag, CheckCircle, Award
} from 'lucide-react';
import {
  useHomestays, useTopHomestays
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, ActionButton, useToast, Alert
} from '@/components/admin/AdminComponents';

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
  const { homestays, loading: homestaysLoading, loadHomestays } = useHomestays();
  const { createTopHomestay } = useTopHomestays();

  const [topTemplate, setTopTemplate] = useState<any>(null);
  const [selectedHomestays, setSelectedHomestays] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('APPROVED');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load top homestay template from localStorage
    const stored = localStorage.getItem('top_template');
    if (stored) {
      setTopTemplate(JSON.parse(stored));
    } else {
      addToast({ type: 'error', title: 'Error', message: 'No configuration found' });
      router.push('/admin/top-homestays');
    }

    // Load homestays
    loadHomestays({ page: 1, limit: 1000 });
  }, []);

  const filteredHomestays = useMemo(() => {
    return homestays.filter(h => {
      if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !h.location?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && h.status !== statusFilter) {
        return false;
      }
      if (locationFilter && !h.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [homestays, searchQuery, statusFilter, locationFilter]);

  const uniqueLocations = useMemo(() => {
    const locations = homestays
      .map(h => h.location)
      .filter((loc): loc is string => !!loc);
    return Array.from(new Set(locations));
  }, [homestays]);

  const toggleHomestaySelection = (homestayId: number) => {
    setSelectedHomestays(prev =>
      prev.includes(homestayId)
        ? prev.filter(id => id !== homestayId)
        : [...prev, homestayId]
    );
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

  if (!topTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <span>Select Homestays to Feature</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Featured Configuration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Strategy</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center mt-1">
                    <Target className="h-4 w-4 mr-1" />
                    {topTemplate.strategy === 'MANUAL' ? 'Manual Selection' : 'Insight Based'}
                  </p>
                </div>
                {topTemplate.category && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center mt-1">
                      <Tag className="h-4 w-4 mr-1" />
                      {getCategoryLabel(topTemplate.category)}
                    </p>
                  </div>
                )}
                {topTemplate.priority && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      <Award className="h-4 w-4 mr-1" />
                      {topTemplate.priority}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                    {topTemplate.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homestays by name or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{selectedHomestays.length}</strong> selected • <strong>{filteredHomestays.length}</strong> available
            </p>
            {selectedHomestays.length > 0 && (
              <button
                onClick={() => setSelectedHomestays([])}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Homestays Grid */}
        {homestaysLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredHomestays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No homestays found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHomestays.map((homestay: any) => (
              <div
                key={homestay.id}
                onClick={() => toggleHomestaySelection(homestay.id)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all hover:shadow-lg ${
                  selectedHomestays.includes(homestay.id)
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {selectedHomestays.includes(homestay.id) && (
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

                {homestay.mainImage ? (
                  <img
                    src={homestay.mainImage}
                    alt={homestay.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl flex items-center justify-center">
                    <Home className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {homestay.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                    {homestay.location || 'No location'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      homestay.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {homestay.status}
                    </span>
                    {homestay.price && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ${homestay.price}/night
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
