'use client';

import React, { useState, useEffect } from 'react';
import { communityManagerApi, DashboardStats } from '@/lib/api/community-manager';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityManagerApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate percentages
  const confirmedPercentage = stats.totalBookings > 0
    ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
    : 0;
  const pendingPercentage = stats.totalBookings > 0
    ? Math.round((stats.pendingBookings / stats.totalBookings) * 100)
    : 0;
  const cancelledPercentage = stats.totalBookings > 0
    ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100)
    : 0;

  const statGroups = [
    {
      title: 'Overview',
      stats: [
        {
          name: 'Total Communities',
          value: stats.totalCommunities,
          icon: Building2,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
        },
        {
          name: 'Total Bookings',
          value: stats.totalBookings,
          icon: Calendar,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
        },
        {
          name: 'Total Revenue',
          value: `NPR ${stats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
        },
      ],
    },
    {
      title: 'Booking Status',
      stats: [
        {
          name: 'Confirmed Bookings',
          value: stats.confirmedBookings,
          percentage: confirmedPercentage,
          icon: CheckCircle2,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
        },
        {
          name: 'Pending Bookings',
          value: stats.pendingBookings,
          percentage: pendingPercentage,
          icon: Clock,
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
        },
        {
          name: 'Cancelled Bookings',
          value: stats.cancelledBookings,
          percentage: cancelledPercentage,
          icon: XCircle,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics & Analytics</h1>
        <p className="text-gray-600">Comprehensive overview of your communities' performance</p>
      </div>

      {/* Stats Groups */}
      {statGroups.map((group, groupIndex) => (
        <div key={group.title} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (groupIndex * 3 + index) * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        {'percentage' in stat && (
                          <p className="text-sm text-gray-600 mt-2">
                            {stat.percentage}% of total bookings
                          </p>
                        )}
                      </div>
                      <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${stat.textColor}`} />
                      </div>
                    </div>

                    {/* Progress Bar for percentage stats */}
                    {'percentage' in stat && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className={`h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Revenue Breakdown */}
      {stats.totalRevenue > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Total Revenue</h3>
              <p className="text-green-100">Total earnings from confirmed bookings</p>
            </div>
          </div>
          <div className="text-5xl font-bold mb-2">
            NPR {stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-green-100">
            From {stats.confirmedBookings} confirmed booking{stats.confirmedBookings !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Performance Insights
        </h2>
        <div className="space-y-4">
          {/* Confirmation Rate */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Booking Confirmation Rate</span>
              <span className="text-lg font-bold text-emerald-600">{confirmedPercentage}%</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${confirmedPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.confirmedBookings} out of {stats.totalBookings} total bookings confirmed
            </p>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Cancellation Rate</span>
              <span className="text-lg font-bold text-red-600">{cancelledPercentage}%</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                style={{ width: `${cancelledPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.cancelledBookings} out of {stats.totalBookings} total bookings cancelled
            </p>
          </div>

          {/* Average Revenue per Booking */}
          {stats.confirmedBookings > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Average Revenue per Booking</span>
                <span className="text-lg font-bold text-blue-600">
                  NPR {Math.round(stats.totalRevenue / stats.confirmedBookings).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Based on {stats.confirmedBookings} confirmed bookings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
