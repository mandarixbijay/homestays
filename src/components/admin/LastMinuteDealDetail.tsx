// components/admin/LastMinuteDealDetail.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
 Zap, ArrowLeft, Edit, Trash2, Save, X, Calendar, Percent, DollarSign,
 Home, TrendingUp, Tag, Clock, Activity, Search, Filter, Building, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
 useLastMinuteDeals, useHomestays
} from '@/hooks/useAdminApi';
import {
 LoadingSpinner, Alert, ActionButton, Input, useToast
} from '@/components/admin/AdminComponents';

// Helper functions
const getHomestayImage = (homestay: any) => {
 return homestay?.images?.find((img: any) => img.isMain)?.url || homestay?.images?.[0]?.url;
};

const calculateOriginalPrice = (homestay: any): number | null => {
 if (!homestay?.rooms || homestay.rooms.length === 0) return null;
 const prices = homestay.rooms.map((r: any) => r.price).filter((p: number) => p > 0);
 return prices.length > 0 ? Math.min(...prices) : null;
};

interface LastMinuteDealDetailProps {
 dealId: number;
}

export default function LastMinuteDealDetail({ dealId }: LastMinuteDealDetailProps) {
 const router = useRouter();
 const { toasts, addToast } = useToast();

 const { deals, loadDeals, updateDeal, deleteDeal } = useLastMinuteDeals();
 const deal = deals.find(d => d.id === dealId);

 const { homestays, loading: homestaysLoading, loadHomestays } = useHomestays();

 const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'analytics'>('overview');
 const [isEditing, setIsEditing] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 homestayId: 0,
 discount: 0,
 discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
 startDate: '',
 endDate: '',
 description: '',
 isActive: true
 });

 // Homestay search and filters
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [locationFilter, setLocationFilter] = useState<string>('');
 const [showHomestaySelector, setShowHomestaySelector] = useState(false);

 useEffect(() => {
 loadDeals({ page: 1, limit: 100 });
 loadHomestays({ page: 1, limit: 1000, status: 'APPROVED' });
 }, []);

 useEffect(() => {
 if (deal) {
 setFormData({
 homestayId: deal.homestayId || 0,
 discount: deal.discount || 0,
 discountType: deal.discountType || 'PERCENTAGE',
 startDate: deal.startDate ? new Date(deal.startDate).toISOString().split('T')[0] : '',
 endDate: deal.endDate ? new Date(deal.endDate).toISOString().split('T')[0] : '',
 description: deal.description || '',
 isActive: deal.isActive ?? true
 });
 }
 }, [deal]);

 // Filter homestays
 const filteredHomestays = useMemo(() => {
 return homestays.filter(h => {
 if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
 !h.address?.toLowerCase().includes(searchQuery.toLowerCase())) {
 return false;
 }
 if (statusFilter !== 'all' && h.status !== statusFilter) {
 return false;
 }
 if (locationFilter && !h.address?.toLowerCase().includes(locationFilter.toLowerCase())) {
 return false;
 }
 return true;
 });
 }, [homestays, searchQuery, statusFilter, locationFilter]);

 const uniqueLocations = useMemo(() => {
 const locations = homestays
 .map(h => h.address)
 .filter((loc): loc is string => !!loc);
 return Array.from(new Set(locations));
 }, [homestays]);

 const selectedHomestay = homestays.find(h => h.id === formData.homestayId);

 const isActive = deal?.isActive && deal?.endDate && new Date(deal.endDate) > new Date();
 const isExpired = deal && deal.endDate && new Date(deal.endDate) < new Date();
 const daysRemaining = deal?.endDate ? Math.ceil((new Date(deal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

 const selectedHomestayPrice = selectedHomestay ? calculateOriginalPrice(selectedHomestay) : null;
 const estimatedSavings = selectedHomestayPrice
 ? formData.discountType === 'PERCENTAGE'
 ? (selectedHomestayPrice * formData.discount / 100)
 : formData.discount
 : 0;

 const handleSave = async () => {
 try {
 await updateDeal(dealId, formData);
 setIsEditing(false);
 addToast({ type: 'success', title: 'Success', message: 'Deal updated successfully' });
 loadDeals({ page: 1, limit: 100 });
 } catch (error) {
 addToast({ type: 'error', title: 'Error', message: 'Failed to update deal' });
 }
 };

 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

 const handleDelete = async () => {
 try {
 await deleteDeal(dealId);
 addToast({ type: 'success', title: 'Success', message: 'Deal deleted successfully' });
 router.push('/admin/last-minute-deals');
 } catch (error) {
 addToast({ type: 'error', title: 'Error', message: 'Failed to delete deal' });
 }
 };

 if (!deal) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <LoadingSpinner size="lg" text="Loading deal..." />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
 {/* Header */}
 <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <ActionButton
 onClick={() => router.push('/admin/last-minute-deals')}
 variant="secondary"
 icon={<ArrowLeft className="h-4 w-4" />}
 >
 Back
 </ActionButton>
 <div>
 <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
 <span>Last Minute Deal #{deal.id}</span>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
 isActive ? 'bg-green-100 text-green-700' :
 isExpired ? 'bg-red-100 text-red-700' :
 'bg-gray-100 text-gray-700'
 }`}>
 {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
 </span>
 </h1>
 <p className="text-sm text-gray-600">
 {deal.homestay?.name || 'No homestay selected'}
 </p>
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
 Save
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
 onClick={() => setShowDeleteConfirm(true)}
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
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white rounded-xl p-6 border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-600">Discount</p>
 <p className="text-3xl font-bold text-[#1A403D]">
 {deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''}
 </p>
 <p className="text-xs text-gray-500 mt-1">{deal.discountType}</p>
 </div>
 {deal.discountType === 'PERCENTAGE' ? (
 <Percent className="h-12 w-12 text-yellow-500/30" />
 ) : (
 <DollarSign className="h-12 w-12 text-orange-500/30" />
 )}
 </div>
 </div>

 <div className="bg-white rounded-xl p-6 border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-600">Savings</p>
 <p className="text-3xl font-bold text-green-600">
 ${estimatedSavings.toFixed(0)}
 </p>
 <p className="text-xs text-gray-500 mt-1">per booking</p>
 </div>
 <TrendingUp className="h-12 w-12 text-green-600/30" />
 </div>
 </div>

 <div className="bg-white rounded-xl p-6 border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-600">Days Remaining</p>
 <p className="text-3xl font-bold text-[#1A403D]">
 {daysRemaining > 0 ? daysRemaining : 0}
 </p>
 <p className="text-xs text-gray-500 mt-1">until expiry</p>
 </div>
 <Clock className="h-12 w-12 text-[#1A403D]/30" />
 </div>
 </div>

 <div className="bg-white rounded-xl p-6 border border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-600">Views</p>
 <p className="text-3xl font-bold text-purple-600">0</p>
 <p className="text-xs text-gray-500 mt-1">total clicks</p>
 </div>
 <Activity className="h-12 w-12 text-purple-600/30" />
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="mb-6">
 <div className="bg-white rounded-xl p-2 border border-gray-200">
 <div className="flex space-x-2">
 <button
 onClick={() => setActiveTab('overview')}
 className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
 activeTab === 'overview' ? 'bg-[#1A403D] text-white' : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 Overview
 </button>
 <button
 onClick={() => setActiveTab('preview')}
 className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
 activeTab === 'preview' ? 'bg-[#1A403D] text-white' : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 Customer Preview
 </button>
 <button
 onClick={() => setActiveTab('analytics')}
 className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
 activeTab === 'analytics' ? 'bg-[#1A403D] text-white' : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 Analytics
 </button>
 </div>
 </div>
 </div>

 {/* Tab Content */}
 {activeTab === 'overview' && (
 <div className="space-y-6">
 {/* Homestay Selection */}
 <div className="bg-white rounded-xl p-6 border border-gray-200 ">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-gray-900 ">Selected Homestay</h3>
 {isEditing && (
 <ActionButton
 onClick={() => setShowHomestaySelector(!showHomestaySelector)}
 variant="secondary"
 size="sm"
 >
 {showHomestaySelector ? 'Hide' : 'Change'} Homestay
 </ActionButton>
 )}
 </div>

 {selectedHomestay ? (
 <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
 {getHomestayImage(selectedHomestay) ? (
 <img src={getHomestayImage(selectedHomestay)} alt={selectedHomestay.name} className="w-24 h-24 rounded-lg object-cover" />
 ) : (
 <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
 <Home className="h-12 w-12 text-gray-400" />
 </div>
 )}
 <div className="flex-1">
 <h4 className="font-semibold text-gray-900 ">{selectedHomestay.name}</h4>
 <p className="text-sm text-gray-600 ">{selectedHomestay.address}</p>
 {selectedHomestayPrice && (
 <p className="text-sm text-gray-600 mt-1">Price: ${selectedHomestayPrice}/night</p>
 )}
 </div>
 </div>
 ) : (
 <div className="text-center py-8">
 <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600 ">No homestay selected</p>
 </div>
 )}

 {/* Homestay Selector */}
 {isEditing && showHomestaySelector && (
 <div className="mt-4 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search homestays..."
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white "
 />
 </div>

 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white "
 >
 <option value="all">All Status</option>
 <option value="APPROVED">Approved</option>
 <option value="PENDING">Pending</option>
 </select>

 <select
 value={locationFilter}
 onChange={(e) => setLocationFilter(e.target.value)}
 className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white "
 >
 <option value="">All Locations</option>
 {uniqueLocations.map(loc => (
 <option key={loc} value={loc}>{loc}</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
 {filteredHomestays.map(h => {
 const homestayPrice = calculateOriginalPrice(h);
 const homestayImage = getHomestayImage(h);
 return (
 <div
 key={h.id}
 onClick={() => setFormData({ ...formData, homestayId: h.id })}
 className={`cursor-pointer rounded-lg border-2 transition-all ${
 formData.homestayId === h.id
 ? 'border-[#224240] bg-[#224240]/5'
 : 'border-gray-200 hover:border-gray-300'
 }`}
 >
 {homestayImage ? (
 <img src={homestayImage} alt={h.name} className="w-full h-32 object-cover rounded-t-lg" />
 ) : (
 <div className="w-full h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
 <Home className="h-12 w-12 text-gray-400" />
 </div>
 )}
 <div className="p-3">
 <h4 className="font-medium text-sm text-gray-900 truncate">{h.name}</h4>
 <p className="text-xs text-gray-600 truncate">{h.address}</p>
 {homestayPrice && (
 <p className="text-xs text-gray-600 mt-1">${homestayPrice}/night</p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* Deal Details */}
 <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Details</h3>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Discount Amount {isEditing && <span className="text-red-500">*</span>}
 </label>
 {isEditing ? (
 <Input
 type="number"
 value={formData.discount}
 onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
 />
 ) : (
 <p className="text-gray-900 text-lg">{deal.discount}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Discount Type
 </label>
 {isEditing ? (
 <select
 value={formData.discountType}
 onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' })}
 className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white "
 >
 <option value="PERCENTAGE">Percentage (%)</option>
 <option value="FLAT">Flat Amount ($)</option>
 </select>
 ) : (
 <p className="text-gray-900 ">{deal.discountType}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Start Date
 </label>
 {isEditing ? (
 <Input
 type="date"
 value={formData.startDate}
 onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
 />
 ) : (
 <p className="text-gray-900 ">
 {new Date(deal.startDate).toLocaleDateString()}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 End Date
 </label>
 {isEditing ? (
 <Input
 type="date"
 value={formData.endDate}
 onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
 />
 ) : (
 <p className="text-gray-900 ">
 {new Date(deal.endDate).toLocaleDateString()}
 </p>
 )}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Description
 </label>
 {isEditing ? (
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 rows={3}
 className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white "
 />
 ) : (
 <p className="text-gray-600 ">{deal.description || 'No description'}</p>
 )}
 </div>

 <div>
 <label className="flex items-center space-x-2 cursor-pointer">
 <input
 type="checkbox"
 checked={isEditing ? formData.isActive : deal.isActive}
 onChange={(e) => isEditing && setFormData({ ...formData, isActive: e.target.checked })}
 disabled={!isEditing}
 className="w-4 h-4 text-[#224240] border-gray-300 rounded"
 />
 <span className="text-sm text-gray-700 ">Active Deal</span>
 </label>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'preview' && selectedHomestay && (
 <div className="bg-white rounded-xl p-6 border border-gray-200 ">
 <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Preview</h3>

 <div className="max-w-2xl mx-auto">
 <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 ">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center space-x-2">
 <Zap className="h-6 w-6 text-orange-500" />
 <span className="text-sm font-bold text-orange-600 uppercase">Last Minute Deal</span>
 </div>
 <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-xl">
 <p className="text-2xl font-bold">
 {deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : '$'}
 </p>
 <p className="text-xs">OFF</p>
 </div>
 </div>

 {getHomestayImage(selectedHomestay) ? (
 <img
 src={getHomestayImage(selectedHomestay)}
 alt={selectedHomestay.name}
 className="w-full h-64 object-cover rounded-xl mb-4"
 />
 ) : (
 <div className="w-full h-64 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
 <Home className="h-24 w-24 text-gray-400" />
 </div>
 )}

 <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedHomestay.name}</h3>
 <p className="text-gray-600 mb-4 flex items-center">
 <MapPin className="h-4 w-4 mr-1" />
 {selectedHomestay.address}
 </p>

 {selectedHomestayPrice && (
 <div className="flex items-center justify-between p-4 bg-white rounded-lg mb-4">
 <div>
 <p className="text-sm text-gray-600 line-through">${selectedHomestayPrice}</p>
 <p className="text-3xl font-bold text-green-600 ">
 ${(selectedHomestayPrice - estimatedSavings).toFixed(0)}
 </p>
 <p className="text-xs text-gray-600 ">per night</p>
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-600 ">You Save</p>
 <p className="text-2xl font-bold text-orange-600 ">${estimatedSavings.toFixed(0)}</p>
 </div>
 </div>
 )}

 <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
 <Clock className="h-4 w-4" />
 <span>Valid until {new Date(deal.endDate).toLocaleDateString()}</span>
 <span className="text-orange-600 font-medium">
 ({daysRemaining} days left)
 </span>
 </div>

 {deal.description && (
 <p className="text-gray-700 text-sm mb-4">{deal.description}</p>
 )}

 <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
 Book Now & Save ${estimatedSavings.toFixed(0)}
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'analytics' && (
 <div className="bg-white rounded-xl p-6 border border-gray-200 ">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
 <p className="text-gray-600 ">Analytics data will be available once the backend API is integrated.</p>
 </div>
 )}
 </div>

 <div className="fixed bottom-4 right-4 z-50 space-y-2">
 {toasts.map((t) => (
 <Alert key={t.id} type={t.type} title={t.title} message={t.message} className="min-w-80 shadow-lg" />
 ))}
 </div>

 {/* Delete Confirmation Modal */}
 {showDeleteConfirm && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200 ">
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Deal</h3>
 <p className="text-gray-600 mb-6">
 Are you sure you want to delete this deal? This action cannot be undone.
 </p>
 <div className="flex space-x-3">
 <ActionButton
 onClick={() => setShowDeleteConfirm(false)}
 variant="secondary"
 className="flex-1"
 >
 Cancel
 </ActionButton>
 <ActionButton
 onClick={() => {
 setShowDeleteConfirm(false);
 handleDelete();
 }}
 variant="danger"
 className="flex-1"
 >
 Delete
 </ActionButton>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
