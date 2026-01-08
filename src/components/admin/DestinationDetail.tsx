// components/admin/DestinationDetail.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MapPin, ArrowLeft, Edit, Trash2, Save, X, Plus, Search, Filter,
  Home, Star, TrendingUp, Calendar, Users, DollarSign, Activity,
  Image as ImageIcon, Upload, ExternalLink, MapPinned, Building,
  Tag, SlidersHorizontal, Grid, List, Link as LinkIcon, Unlink,
  CheckSquare, Square, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import Image from 'next/image';
import {
  useDestinations
} from '@/hooks/useAdminApi';
import {
  LoadingSpinner, Alert, ActionButton, Input, useToast
} from '@/components/admin/AdminComponents';

interface DestinationDetailProps {
  destinationId: number;
}

interface SearchedHomestay {
  id: number;
  name: string;
  address: string;
  status: string;
  mainImage?: string;
  images?: { url: string; isMain: boolean }[];
  rooms?: { price: number; currency: string }[];
  facilities?: { facility?: { name: string }; name?: string }[];
  owner?: { name: string; email: string };
  rating?: number;
  _count?: { rooms: number };
}

export default function DestinationDetail({ destinationId }: DestinationDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toasts, addToast } = useToast();

  // Destination data
  const { destination, loadDestination, updateDestination, deleteDestination,
    addHomestayToDestination, removeHomestayFromDestination, loading: destinationLoading } = useDestinations();

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'homestays' | 'analytics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddHomestay, setShowAddHomestay] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isTopDestination: false,
    priority: undefined as number | undefined
  });

  // Location search state
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [searchedHomestays, setSearchedHomestays] = useState<SearchedHomestay[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [selectedHomestays, setSelectedHomestays] = useState<number[]>([]);
  const [isAddingHomestays, setIsAddingHomestays] = useState(false);

  // Bulk remove state
  const [selectedForRemoval, setSelectedForRemoval] = useState<number[]>([]);
  const [isRemovingHomestays, setIsRemovingHomestays] = useState(false);
  const [showRemoveSelection, setShowRemoveSelection] = useState(false);

  // Load destination data by ID
  useEffect(() => {
    loadDestination(destinationId);
  }, [destinationId, loadDestination]);

  // Update form when destination loads
  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        description: destination.description || '',
        imageUrl: destination.imageUrl || '',
        isTopDestination: destination.isTopDestination || false,
        priority: destination.priority
      });
      // Set initial location search to destination name
      if (!locationSearchQuery && destination.name) {
        setLocationSearchQuery(destination.name);
      }
    }
  }, [destination]);

  // Search homestays by location
  const searchHomestaysByLocation = useCallback(async (location: string, page: number = 1) => {
    if (!location.trim()) {
      setSearchedHomestays([]);
      setSearchTotal(0);
      setSearchTotalPages(1);
      return;
    }

    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        location: location.trim(),
        page: page.toString(),
        limit: pageLimit.toString(),
      });

      const response = await fetch(`/api/homestays/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search homestays');
      }

      const data = await response.json();
      setSearchedHomestays(data.data || []);
      setSearchTotal(data.total || 0);
      setSearchTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error searching homestays:', error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to search homestays' });
    } finally {
      setSearchLoading(false);
    }
  }, [pageLimit, addToast]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setCurrentPage(1);
      searchHomestaysByLocation(value, 1);
    }, 500),
    [searchHomestaysByLocation]
  );

  // Trigger search when location changes
  useEffect(() => {
    if (showAddHomestay && locationSearchQuery) {
      debouncedSearch(locationSearchQuery);
    }
    return () => debouncedSearch.cancel();
  }, [locationSearchQuery, showAddHomestay, debouncedSearch]);

  // Filter out already associated homestays
  const availableHomestays = useMemo(() => {
    // Handle nested structure: item.homestay.id or item.homestayId or item.id
    const associatedIds = new Set((destination?.homestays || []).map((item: any) =>
      item.homestay?.id || item.homestayId || item.id
    ));
    return searchedHomestays.filter(h => !associatedIds.has(h.id));
  }, [searchedHomestays, destination?.homestays]);

  const handleSave = async () => {
    try {
      await updateDestination(destinationId, formData);
      setIsEditing(false);
      addToast({ type: 'success', title: 'Success', message: 'Destination updated successfully' });
      loadDestination(destinationId);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update destination' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDestination(destinationId);
      addToast({ type: 'success', title: 'Success', message: 'Destination deleted successfully' });
      router.push('/admin/destinations');
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete destination' });
    }
  };

  const handleAddHomestays = async () => {
    if (selectedHomestays.length === 0) return;

    setIsAddingHomestays(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const homestayId of selectedHomestays) {
        try {
          await addHomestayToDestination(homestayId, destinationId);
          successCount++;
        } catch (error) {
          console.error(`Failed to add homestay ${homestayId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Added ${successCount} homestay(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        });
      }
      if (errorCount > 0 && successCount === 0) {
        addToast({ type: 'error', title: 'Error', message: 'Failed to add homestays' });
      }

      setSelectedHomestays([]);
      setShowAddHomestay(false);
      loadDestination(destinationId);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add homestays' });
    } finally {
      setIsAddingHomestays(false);
    }
  };

  const handleRemoveHomestay = async (homestayId: number) => {
    if (!confirm('Remove this homestay from the destination?')) return;

    try {
      await removeHomestayFromDestination(homestayId, destinationId);
      addToast({ type: 'success', title: 'Success', message: 'Homestay removed successfully' });
      loadDestination(destinationId);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to remove homestay' });
    }
  };

  const toggleHomestaySelection = (homestayId: number) => {
    setSelectedHomestays(prev =>
      prev.includes(homestayId)
        ? prev.filter(id => id !== homestayId)
        : [...prev, homestayId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHomestays.length === availableHomestays.length) {
      setSelectedHomestays([]);
    } else {
      setSelectedHomestays(availableHomestays.map(h => h.id));
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchHomestaysByLocation(locationSearchQuery, newPage);
  };

  // Helper function to get homestay image from various possible sources
  const getHomestayImage = (homestay: any): string | null => {
    // Handle nested structure (homestay.homestay.images)
    const actualHomestay = homestay.homestay || homestay;

    // Check mainImage first
    if (actualHomestay.mainImage) return actualHomestay.mainImage;
    // Check images array for main image
    if (actualHomestay.images?.length > 0) {
      const mainImg = actualHomestay.images.find((img: any) => img.isMain);
      if (mainImg?.url) return mainImg.url;
      if (actualHomestay.images[0]?.url) return actualHomestay.images[0].url;
    }
    // Check image field
    if (actualHomestay.image) return actualHomestay.image;
    return null;
  };

  // Helper function to get actual homestay data from nested structure
  const getHomestayData = (item: any) => {
    // API returns { homestayId, destinationId, homestay: { id, name, ... } }
    if (item.homestay) {
      return {
        id: item.homestay.id || item.homestayId,
        name: item.homestay.name,
        address: item.homestay.address,
        rating: item.homestay.rating,
        images: item.homestay.images,
        location: item.homestay.location
      };
    }
    // Direct structure
    return item;
  };

  // Bulk remove handlers
  const toggleRemovalSelection = (homestayId: number) => {
    setSelectedForRemoval(prev =>
      prev.includes(homestayId)
        ? prev.filter(id => id !== homestayId)
        : [...prev, homestayId]
    );
  };

  const handleSelectAllForRemoval = () => {
    // Handle nested structure: item.homestay.id or item.homestayId or item.id
    const allHomestayIds = (destination?.homestays || []).map((item: any) =>
      item.homestay?.id || item.homestayId || item.id
    );
    if (selectedForRemoval.length === allHomestayIds.length) {
      setSelectedForRemoval([]);
    } else {
      setSelectedForRemoval(allHomestayIds);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedForRemoval.length === 0) return;

    if (!confirm(`Are you sure you want to remove ${selectedForRemoval.length} homestay(s) from this destination?`)) {
      return;
    }

    setIsRemovingHomestays(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const homestayId of selectedForRemoval) {
        try {
          await removeHomestayFromDestination(homestayId, destinationId);
          successCount++;
        } catch (error) {
          console.error(`Failed to remove homestay ${homestayId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Removed ${successCount} homestay(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        });
      }
      if (errorCount > 0 && successCount === 0) {
        addToast({ type: 'error', title: 'Error', message: 'Failed to remove homestays' });
      }

      setSelectedForRemoval([]);
      setShowRemoveSelection(false);
      loadDestination(destinationId);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to remove homestays' });
    } finally {
      setIsRemovingHomestays(false);
    }
  };

  if (destinationLoading && !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading destination..." />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Destination not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The destination you're looking for doesn't exist.</p>
          <ActionButton
            onClick={() => router.push('/admin/destinations')}
            variant="primary"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Destinations
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={() => router.push('/admin/destinations')}
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>{destination.name}</span>
                  {destination.isTopDestination && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Top</span>
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">ID: #{destination.id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <ActionButton
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    icon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    onClick={handleSave}
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </ActionButton>
                </>
              ) : (
                <>
                  <ActionButton
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    icon={<Edit className="h-4 w-4" />}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    onClick={handleDelete}
                    variant="danger"
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image Section */}
        <div className="mb-8">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            {destination.imageUrl ? (
              <img
                src={destination.imageUrl}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#224240] via-[#2a5350] to-[#336663] flex items-center justify-center">
                <MapPin className="h-32 w-32 text-white/20" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="h-16 w-16 text-white mx-auto mb-4" />
                  <p className="text-white text-lg font-medium mb-2">Change Image</p>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Enter image URL"
                    className="bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Homestays</p>
                <p className="text-3xl font-bold text-[#224240] dark:text-[#2a5350]">
                  {destination._count?.homestays || destination.homestays?.length || 0}
                </p>
              </div>
              <Home className="h-12 w-12 text-[#224240]/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {destination.priority || 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {destination.isTopDestination ? 'Featured' : 'Active'}
                </p>
              </div>
              <Star className="h-12 w-12 text-green-600/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  0
                </p>
              </div>
              <Activity className="h-12 w-12 text-blue-600/20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#224240] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('homestays')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'homestays'
                    ? 'bg-[#224240] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Homestays ({destination._count?.homestays || destination.homestays?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#224240] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination Name {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter destination name"
                />
              ) : (
                <p className="text-gray-900 dark:text-white text-lg">{destination.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description..."
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{destination.description || 'No description'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.priority || ''}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Enter priority (lower = higher priority)"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{destination.priority || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Top Destination
                </label>
                {isEditing ? (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTopDestination}
                      onChange={(e) => setFormData({ ...formData, isTopDestination: e.target.checked })}
                      className="w-4 h-4 text-[#224240] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mark as top destination</span>
                  </label>
                ) : (
                  <p className="text-gray-900 dark:text-white">{destination.isTopDestination ? 'Yes' : 'No'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homestays' && (
          <div className="space-y-6">
            {/* Homestays Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Associated Homestays ({destination.homestays?.length || 0})
                  </h3>
                </div>
                <ActionButton
                  onClick={() => setShowAddHomestay(!showAddHomestay)}
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  {showAddHomestay ? 'Close' : 'Add Homestays'}
                </ActionButton>
              </div>
            </div>

            {/* Add Homestays Section - Location Search */}
            <AnimatePresence>
              {showAddHomestay && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Search Homestays by Location
                  </h3>

                  {/* Search and Filters */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={locationSearchQuery}
                          onChange={(e) => setLocationSearchQuery(e.target.value)}
                          placeholder="Search by location (e.g., Pokhara, Kathmandu)..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
                        />
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-3 py-2 text-sm ${
                            viewMode === 'grid'
                              ? 'bg-[#224240] text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-2 text-sm ${
                            viewMode === 'list'
                              ? 'bg-[#224240] text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {searchLoading ? 'Searching...' : `${availableHomestays.length} available of ${searchTotal} found`}
                        </p>
                        {availableHomestays.length > 0 && (
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-[#224240] dark:text-[#2a5350] hover:underline"
                          >
                            {selectedHomestays.length === availableHomestays.length ? (
                              <>
                                <CheckSquare className="h-4 w-4" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <Square className="h-4 w-4" />
                                Select All ({availableHomestays.length})
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {selectedHomestays.length > 0 && (
                        <ActionButton
                          onClick={handleAddHomestays}
                          variant="primary"
                          size="sm"
                          icon={isAddingHomestays ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          disabled={isAddingHomestays}
                        >
                          {isAddingHomestays ? 'Adding...' : `Add ${selectedHomestays.length} Homestay${selectedHomestays.length !== 1 ? 's' : ''}`}
                        </ActionButton>
                      )}
                    </div>
                  </div>

                  {/* Available Homestays */}
                  <div className="space-y-4">
                    {searchLoading ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner text="Searching homestays..." />
                      </div>
                    ) : availableHomestays.length === 0 ? (
                      <div className="text-center py-12">
                        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {locationSearchQuery
                            ? `No available homestays found for "${locationSearchQuery}"`
                            : 'Enter a location to search for homestays'}
                        </p>
                      </div>
                    ) : viewMode === 'grid' ? (
                      /* Grid View - Compact Cards */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                        {availableHomestays.map((homestay) => (
                          <div
                            key={homestay.id}
                            onClick={() => toggleHomestaySelection(homestay.id)}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${
                              selectedHomestays.includes(homestay.id)
                                ? 'border-[#224240] bg-[#224240]/5'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {selectedHomestays.includes(homestay.id) && (
                              <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-[#224240] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}

                            {/* Compact Image */}
                            {homestay.mainImage || homestay.images?.[0]?.url ? (
                              <img
                                src={homestay.mainImage || homestay.images?.[0]?.url}
                                alt={homestay.name}
                                className="w-full h-24 object-cover"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                <Home className="h-8 w-8 text-gray-400" />
                              </div>
                            )}

                            {/* Compact Details */}
                            <div className="p-2 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1 flex-1">
                                  {homestay.name}
                                </h4>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                  homestay.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {homestay.status}
                                </span>
                              </div>

                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {homestay.address}
                              </p>

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {homestay._count?.rooms || homestay.rooms?.length || 0} rooms
                                </span>
                                {homestay.rooms && homestay.rooms.length > 0 && (
                                  <span className="font-semibold text-[#224240] dark:text-[#2a5350]">
                                    {homestay.rooms[0]?.currency || 'NPR'} {Math.min(...homestay.rooms.map(r => r.price || 0))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Table View */
                      <div className="max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Select</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Homestay</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Location</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Rooms</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Price</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {availableHomestays.map((homestay) => (
                              <tr
                                key={homestay.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                                  selectedHomestays.includes(homestay.id) ? 'bg-[#224240]/5' : ''
                                }`}
                                onClick={() => toggleHomestaySelection(homestay.id)}
                              >
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedHomestays.includes(homestay.id)}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-[#224240] border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    {homestay.mainImage || homestay.images?.[0]?.url ? (
                                      <img
                                        src={homestay.mainImage || homestay.images?.[0]?.url}
                                        alt={homestay.name}
                                        className="w-12 h-12 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <Home className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}
                                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                                      {homestay.name}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {homestay.address}
                                  </p>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                                  {homestay._count?.rooms || homestay.rooms?.length || 0}
                                </td>
                                <td className="px-3 py-2 text-xs font-semibold text-[#224240] dark:text-[#2a5350]">
                                  {homestay.rooms && homestay.rooms.length > 0
                                    ? `${homestay.rooms[0]?.currency || 'NPR'} ${Math.min(...homestay.rooms.map(r => r.price || 0))}`
                                    : '-'}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    homestay.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {homestay.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {searchTotal > 0 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {searchTotalPages} ({searchTotal} total)
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Per page:</label>
                            <select
                              value={pageLimit}
                              onChange={(e) => {
                                setPageLimit(Number(e.target.value));
                                setCurrentPage(1);
                                searchHomestaysByLocation(locationSearchQuery, 1);
                              }}
                              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700"
                            >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ActionButton
                            onClick={() => handlePageChange(currentPage - 1)}
                            variant="secondary"
                            size="sm"
                            disabled={currentPage === 1}
                          >
                            Previous
                          </ActionButton>
                          <ActionButton
                            onClick={() => handlePageChange(currentPage + 1)}
                            variant="secondary"
                            size="sm"
                            disabled={currentPage === searchTotalPages}
                          >
                            Next
                          </ActionButton>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Associated Homestays List */}
            {(destination.homestays || []).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No homestays yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Add homestays to this destination to get started</p>
                <ActionButton
                  onClick={() => setShowAddHomestay(true)}
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add First Homestay
                </ActionButton>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                {/* Bulk Remove Toolbar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setShowRemoveSelection(!showRemoveSelection);
                        if (showRemoveSelection) {
                          setSelectedForRemoval([]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        showRemoveSelection
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {showRemoveSelection ? (
                        <>
                          <X className="h-4 w-4" />
                          Cancel Selection
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-4 w-4" />
                          Select to Remove
                        </>
                      )}
                    </button>

                    {showRemoveSelection && (
                      <>
                        <button
                          onClick={handleSelectAllForRemoval}
                          className="flex items-center gap-2 text-sm text-[#224240] dark:text-[#2a5350] hover:underline"
                        >
                          {selectedForRemoval.length === (destination.homestays?.length || 0) ? (
                            <>
                              <CheckSquare className="h-4 w-4" />
                              Deselect All
                            </>
                          ) : (
                            <>
                              <Square className="h-4 w-4" />
                              Select All ({destination.homestays?.length || 0})
                            </>
                          )}
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedForRemoval.length} selected
                        </span>
                      </>
                    )}
                  </div>

                  {showRemoveSelection && selectedForRemoval.length > 0 && (
                    <ActionButton
                      onClick={handleBulkRemove}
                      variant="danger"
                      size="sm"
                      icon={isRemovingHomestays ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      disabled={isRemovingHomestays}
                    >
                      {isRemovingHomestays ? 'Removing...' : `Remove ${selectedForRemoval.length} Homestay${selectedForRemoval.length !== 1 ? 's' : ''}`}
                    </ActionButton>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(destination.homestays || []).map((item: any) => {
                    const homestay = getHomestayData(item);
                    const homestayImage = getHomestayImage(item);
                    const isSelected = selectedForRemoval.includes(homestay.id);

                    return (
                      <div
                        key={homestay.id}
                        className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                          showRemoveSelection
                            ? isSelected
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
                        }`}
                        onClick={showRemoveSelection ? () => toggleRemovalSelection(homestay.id) : undefined}
                      >
                        {/* Selection checkbox overlay */}
                        {showRemoveSelection && (
                          <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-red-500' : 'bg-white/80 border-2 border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}

                        {homestayImage ? (
                          <img
                            src={homestayImage}
                            alt={homestay.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Home className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{homestay.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{homestay.location || homestay.address || 'No location'}</p>

                          {!showRemoveSelection && (
                            <div className="flex items-center space-x-2">
                              <ActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/admin/homestays/${homestay.id}`, '_blank');
                                }}
                                variant="secondary"
                                size="xs"
                                icon={<ExternalLink className="h-3 w-3" />}
                              >
                                View
                              </ActionButton>
                              <ActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveHomestay(homestay.id);
                                }}
                                variant="danger"
                                size="xs"
                                icon={<Unlink className="h-3 w-3" />}
                              >
                                Remove
                              </ActionButton>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Analytics data will be available once the backend API is integrated.</p>
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
