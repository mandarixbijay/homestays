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
  TrendingDown,
  Star,
  Building,
  ArrowUpRight,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  BarChart3,
  Zap,
  Target,
  Award,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function HostDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<HostDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 5;

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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { revenueStats, bookingStats, homestayStats, recentBookings, pendingBookings } = dashboard;

  // Calculate additional metrics
  const totalProperties = homestayStats.length;
  const approvedProperties = homestayStats.filter(h => h.status === 'APPROVED').length;
  const avgOccupancy = totalProperties > 0
    ? homestayStats.reduce((sum, h) => sum + h.occupancyRate, 0) / totalProperties
    : 0;
  const avgRating = homestayStats.filter(h => h.rating).length > 0
    ? homestayStats.reduce((sum, h) => sum + (h.rating || 0), 0) / homestayStats.filter(h => h.rating).length
    : 0;

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Upcoming check-ins (bookings in next 7 days)
  const upcomingCheckIns = recentBookings.filter(booking => {
    const checkIn = new Date(booking.checkInDate);
    const today = new Date();
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && booking.status === 'CONFIRMED';
  });

  // Pagination for properties
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = homestayStats.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(homestayStats.length / propertiesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Greeting */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {greeting}, {session?.user?.name || "Host"}
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your properties today
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/host/dashboard/homestays/new"
                className="px-4 py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
              >
                <Plus className="h-5 w-5" />
                Add Property
              </Link>
              <Link
                href="/host/dashboard/bookings"
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-teal-700 hover:text-teal-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Calendar className="h-5 w-5" />
                Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        {pendingBookings.length > 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  Action Required
                </h3>
                <p className="text-amber-800 mb-3">
                  You have <strong>{pendingBookings.length} pending booking{pendingBookings.length > 1 ? 's' : ''}</strong> waiting for confirmation. Quick response increases guest satisfaction.
                </p>
                <Link
                  href="/host/dashboard/bookings?status=PENDING"
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Review Pending Bookings
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-700" />
              </div>
              {revenueStats.growthPercentage !== 0 && (
                <div className="flex items-center gap-1">
                  {revenueStats.growthPercentage >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${revenueStats.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {Math.abs(revenueStats.growthPercentage).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {revenueStats.currency} {revenueStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Avg per booking: {revenueStats.currency} {revenueStats.averageBookingValue.toFixed(0)}
            </p>
          </div>

          {/* This Month Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-teal-700" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {revenueStats.currency} {revenueStats.revenueThisMonth.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Last month: {revenueStats.currency} {revenueStats.revenueLastMonth.toLocaleString()}
            </p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-cyan-700" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{bookingStats.totalBookings}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{bookingStats.confirmedBookings} confirmed</span>
              <span>•</span>
              <span>{bookingStats.pendingBookings} pending</span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-sky-700" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Occupancy</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{avgOccupancy.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${avgOccupancy}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedProperties}</p>
                <p className="text-sm text-gray-600">Active Properties</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingCheckIns.length}</p>
                <p className="text-sm text-gray-600">Check-ins (7d)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-cyan-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.bookingsThisMonth}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Properties & Bookings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Properties Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-teal-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Your Properties</h2>
                    <p className="text-teal-100">Manage and monitor your listings</p>
                  </div>
                  <Link
                    href="/host/dashboard/homestays"
                    className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2 font-medium"
                  >
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {homestayStats.length > 0 ? (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rooms</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Occupancy</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {currentProperties.map((homestay) => (
                            <tr key={homestay.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Home className="h-5 w-5 text-teal-700" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{homestay.name}</p>
                                    {homestay.rating && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs text-gray-600">{homestay.rating.toFixed(1)} ({homestay.reviews})</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  homestay.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                  homestay.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {homestay.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{homestay.totalBookings}</td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{homestay.totalRevenue.toLocaleString()}</td>
                              <td className="px-4 py-4 text-sm text-gray-900">{homestay.totalRooms}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-teal-600 h-1.5 rounded-full"
                                      style={{ width: `${homestay.occupancyRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-900 w-10 text-right">{homestay.occupancyRate.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {homestay.rating ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-medium text-gray-900">{homestay.rating.toFixed(1)}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/host/dashboard/homestays/${homestay.id}`}
                                    className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <Link
                                    href={`/host/dashboard/homestays/${homestay.id}/edit`}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Property"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Showing {indexOfFirstProperty + 1} to {Math.min(indexOfLastProperty, homestayStats.length)} of {homestayStats.length} properties
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                    <p className="text-gray-600 mb-6">Start your hosting journey by adding your first property</p>
                    <Link
                      href="/host/dashboard/homestays/new"
                      className="inline-flex items-center px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors gap-2 font-medium"
                    >
                      <Plus className="h-5 w-5" />
                      Add Your First Property
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                      <p className="text-sm text-gray-600">Latest reservations</p>
                    </div>
                  </div>
                  <Link
                    href="/host/dashboard/bookings"
                    className="text-sm text-teal-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/host/dashboard/bookings/${booking.id}`}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-teal-700 hover:shadow-sm transition-all group"
                      >
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold">
                          {booking.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                            {booking.guestName}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{booking.homestayName} • {booking.roomType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{booking.currency} {booking.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-teal-700 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/host/dashboard/homestays/new"
                  className="block w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-center font-medium"
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  Add New Property
                </Link>
                <Link
                  href="/host/dashboard/bookings"
                  className="block w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-center font-medium"
                >
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Manage Bookings
                </Link>
                <Link
                  href="/host/dashboard/reviews"
                  className="block w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-center font-medium"
                >
                  <Star className="h-5 w-5 inline mr-2" />
                  View Reviews
                </Link>
                <Link
                  href="/host/dashboard/analytics"
                  className="block w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all text-center font-medium"
                >
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  Analytics
                </Link>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-700" />
                Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Booking Conversion</span>
                    <span className="text-sm font-bold text-gray-900">
                      {bookingStats.totalBookings > 0
                        ? ((bookingStats.confirmedBookings / bookingStats.totalBookings) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: bookingStats.totalBookings > 0
                          ? `${(bookingStats.confirmedBookings / bookingStats.totalBookings) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Avg Occupancy</span>
                    <span className="text-sm font-bold text-gray-900">{avgOccupancy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${avgOccupancy}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Guest Satisfaction</span>
                    <span className="text-sm font-bold text-gray-900">
                      {avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: avgRating > 0 ? `${(avgRating / 5) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Check-ins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-700" />
                Upcoming Check-ins
              </h3>
              {upcomingCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {upcomingCheckIns.slice(0, 5).map((booking) => {
                    const checkIn = new Date(booking.checkInDate);
                    const today = new Date();
                    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={booking.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-teal-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{booking.guestName}</p>
                          <p className="text-xs text-gray-600 truncate">{booking.homestayName}</p>
                          <p className="text-xs text-teal-700 font-medium mt-1">
                            {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No upcoming check-ins</p>
                </div>
              )}
            </div>

            {/* Monthly Target */}
            <div className="bg-teal-50 rounded-xl border border-teal-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-700" />
                This Month's Progress
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Revenue</span>
                    <span className="text-sm font-bold text-gray-900">
                      {revenueStats.currency} {revenueStats.revenueThisMonth.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {revenueStats.revenueLastMonth > 0
                      ? `${((revenueStats.revenueThisMonth / revenueStats.revenueLastMonth) * 100).toFixed(0)}% of last month`
                      : 'First month tracking'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Bookings</span>
                    <span className="text-sm font-bold text-gray-900">{bookingStats.bookingsThisMonth}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {bookingStats.bookingsLastMonth > 0
                      ? `${((bookingStats.bookingsThisMonth / bookingStats.bookingsLastMonth) * 100).toFixed(0)}% of last month`
                      : 'First month tracking'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
