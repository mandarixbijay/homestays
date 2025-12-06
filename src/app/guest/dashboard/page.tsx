"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  MapPin,
  Users,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type { GuestDashboard, RecentBooking } from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";

export default function GuestDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<GuestDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await guestDashboardApi.getDashboard();
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your bookings and activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.bookingStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#214B3F]/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#214B3F]" />
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.bookingStats.upcoming}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.bookingStats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.spendingStats.currency}{" "}
                  {dashboard.spendingStats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Spending Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Spending Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#214B3F]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#214B3F]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average per Booking</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboard.spendingStats.currency}{" "}
                  {dashboard.spendingStats.averageBookingAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful Payments</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboard.spendingStats.successfulPayments}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboard.bookingStats.cancelled}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Bookings
                </h2>
                <Link
                  href="/guest/dashboard/bookings?status=CONFIRMED"
                  className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboard.upcomingBookings.length > 0 ? (
                dashboard.upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} getStatusBadgeClass={getStatusBadgeClass} formatDate={formatDate} />
                ))
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#214B3F]/90 transition-colors"
                  >
                    Explore Homestays
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Bookings
                </h2>
                <Link
                  href="/guest/dashboard/bookings"
                  className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboard.recentBookings.length > 0 ? (
                dashboard.recentBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} getStatusBadgeClass={getStatusBadgeClass} formatDate={formatDate} />
                ))
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No bookings yet</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#214B3F]/90 transition-colors"
                  >
                    Explore Homestays
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({
  booking,
  getStatusBadgeClass,
  formatDate,
}: {
  booking: RecentBooking;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <Link
      href={`/guest/dashboard/bookings/${booking.id}`}
      className="block p-6 hover:bg-gray-50/70 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-[#214B3F] transition-colors">{booking.homestayName}</h3>
          <p className="text-sm text-muted-foreground mt-1">{booking.roomType}</p>
        </div>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>
            {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
            {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">
          {booking.currency} {booking.totalPrice.toLocaleString()}
        </p>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#214B3F] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
