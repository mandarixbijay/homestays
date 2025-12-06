"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  MapPin,
  Filter,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type {
  PaginatedBookings,
  GetBookingsQuery,
  BookingStatus,
} from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<PaginatedBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get status from URL if present
    const status = searchParams.get("status");
    if (status) {
      setStatusFilter(status as BookingStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const query: GetBookingsQuery = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter) {
        query.status = statusFilter as BookingStatus;
      }

      const data = await guestDashboardApi.getBookings(query);
      setBookings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load bookings",
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
      case "EXPIRED":
        return "bg-gray-100 text-gray-700";
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

  const filteredBookings =
    bookings?.data.filter((booking) =>
      booking.homestayName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading || !bookings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                View and manage all your homestay bookings
              </p>
            </div>
            <Link
              href="/guest/dashboard"
              className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by homestay name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as BookingStatus | "");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {statusFilter && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                <Filter className="h-3 w-3" />
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:text-teal-900"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {filteredBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/guest/dashboard/bookings/${booking.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.homestayName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {booking.roomType}
                          </p>
                          {booking.groupBookingId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Booking ID: {booking.groupBookingId}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(booking.checkInDate)} -{" "}
                            {formatDate(booking.checkOutDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                            {booking.children > 0 &&
                              `, ${booking.children} Child${
                                booking.children > 1 ? "ren" : ""
                              }`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="text-xl font-bold text-gray-900">
                          {booking.currency} {booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, bookings.total)}
                  </span>{" "}
                  of <span className="font-medium">{bookings.total}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {bookings.totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(bookings.totalPages, p + 1))
                    }
                    disabled={currentPage === bookings.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter
                ? "Try adjusting your filters"
                : "Start exploring homestays and make your first booking"}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
            >
              Explore Homestays
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
