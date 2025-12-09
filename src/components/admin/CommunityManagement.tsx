'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Building2,
  Users,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Check,
  XCircle,
  Loader2,
  Home,
  ChevronDown,
  ChevronUp,
  Utensils,
  Activity,
  Upload,
  Camera,
  Trash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession } from 'next-auth/react';

interface Community {
  id: number;
  name: string;
  description?: string;
  images: string[];
  pricePerPerson: number;
  currency: string;
  isActive: boolean;
  manager: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  meals: Meal[];
  activities: CommunityActivity[];
  homestays: {
    id: number;
    name: string;
    address: string;
    totalRooms: number;
    totalCapacity: number;
  }[];
  totalRooms: number;
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
}

interface Meal {
  id?: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  description: string;
  isIncluded: boolean;
  extraCost?: number;
  currency?: string;
}

interface CommunityActivity {
  id?: number;
  name: string;
  description: string;
  isIncluded: boolean;
  extraCost?: number;
  currency?: string;
  duration?: string;
  images?: string[];
}

interface HomestayImage {
  id: number;
  homestayId: number;
  url: string;
  isMain: boolean;
  tags: string[];
  createdAt: string;
}

interface HomestayFacility {
  homestayId: number;
  facilityId: number;
  facility: {
    id: number;
    name: string;
    isDefault: boolean;
    createdBy: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface RoomImage {
  id: number;
  roomId: number;
  url: string;
  isMain: boolean;
  tags: string[];
  createdAt: string;
}

interface HomestayRoom {
  id: number;
  homestayId: number;
  name: string;
  description: string;
  totalArea: number;
  areaUnit: string;
  maxOccupancy: number;
  minOccupancy: number;
  price: number;
  currency: string;
  includeBreakfast: boolean;
  createdAt: string;
  updatedAt: string;
  rating: number | null;
  reviews: number;
  images: RoomImage[];
  beds: any[];
}

interface DetailedHomestay {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  ownerId: number;
  description: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  rating: number | null;
  reviews: number;
  discount: number;
  vipAccess: boolean;
  isCampaignRegistered: boolean;
  hostEmail: string | null;
  hostPhone: string | null;
  images: HomestayImage[];
  facilities: HomestayFacility[];
  rooms: HomestayRoom[];
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

interface CommunityFormData {
  name: string;
  description: string;
  images: string[];
  managerId: number | null;
  pricePerPerson: number;
  currency: string;
  meals: Meal[];
  activities: CommunityActivity[];
}

export default function CommunityManagement() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [homestays, setHomestays] = useState<DetailedHomestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHomestays, setLoadingHomestays] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [expandedCommunity, setExpandedCommunity] = useState<number | null>(null);
  const [showHomestayModal, setShowHomestayModal] = useState(false);
  const [selectedCommunityForHomestays, setSelectedCommunityForHomestays] = useState<number | null>(null);
  const [selectedHomestays, setSelectedHomestays] = useState<number[]>([]);
  const [homestaySearchTerm, setHomestaySearchTerm] = useState('');
  const [homestayCurrentPage, setHomestayCurrentPage] = useState(1);
  const [homestayLocationFilter, setHomestayLocationFilter] = useState('');

  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    images: [],
    managerId: null,
    pricePerPerson: 0,
    currency: 'NPR',
    meals: [],
    activities: [],
  });
  const [imageInput, setImageInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterActive]);

  const fetchAllHomestays = async (): Promise<DetailedHomestay[]> => {
    try {
      setLoadingHomestays(true);
      const allHomestays: DetailedHomestay[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Fetch first page to get total pages
      const firstPageResponse: any = await adminApi.getHomestays({
        status: 'APPROVED',
        page: currentPage,
        limit: 10
      });

      if (firstPageResponse && firstPageResponse.data) {
        allHomestays.push(...(firstPageResponse.data as DetailedHomestay[]));
        totalPages = firstPageResponse.totalPages || 1;

        // Fetch remaining pages
        const remainingPages: Promise<any>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            adminApi.getHomestays({
              status: 'APPROVED',
              page,
              limit: 10
            })
          );
        }

        if (remainingPages.length > 0) {
          const remainingResults: any[] = await Promise.all(remainingPages);
          remainingResults.forEach(response => {
            const data = response && response.data ? (response.data as DetailedHomestay[]) : undefined;
            if (data) {
              allHomestays.push(...data);
            }
          });
        }
      }

      console.log(`Fetched ${allHomestays.length} total homestays from ${totalPages} pages`);
      return allHomestays;
    } catch (error: any) {
      console.error('Error fetching homestays:', error);
      throw error;
    } finally {
      setLoadingHomestays(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only pass isActive parameter if it's explicitly set (not undefined)
      const promises: [Promise<any>, Promise<any>] = [
        filterActive !== undefined
          ? adminApi.getCommunities({ isActive: filterActive })
          : adminApi.getCommunities(),
        adminApi.getCommunityManagers({ isActive: true }),
      ];

      const [communitiesData, managersData] = await Promise.all(promises);
      setCommunities(communitiesData || []);
      setManagers(managersData || []);

      // Fetch all homestays with pagination
      const homestaysData = await fetchAllHomestays();
      setHomestays(homestaysData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Community name is required';
    }

    if (!formData.managerId) {
      errors.managerId = 'Community manager is required';
    }

    if (formData.pricePerPerson <= 0) {
      errors.pricePerPerson = 'Price per person must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const cleanData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        images: formData.images.filter((img) => img.trim()),
        managerId: formData.managerId!,
        pricePerPerson: Number(formData.pricePerPerson),
        currency: formData.currency || 'NPR',
        meals: formData.meals.length > 0 ? formData.meals : undefined,
        activities: formData.activities.length > 0 ? formData.activities : undefined,
      };

      if (editingCommunity) {
        await adminApi.updateCommunity(editingCommunity.id, cleanData);
        alert('Community updated successfully');
      } else {
        await adminApi.createCommunity(cleanData);
        alert('Community created successfully');
      }

      setShowForm(false);
      setEditingCommunity(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving community:', error);
      alert(error.message || 'Failed to save community');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description || '',
      images: community.images || [],
      managerId: community.manager?.id || null,
      pricePerPerson: community.pricePerPerson,
      currency: community.currency,
      meals: community.meals || [],
      activities: community.activities || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this community?')) {
      return;
    }

    try {
      await adminApi.deleteCommunity(id);
      alert('Community deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting community:', error);
      alert(error.message || 'Failed to delete community');
    }
  };

  const handleManageHomestays = (communityId: number) => {
    const community = communities.find((c) => c.id === communityId);
    if (community) {
      setSelectedCommunityForHomestays(communityId);
      setSelectedHomestays(community.homestays.map((h) => h.id));
      setHomestaySearchTerm('');
      setHomestayCurrentPage(1);
      setHomestayLocationFilter('');
      setShowHomestayModal(true);
    }
  };

  const handleSaveHomestays = async () => {
    if (!selectedCommunityForHomestays) return;

    try {
      const community = communities.find((c) => c.id === selectedCommunityForHomestays);
      if (!community) return;

      const currentHomestayIds = community.homestays.map((h) => h.id);
      const toAdd = selectedHomestays.filter((id) => !currentHomestayIds.includes(id));
      const toRemove = currentHomestayIds.filter((id) => !selectedHomestays.includes(id));

      if (toAdd.length > 0) {
        await adminApi.addHomestaysToCommunity(selectedCommunityForHomestays, {
          homestayIds: toAdd,
        });
      }

      if (toRemove.length > 0) {
        await adminApi.removeHomestaysFromCommunity(selectedCommunityForHomestays, {
          homestayIds: toRemove,
        });
      }

      alert('Homestays updated successfully');
      setShowHomestayModal(false);
      setSelectedCommunityForHomestays(null);
      setSelectedHomestays([]);
      fetchData();
    } catch (error: any) {
      console.error('Error updating homestays:', error);
      alert(error.message || 'Failed to update homestays');
    }
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [
        ...formData.meals,
        {
          mealType: 'BREAKFAST',
          description: '',
          isIncluded: true,
          extraCost: 0,
          currency: 'NPR',
        },
      ],
    });
  };

  const removeMeal = (index: number) => {
    setFormData({
      ...formData,
      meals: formData.meals.filter((_, i) => i !== index),
    });
  };

  const updateMeal = (index: number, field: string, value: any) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setFormData({ ...formData, meals: updatedMeals });
  };

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [
        ...formData.activities,
        {
          name: '',
          description: '',
          isIncluded: true,
          extraCost: 0,
          currency: 'NPR',
          duration: '',
          images: [],
        },
      ],
    });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    });
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const updatedActivities = [...formData.activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setFormData({ ...formData, activities: updatedActivities });
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    try {
      setUploadingImages(true);

      // Get session for authorization
      const session = await getSession();
      const accessToken = session?.user?.accessToken;

      if (!accessToken) {
        throw new Error('No access token found. Please login again.');
      }

      const API_BASE_URL = typeof window !== 'undefined'
        ? '/api/backend'
        : 'http://13.61.8.56:3001';

      // Upload all files
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/s3/upload/communities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: uploadFormData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const responseText = await response.text();

        let imageUrl: string;
        try {
          const result = JSON.parse(responseText);
          imageUrl = result.url || result.data?.url || result.fileUrl || result;
        } catch (e) {
          imageUrl = responseText.trim();
        }

        if (!imageUrl || !imageUrl.startsWith('http')) {
          throw new Error(`Invalid URL returned for ${file.name}`);
        }

        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Add uploaded URLs to form data
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      });

      alert(`Successfully uploaded ${uploadedUrls.length} image(s)`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create a new FileList-like object
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));

    await handleMultipleImageUpload(dataTransfer.files);

    // Reset input
    e.target.value = '';
  };

  const handleDeleteImage = async (index: number, imageUrl: string) => {
    try {
      setDeletingImageIndex(index);

      // Extract S3 key from URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Everything after the domain

      if (!key) {
        throw new Error('Invalid image URL');
      }

      const session = await getSession();
      const accessToken = session?.user?.accessToken;

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const API_BASE_URL = typeof window !== 'undefined'
        ? '/api/backend'
        : 'http://13.61.8.56:3001';

      const response = await fetch(`${API_BASE_URL}/s3/delete/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from S3');
      }

      // Remove from form data
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.message || 'Failed to delete image');
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: [],
      managerId: null,
      pricePerPerson: 0,
      currency: 'NPR',
      meals: [],
      activities: [],
    });
    setImageInput('');
    setFormErrors({});
    setEditingCommunity(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const filteredCommunities = communities.filter((community) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      community.name.toLowerCase().includes(searchLower) ||
      community.description?.toLowerCase().includes(searchLower) ||
      community.manager?.fullName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communities</h1>
          <p className="text-gray-600">Manage community homestay groups and their managers</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
              />
            </div>

            {/* Filter & Add */}
            <div className="flex gap-2">
              <select
                value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === 'all' ? undefined : value === 'active');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
              >
                <option value="all">All Communities</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Community
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#224240]" />
          </div>
        )}

        {/* Communities Grid - Attractive Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCommunities.map((community) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
                >
                  {/* Community Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    {community.images && community.images.length > 0 ? (
                      <div className="relative h-full">
                        <img
                          src={community.images[0]}
                          alt={community.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                        {/* Image Count Badge */}
                        {community.images.length > 1 && (
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {community.images.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-emerald-300" />
                      </div>
                    )}

                    {/* Active Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {community.isActive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          <Check className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-gray-900">
                            {community.pricePerPerson} {community.currency}
                          </span>
                          <span className="text-xs text-gray-600">/person</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Community Content */}
                  <div className="p-6">
                    {/* Title & Description */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                        {community.name}
                      </h3>
                      {community.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {community.description}
                        </p>
                      )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <Home className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{community.homestays.length}</div>
                        <div className="text-xs text-gray-600">Homestays</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <Building2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{community.totalRooms}</div>
                        <div className="text-xs text-gray-600">Rooms</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{community.totalCapacity}</div>
                        <div className="text-xs text-gray-600">Capacity</div>
                      </div>
                    </div>

                    {/* Manager Info */}
                    {community.manager && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Manager</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {community.manager.fullName}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{community.manager.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meal & Activity Count */}
                    <div className="flex gap-2 mb-4">
                      {community.meals && community.meals.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                          <Utensils className="h-3.5 w-3.5" />
                          {community.meals.length} Meals
                        </div>
                      )}
                      {community.activities && community.activities.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium">
                          <Activity className="h-3.5 w-3.5" />
                          {community.activities.length} Activities
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedCommunity(expandedCommunity === community.id ? null : community.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-medium text-sm"
                      >
                        {expandedCommunity === community.id ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Details
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleManageHomestays(community.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium"
                        title="Manage Homestays"
                      >
                        <Home className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(community)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(community.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedCommunity === community.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white space-y-6">
                          {/* Image Gallery */}
                          {community.images.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-emerald-600" />
                                Image Gallery
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {community.images.map((img, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
                                  >
                                    <img
                                      src={img}
                                      alt={`${community.name} ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {idx === 0 && (
                                      <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                                        Main
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meals Section */}
                          {community.meals.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-orange-600" />
                                Meals Offered
                              </h4>
                              <div className="grid gap-3">
                                {community.meals.map((meal, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-white border border-orange-100 rounded-xl hover:border-orange-200 hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <Utensils className="h-5 w-5 text-orange-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900 mb-1">{meal.mealType}</div>
                                        <p className="text-sm text-gray-600">{meal.description}</p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      {meal.isIncluded ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                                          <Check className="h-3.5 w-3.5" />
                                          Included
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                          +{meal.extraCost} {meal.currency}
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Activities Section */}
                          {community.activities.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-cyan-600" />
                                Activities & Experiences
                              </h4>
                              <div className="grid gap-3">
                                {community.activities.map((activity, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-white border border-cyan-100 rounded-xl hover:border-cyan-200 hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                          <Activity className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900 mb-1">{activity.name}</div>
                                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                          {activity.duration && (
                                            <div className="inline-flex items-center gap-1 text-xs text-gray-500">
                                              <span className="font-medium">Duration:</span>
                                              <span>{activity.duration}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        {activity.isIncluded ? (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                                            <Check className="h-3.5 w-3.5" />
                                            Included
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                            +{activity.extraCost} {activity.currency}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Homestays Section */}
                          {community.homestays.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Home className="h-5 w-5 text-blue-600" />
                                Homestays in Community
                              </h4>
                              <div className="grid gap-3">
                                {community.homestays.map((homestay, idx) => (
                                  <motion.div
                                    key={homestay.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Home className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900 mb-1">{homestay.name}</div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <MapPin className="h-3.5 w-3.5" />
                                          <p>{homestay.address}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                      <div className="text-center px-3 py-2 bg-purple-50 rounded-lg">
                                        <div className="font-bold text-gray-900">{homestay.totalRooms}</div>
                                        <div className="text-xs text-gray-600">Rooms</div>
                                      </div>
                                      <div className="text-center px-3 py-2 bg-emerald-50 rounded-lg">
                                        <div className="font-bold text-gray-900">{homestay.totalCapacity}</div>
                                        <div className="text-xs text-gray-600">Capacity</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new community'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Community
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCommunity ? 'Edit Community' : 'Add Community'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Community Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter community name"
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
                        placeholder="Enter community description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Community Manager <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.managerId || ''}
                          onChange={(e) => setFormData({ ...formData, managerId: Number(e.target.value) })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent ${
                            formErrors.managerId ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Manager</option>
                          {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.fullName}
                            </option>
                          ))}
                        </select>
                        {formErrors.managerId && <p className="mt-1 text-sm text-red-500">{formErrors.managerId}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Per Person <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={formData.pricePerPerson}
                            onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent ${
                              formErrors.pricePerPerson ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                          <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
                          >
                            <option value="NPR">NPR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                        {formErrors.pricePerPerson && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.pricePerPerson}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Images - Enhanced S3 Upload */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-emerald-600" />
                        Community Images
                      </h3>
                      <span className="text-xs text-gray-500">{formData.images.length} images</span>
                    </div>

                    {/* Upload Button */}
                    <div className="mb-4">
                      <input
                        type="file"
                        id="community-images-upload"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileSelect}
                        disabled={uploadingImages}
                        className="hidden"
                      />
                      <label
                        htmlFor="community-images-upload"
                        className={`flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg cursor-pointer font-medium ${
                          uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImages ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Uploading Images...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5" />
                            Upload Multiple Images
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-600 text-center mt-2">
                        Select multiple images (PNG, JPG up to 5MB each)
                      </p>
                    </div>

                    {/* Image Gallery */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((img, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                              <img
                                src={img}
                                alt={`Community image ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(idx, img)}
                                  disabled={deletingImageIndex === idx}
                                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  {deletingImageIndex === idx ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Trash className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              {idx === 0 && (
                                <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                                  Main
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {formData.images.length === 0 && !uploadingImages && (
                      <div className="text-center py-8">
                        <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No images uploaded yet</p>
                        <p className="text-gray-400 text-xs mt-1">Click the button above to upload images</p>
                      </div>
                    )}
                  </div>

                  {/* Meals */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Meals</h3>
                      <button
                        type="button"
                        onClick={addMeal}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Meal
                      </button>
                    </div>
                    {formData.meals.map((meal, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <select
                            value={meal.mealType}
                            onChange={(e) => updateMeal(idx, 'mealType', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="BREAKFAST">Breakfast</option>
                            <option value="LUNCH">Lunch</option>
                            <option value="DINNER">Dinner</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={meal.isIncluded}
                              onChange={(e) => updateMeal(idx, 'isIncluded', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-sm">Included in price</label>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={meal.description}
                          onChange={(e) => updateMeal(idx, 'description', e.target.value)}
                          placeholder="Meal description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        {!meal.isIncluded && (
                          <input
                            type="number"
                            value={meal.extraCost}
                            onChange={(e) => updateMeal(idx, 'extraCost', Number(e.target.value))}
                            placeholder="Extra cost"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMeal(idx)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove Meal
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Activities</h3>
                      <button
                        type="button"
                        onClick={addActivity}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Activity
                      </button>
                    </div>
                    {formData.activities.map((activity, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3">
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => updateActivity(idx, 'name', e.target.value)}
                          placeholder="Activity name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        <textarea
                          value={activity.description}
                          onChange={(e) => updateActivity(idx, 'description', e.target.value)}
                          placeholder="Activity description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            type="text"
                            value={activity.duration}
                            onChange={(e) => updateActivity(idx, 'duration', e.target.value)}
                            placeholder="Duration (e.g., 2 hours)"
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={activity.isIncluded}
                              onChange={(e) => updateActivity(idx, 'isIncluded', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-sm">Included in price</label>
                          </div>
                        </div>
                        {!activity.isIncluded && (
                          <input
                            type="number"
                            value={activity.extraCost}
                            onChange={(e) => updateActivity(idx, 'extraCost', Number(e.target.value))}
                            placeholder="Extra cost"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeActivity(idx)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove Activity
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>{editingCommunity ? 'Update Community' : 'Create Community'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enhanced Homestay Selection Modal */}
      <AnimatePresence>
        {showHomestayModal && (() => {
          const ITEMS_PER_PAGE = 10;

          // Get unique locations
          const uniqueLocations = Array.from(new Set(homestays.map(h => h.address))).filter(Boolean);

          // Filter homestays
          const filteredHomestays = homestays.filter((homestay) => {
            const matchesSearch =
              homestay.name.toLowerCase().includes(homestaySearchTerm.toLowerCase()) ||
              homestay.address.toLowerCase().includes(homestaySearchTerm.toLowerCase());

            const matchesLocation = !homestayLocationFilter || homestay.address === homestayLocationFilter;

            return matchesSearch && matchesLocation;
          });

          // Pagination
          const totalPages = Math.ceil(filteredHomestays.length / ITEMS_PER_PAGE);
          const startIndex = (homestayCurrentPage - 1) * ITEMS_PER_PAGE;
          const paginatedHomestays = filteredHomestays.slice(startIndex, startIndex + ITEMS_PER_PAGE);

          // Get selected homestay details
          const selectedHomestayDetails = homestays.filter(h => selectedHomestays.includes(h.id));

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHomestayModal(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Manage Community Homestays</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedHomestays.length} of {homestays.length} homestays selected
                      </p>
                    </div>
                    <button
                      onClick={() => setShowHomestayModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Main Content - Two Panel Layout */}
                  <div className="flex-1 flex gap-6 p-6 overflow-hidden relative">
                    {/* Loading Overlay */}
                    {loadingHomestays && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="text-center">
                          <Loader2 className="h-12 w-12 text-[#224240] animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading homestays...</p>
                        </div>
                      </div>
                    )}

                    {/* Left Panel - Available Homestays */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-medium text-gray-900 mb-3">Available Homestays</h3>

                      {/* Search and Filter */}
                      <div className="space-y-3 mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={homestaySearchTerm}
                            onChange={(e) => {
                              setHomestaySearchTerm(e.target.value);
                              setHomestayCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
                          />
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={homestayLocationFilter}
                            onChange={(e) => {
                              setHomestayLocationFilter(e.target.value);
                              setHomestayCurrentPage(1);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
                          >
                            <option value="">All Locations</option>
                            {uniqueLocations.map((location) => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>

                          {(homestaySearchTerm || homestayLocationFilter) && (
                            <button
                              onClick={() => {
                                setHomestaySearchTerm('');
                                setHomestayLocationFilter('');
                                setHomestayCurrentPage(1);
                              }}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Showing {filteredHomestays.length === 0 ? 0 : startIndex + 1}-
                            {Math.min(startIndex + ITEMS_PER_PAGE, filteredHomestays.length)} of {filteredHomestays.length}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newSelected = filteredHomestays.map(h => h.id);
                                setSelectedHomestays(Array.from(new Set([...selectedHomestays, ...newSelected])));
                              }}
                              className="text-[#224240] hover:underline"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setSelectedHomestays([])}
                              className="text-red-600 hover:underline"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Homestay List */}
                      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        {paginatedHomestays.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                            <Home className="h-12 w-12 mb-2 opacity-30" />
                            <p className="text-sm">No homestays found</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {paginatedHomestays.map((homestay) => {
                              const isSelected = selectedHomestays.includes(homestay.id);
                              return (
                                <label
                                  key={homestay.id}
                                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-[#224240]/5' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedHomestays([...selectedHomestays, homestay.id]);
                                      } else {
                                        setSelectedHomestays(selectedHomestays.filter((id) => id !== homestay.id));
                                      }
                                    }}
                                    className="mt-1 rounded border-gray-300 text-[#224240] focus:ring-[#224240]"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{homestay.name}</div>
                                    <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {homestay.address}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5 text-[#224240] flex-shrink-0" />
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() => setHomestayCurrentPage(Math.max(1, homestayCurrentPage - 1))}
                            disabled={homestayCurrentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
                          </button>

                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                // Show first, last, current, and adjacent pages
                                return page === 1 ||
                                       page === totalPages ||
                                       Math.abs(page - homestayCurrentPage) <= 1;
                              })
                              .map((page, idx, arr) => {
                                // Add ellipsis if there's a gap
                                const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsisBefore && <span className="text-gray-400">...</span>}
                                    <button
                                      onClick={() => setHomestayCurrentPage(page)}
                                      className={`px-3 py-1 text-sm rounded-lg ${
                                        page === homestayCurrentPage
                                          ? 'bg-[#224240] text-white'
                                          : 'border border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </React.Fragment>
                                );
                              })}
                          </div>

                          <button
                            onClick={() => setHomestayCurrentPage(Math.min(totalPages, homestayCurrentPage + 1))}
                            disabled={homestayCurrentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Panel - Selected Homestays with Details */}
                    <div className="w-96 flex flex-col border-l border-gray-200 pl-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Selected ({selectedHomestays.length})
                      </h3>

                      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        {selectedHomestayDetails.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                            <Check className="h-12 w-12 mb-2 opacity-30" />
                            <p className="text-sm text-center px-4">No homestays selected</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {selectedHomestayDetails.map((homestay) => (
                              <div
                                key={homestay.id}
                                className="p-4 hover:bg-gray-50"
                              >
                                {/* Header with Remove Button */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900">
                                      {homestay.name}
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span>{homestay.address}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedHomestays(selectedHomestays.filter(id => id !== homestay.id))}
                                    className="p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
                                    title="Remove"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </button>
                                </div>

                                {/* Main Image */}
                                {homestay.images && homestay.images.length > 0 && (
                                  <div className="mb-3">
                                    <img
                                      src={homestay.images.find(img => img.isMain)?.url || homestay.images[0].url}
                                      alt={homestay.name}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  </div>
                                )}

                                {/* Description */}
                                {homestay.description && (
                                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {homestay.description}
                                  </p>
                                )}

                                {/* Owner Info */}
                                {homestay.owner && (
                                  <div className="mb-3 pb-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Owner</div>
                                    <div className="text-xs text-gray-600">
                                      <div>{homestay.owner.name}</div>
                                      <div className="text-xs text-gray-500">{homestay.owner.email}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Contact */}
                                {homestay.contactNumber && (
                                  <div className="mb-3 pb-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-700 mb-1">Contact</div>
                                    <div className="text-xs text-gray-600">{homestay.contactNumber}</div>
                                  </div>
                                )}

                                {/* Facilities */}
                                {homestay.facilities && homestay.facilities.length > 0 && (
                                  <div className="mb-3 pb-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-700 mb-2">Facilities</div>
                                    <div className="flex flex-wrap gap-1">
                                      {homestay.facilities.slice(0, 4).map((facility) => (
                                        <span
                                          key={facility.facilityId}
                                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                        >
                                          {facility.facility.name}
                                        </span>
                                      ))}
                                      {homestay.facilities.length > 4 && (
                                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          +{homestay.facilities.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Rooms */}
                                {homestay.rooms && homestay.rooms.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-xs font-medium text-gray-700 mb-2">Rooms ({homestay.rooms.length})</div>
                                    <div className="space-y-2">
                                      {homestay.rooms.slice(0, 2).map((room) => (
                                        <div key={room.id} className="bg-gray-50 rounded p-2">
                                          <div className="text-xs font-medium text-gray-900">{room.name}</div>
                                          <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                                            <span>{room.maxOccupancy} guests</span>
                                            <span>•</span>
                                            <span>{room.price} {room.currency}</span>
                                          </div>
                                        </div>
                                      ))}
                                      {homestay.rooms.length > 2 && (
                                        <div className="text-xs text-gray-500 text-center">
                                          +{homestay.rooms.length - 2} more rooms
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-green-50 rounded p-2">
                                    <div className="text-green-600 font-medium">Rating</div>
                                    <div className="text-gray-900">
                                      {homestay.rating ? `${homestay.rating.toFixed(1)}` : 'N/A'}
                                    </div>
                                  </div>
                                  <div className="bg-purple-50 rounded p-2">
                                    <div className="text-purple-600 font-medium">Reviews</div>
                                    <div className="text-gray-900">{homestay.reviews}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
                    <button
                      onClick={() => setShowHomestayModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveHomestays}
                      disabled={selectedHomestays.length === 0}
                      className="flex-1 px-4 py-2 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save {selectedHomestays.length} Homestay{selectedHomestays.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
