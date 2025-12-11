'use client';

import React, { useState, useEffect } from 'react';
import { communityManagerApi, CommunityManagerProfile } from '@/lib/api/community-manager';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CommunityManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityManagerApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View your profile information and managed communities</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Profile Header with Gradient */}
        <div className="relative h-36 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          {/* Active Badge */}
          <div className="absolute top-4 right-4 z-10">
            {profile.isActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-emerald-600 text-xs font-semibold rounded-full shadow-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
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
        <div className="relative px-8 -mt-20 pb-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl ring-4 ring-white">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            {/* Online Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-md"></div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-8 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.fullName}</h2>
          <p className="text-sm text-emerald-600 font-medium mb-6">Community Manager</p>

          {/* Contact Information */}
          <div className="space-y-4 mb-6">
            {profile.email && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">Email Address</p>
                  <p className="text-base font-semibold text-gray-900">{profile.email}</p>
                </div>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}

            {profile.alternatePhone && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">Alternate Phone</p>
                  <p className="text-base font-semibold text-gray-900">{profile.alternatePhone}</p>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">Address</p>
                  <p className="text-base font-semibold text-gray-900">{profile.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-xs text-gray-600 font-medium">Joined</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-gray-500" />
                <p className="text-xs text-gray-600 font-medium">Communities</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {profile.communities.length} Assigned
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assigned Communities */}
      {profile.communities && profile.communities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            Assigned Communities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.communities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-emerald-300 p-4 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    {community.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                  {community.name}
                </h3>
                <p className="text-xs text-gray-600">Community ID: {community.id}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Communities Assigned */}
      {(!profile.communities || profile.communities.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center"
        >
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Communities Assigned</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You don't have any communities assigned to you yet. Contact the administrator to get assigned to communities.
          </p>
        </motion.div>
      )}
    </div>
  );
}
