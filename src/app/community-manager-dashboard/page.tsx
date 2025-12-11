'use client';

import React, { useState, useEffect } from 'react';
import { communityManagerApi, DashboardStats } from '@/lib/api/community-manager';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CommunityManagerDashboard() {
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
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
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

  const statCards = [
    {
      name: 'Total Communities',
      value: stats?.totalCommunities || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/community-manager-dashboard/communities',
    },
    {
      name: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/community-manager-dashboard/bookings',
    },
    {
      name: 'Confirmed Bookings',
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      link: '/community-manager-dashboard/bookings?status=CONFIRMED',
    },
    {
      name: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      link: '/community-manager-dashboard/bookings?status=PENDING',
    },
    {
      name: 'Cancelled Bookings',
      value: stats?.cancelledBookings || 0,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/community-manager-dashboard/bookings?status=CANCELLED',
    },
    {
      name: 'Total Revenue',
      value: `NPR ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/community-manager-dashboard/stats',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your communities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.link}>
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${stat.textColor}`} />
                      </div>
                    </div>
                  </div>
                  <div className={`h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">Navigate to different sections</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/community-manager-dashboard/communities">
              <button className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all shadow-md hover:shadow-lg">
                <Building2 className="h-5 w-5" />
                <span className="font-medium">View Communities</span>
              </button>
            </Link>

            <Link href="/community-manager-dashboard/bookings">
              <button className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all shadow-md hover:shadow-lg">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">View Bookings</span>
              </button>
            </Link>

            <Link href="/community-manager-dashboard/bookings?status=PENDING">
              <button className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all shadow-md hover:shadow-lg">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Pending Bookings</span>
              </button>
            </Link>

            <Link href="/community-manager-dashboard/stats">
              <button className="w-full flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all shadow-md hover:shadow-lg">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">View Statistics</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      {stats && stats.pendingBookings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {stats.pendingBookings} Pending Booking{stats.pendingBookings !== 1 ? 's' : ''}
              </h3>
              <p className="text-orange-100">
                You have bookings waiting for confirmation
              </p>
            </div>
            <Link href="/community-manager-dashboard/bookings?status=PENDING">
              <button className="px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold shadow-lg">
                View Pending
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
