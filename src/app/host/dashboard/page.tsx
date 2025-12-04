"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { HostDashboard } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function NewHostDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<HostDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadDashboard();
    }
  }, [status]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { revenueStats, bookingStats, homestayStats, recentBookings, pendingBookings } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your property overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <StatsCard
            title="Total Revenue"
            value={`${revenueStats.currency} ${revenueStats.totalRevenue.toLocaleString()}`}
            change={revenueStats.growthPercentage}
            changeLabel="vs last month"
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            color="green"
          />

          {/* This Month Revenue */}
          <StatsCard
            title="This Month"
            value={`${revenueStats.currency} ${revenueStats.revenueThisMonth.toLocaleString()}`}
            subtitle={`Avg: ${revenueStats.currency} ${revenueStats.averageBookingValue.toFixed(0)}`}
            icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
            color="blue"
          />

          {/* Total Bookings */}
          <StatsCard
            title="Total Bookings"
            value={bookingStats.totalBookings.toString()}
            subtitle={`${bookingStats.bookingsThisMonth} this month`}
            icon={<Calendar className="h-6 w-6 text-purple-600" />}
            color="purple"
          />

          {/* Pending Bookings */}
          <StatsCard
            title="Pending Bookings"
            value={bookingStats.pendingBookings.toString()}
            subtitle={`${bookingStats.confirmedBookings} confirmed`}
            icon={<Users className="h-6 w-6 text-orange-600" />}
            color="orange"
          />
        </div>

        {/* Pending Bookings Alert */}
        {pendingBookings.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-orange-700">
                  You have <strong>{pendingBookings.length} pending booking(s)</strong> that need your attention.
                  <Link href="/host/dashboard/bookings?status=PENDING" className="ml-2 underline hover:text-orange-800">
                    View all pending bookings →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Homestay Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
            <Link
              href="/host/dashboard/homestays"
              className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestayStats.map((homestay) => (
              <div key={homestay.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{homestay.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      homestay.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      homestay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {homestay.status}
                    </span>
                  </div>
                  <Link href={`/host/dashboard/homestays/${homestay.id}`}>
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Bookings</p>
                    <p className="font-semibold text-gray-900">{homestay.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-semibold text-gray-900">{revenueStats.currency} {homestay.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rooms</p>
                    <p className="font-semibold text-gray-900">{homestay.totalRooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Occupancy</p>
                    <p className="font-semibold text-gray-900">{homestay.occupancyRate.toFixed(1)}%</p>
                  </div>
                </div>

                {homestay.rating && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">{homestay.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({homestay.reviews} reviews)</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {homestayStats.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't added any properties yet</p>
              <Link
                href="/host/dashboard"
                className="inline-flex items-center px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors"
              >
                Add Your First Property
              </Link>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link
              href="/host/dashboard/bookings"
              className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                          <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.homestayName}</div>
                        <div className="text-sm text-gray-500">{booking.roomType}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.currency} {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

function StatsCard({ title, value, subtitle, change, changeLabel, icon, color }: StatsCardProps) {
  const colorClasses = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {changeLabel && <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>}
      </div>
    </div>
  );
}
