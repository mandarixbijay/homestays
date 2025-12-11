'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  User,
  Image as ImageIcon,
  Check,
  XCircle,
  Loader2,
  Upload,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession } from 'next-auth/react';

interface CommunityManager {
  id: number;
  fullName: string;
  image?: string | null;
  phone: string;
  email: string;
  alternatePhone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommunityManagerFormData {
  fullName: string;
  image?: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  address?: string;
  password?: string;
}

export default function CommunityManagerManagement() {
  const [managers, setManagers] = useState<CommunityManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState<CommunityManager | null>(null);
  const [formData, setFormData] = useState<CommunityManagerFormData>({
    fullName: '',
    phone: '',
    email: '',
    image: '',
    alternatePhone: '',
    address: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchManagers();
  }, [filterActive]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      // Only pass isActive parameter if it's explicitly set (not undefined)
      const params = filterActive !== undefined ? { isActive: filterActive } : undefined;
      const response = await adminApi.getCommunityManagers(params);
      // Ensure we only set an array of CommunityManager; fallback to empty array when response is not an array
      const managersList: CommunityManager[] = Array.isArray(response) ? (response as CommunityManager[]) : [];
      setManagers(managersList);
    } catch (error: any) {
      console.error('Error fetching community managers:', error);
      alert(error.message || 'Failed to fetch community managers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    // Either email OR phone is required (not both mandatory)
    const hasEmail = formData.email.trim();
    const hasPhone = formData.phone.trim();

    if (!hasEmail && !hasPhone) {
      errors.email = 'Either email or phone number is required';
      errors.phone = 'Either email or phone number is required';
    } else {
      // Validate email format if provided
      if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    // Password validation - required when creating, optional when editing
    if (!editingManager) {
      if (!formData.password || formData.password.trim() === '') {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    } else if (formData.password && formData.password.trim() !== '' && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);

      // Get session for authorization
      const session = await getSession();
      const accessToken = session?.user?.accessToken;

      if (!accessToken) {
        throw new Error('No access token found. Please login again.');
      }

      // Create form data for S3 upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      // Use backend API directly for upload
      const API_BASE_URL = typeof window !== 'undefined'
        ? '/api/backend'
        : 'http://13.61.8.56:3001';

      const response = await fetch(`${API_BASE_URL}/s3/upload/community-managers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: uploadFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      // Get response text first
      const responseText = await response.text();
      console.log('Upload response:', responseText);

      let imageUrl: string;

      // Try to parse as JSON first
      try {
        const result = JSON.parse(responseText);
        imageUrl = result.url || result.data?.url || result.fileUrl || result;
      } catch (e) {
        // If not JSON, treat as plain URL string
        imageUrl = responseText.trim();
      }

      // Validate the URL
      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL returned from upload');
      }

      // Update form data and preview
      setFormData({ ...formData, image: imageUrl });
      setImagePreview(imageUrl);

      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      await handleImageUpload(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Clean up the data - remove empty strings and convert to null/undefined
      const cleanData: any = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        image: formData.image?.trim() || undefined,
        alternatePhone: formData.alternatePhone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      };

      // Include password for create, or for update if it's provided
      if (!editingManager) {
        // Creating new manager - password is required
        cleanData.password = formData.password?.trim();
      } else if (formData.password && formData.password.trim()) {
        // Updating existing manager - password is optional, only include if provided
        cleanData.password = formData.password.trim();
      }

      if (editingManager) {
        await adminApi.updateCommunityManager(editingManager.id, cleanData);
        alert('Community manager updated successfully');
      } else {
        await adminApi.createCommunityManager(cleanData);
        alert('Community manager created successfully');
      }

      setShowForm(false);
      setEditingManager(null);
      resetForm();
      fetchManagers();
    } catch (error: any) {
      console.error('Error saving community manager:', error);
      alert(error.message || 'Failed to save community manager');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (manager: CommunityManager) => {
    setEditingManager(manager);
    setFormData({
      fullName: manager.fullName,
      image: manager.image || '',
      phone: manager.phone,
      email: manager.email,
      alternatePhone: manager.alternatePhone || '',
      address: manager.address || '',
      password: '', // Don't populate password when editing
    });
    setImagePreview(manager.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this community manager?')) {
      return;
    }

    try {
      await adminApi.deleteCommunityManager(id);
      alert('Community manager deleted successfully');
      fetchManagers();
    } catch (error: any) {
      console.error('Error deleting community manager:', error);
      alert(error.message || 'Failed to delete community manager');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      image: '',
      alternatePhone: '',
      address: '',
      password: '',
    });
    setFormErrors({});
    setEditingManager(null);
    setImagePreview('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const filteredManagers = managers.filter((manager) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      manager.fullName.toLowerCase().includes(searchLower) ||
      manager.email.toLowerCase().includes(searchLower) ||
      manager.phone.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Managers</h1>
          <p className="text-gray-600">Manage community managers who oversee community homestays</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
              />
            </div>

            {/* Filter by Active Status */}
            <div className="flex gap-2">
              <select
                value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === 'all' ? undefined : value === 'active');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
              >
                <option value="all">All Managers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Manager
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

        {/* Managers Grid - Profile Card Style */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredManagers.map((manager) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
                >
                  {/* Profile Header with Gradient Background */}
                  <div className="relative h-36 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    {/* Active Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {manager.isActive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-emerald-600 text-xs font-semibold rounded-full shadow-lg">
                          <Check className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-600 text-xs font-semibold rounded-full shadow-lg">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Image - Overlapping */}
                  <div className="relative px-6 -mt-16 pb-4">
                    <div className="relative inline-block">
                      <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-xl ring-4 ring-white">
                        {manager.image ? (
                          <img
                            src={manager.image}
                            alt={manager.fullName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* Online Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-md"></div>
                    </div>
                  </div>

                  {/* Manager Details */}
                  <div className="px-6 pb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{manager.fullName}</h3>
                    <p className="text-sm text-emerald-600 font-medium mb-4">Community Manager</p>

                    {/* Contact Information */}
                    <div className="space-y-3 mb-5">
                      {manager.email && (
                        <div className="flex items-start gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-100 transition-colors">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-gray-900 truncate">{manager.email}</p>
                          </div>
                        </div>
                      )}
                      {manager.phone && (
                        <div className="flex items-start gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-100 transition-colors">
                            <Phone className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Phone</p>
                            <p className="text-sm text-gray-900">{manager.phone}</p>
                          </div>
                        </div>
                      )}
                      {manager.alternatePhone && (
                        <div className="flex items-start gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-100 transition-colors">
                            <Phone className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Alternate</p>
                            <p className="text-sm text-gray-900">{manager.alternatePhone}</p>
                          </div>
                        </div>
                      )}
                      {manager.address && (
                        <div className="flex items-start gap-3 group/item">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-orange-100 transition-colors">
                            <MapPin className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Address</p>
                            <p className="text-sm text-gray-900 line-clamp-2">{manager.address}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(manager)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredManagers.length === 0 && (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No community managers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new community manager'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#224240] text-white rounded-lg hover:bg-[#2a5350] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Manager
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header with Gradient */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 flex items-center justify-between shadow-lg z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingManager ? 'Edit Community Manager' : 'Add Community Manager'}
                    </h2>
                    <p className="text-emerald-100 text-sm mt-0.5">
                      {editingManager ? 'Update manager information' : 'Create a new community manager profile'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="p-8 space-y-8">
                    {/* Profile Image Upload Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-all">
                      <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-emerald-600" />
                        Profile Picture
                      </label>

                      <div className="flex items-start gap-6">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                          <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shadow-lg ring-4 ring-white">
                            {imagePreview || formData.image ? (
                              <img
                                src={imagePreview || formData.image}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-16 w-16 text-gray-400" />
                              </div>
                            )}
                            {uploadingImage && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload Options */}
                        <div className="flex-1 space-y-3">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-upload"
                            className={`flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg cursor-pointer font-medium ${
                              uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Upload className="h-5 w-5" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </label>

                          <p className="text-xs text-gray-600 text-center">
                            PNG, JPG up to 5MB
                          </p>

                          {(imagePreview || formData.image) && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, image: '' });
                                setImagePreview('');
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              <X className="h-4 w-4" />
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Information Section */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        Basic Information
                      </h3>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                            formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                          placeholder="Enter full name"
                        />
                        {formErrors.fullName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Phone className="h-5 w-5 text-emerald-600" />
                        Contact Information
                        <span className="text-xs font-normal text-gray-500 ml-auto">(At least one required)</span>
                      </h3>

                      {/* Email & Phone in Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                              formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            placeholder="email@example.com"
                          />
                          {formErrors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600" />
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                              formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            placeholder="+1 (555) 123-4567"
                          />
                          {formErrors.phone && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              {formErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Alternate Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-purple-600" />
                          Alternate Phone <span className="text-xs font-normal text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.alternatePhone}
                          onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                          placeholder="+1 (555) 987-6543"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password {!editingManager && <span className="text-red-500">*</span>}
                        {editingManager && <span className="text-xs font-normal text-gray-500 ml-1">(Leave empty to keep current)</span>}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                          formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        placeholder="Enter password (min 8 characters)"
                      />
                      {formErrors.password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {formErrors.password}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {editingManager
                          ? 'Password must be at least 8 characters if you want to update it'
                          : 'Password must be at least 8 characters'}
                      </p>
                    </div>
                    {/* Address Section */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        Address <span className="text-xs font-normal text-gray-500 ml-auto">(Optional)</span>
                      </h3>

                      <div>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all resize-none"
                          placeholder="Enter physical address&#10;Street, City, State, ZIP"
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || uploadingImage}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : uploadingImage ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Check className="h-5 w-5" />
                            {editingManager ? 'Update Manager' : 'Create Manager'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
