'use client';

import React, { useState, useEffect } from 'react';
import { communityManagerApi, ManagedCommunity } from '@/lib/api/community-manager';
import {
  Building2,
  Home,
  Users,
  MapPin,
  DollarSign,
  Utensils,
  Activity,
  Image as ImageIcon,
  Loader2,
  XCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<ManagedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCommunity, setExpandedCommunity] = useState<number | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityManagerApi.getMyCommunities();
      setCommunities(data);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError(err.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Communities</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchCommunities}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Communities Assigned</h3>
          <p className="text-gray-600">
            You don't have any communities assigned to you yet. Contact the administrator to get assigned to communities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Communities</h1>
        <p className="text-gray-600">
          Manage and view details of your {communities.length} assigned {communities.length === 1 ? 'community' : 'communities'}
        </p>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {communities.map((community, index) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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

              {/* Expand Details Button */}
              <button
                onClick={() => setExpandedCommunity(expandedCommunity === community.id ? null : community.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-medium text-sm"
              >
                {expandedCommunity === community.id ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Details
                  </>
                )}
              </button>
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
                            </motion.div>
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
      </div>
    </div>
  );
}
