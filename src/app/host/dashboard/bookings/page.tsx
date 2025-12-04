"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { PaginatedHostBookings, GetBookingsQuery, BookingStatus } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function HostBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<PaginatedHostBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(
    (searchParams.get("status") as BookingStatus) || undefined
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBookings();
  }, [statusFilter, currentPage]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const query: GetBookingsQuery = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
      };
      const data = await hostDashboardApi.getBookings(query);
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

  const handleStatusChange = (status: BookingStatus | "ALL") => {
    setStatusFilter(status === "ALL" ? undefined : status);
    setCurrentPage(1);
  };

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await hostDashboardApi.confirmBooking(bookingId);
      toast({
        title: "Success",
        description: "Booking confirmed successfully",
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking",
        variant: "destructive",
      });
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
              <p className="text-gray-600 mt-1">Manage all your property bookings</p>
            </div>
            <Link
              href="/host/dashboard"
              className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                active={statusFilter === undefined}
                onClick={() => handleStatusChange("ALL")}
              />
              <FilterButton
                label="Pending"
                active={statusFilter === "PENDING"}
                onClick={() => handleStatusChange("PENDING")}
                color="yellow"
              />
              <FilterButton
                label="Confirmed"
                active={statusFilter === "CONFIRMED"}
                onClick={() => handleStatusChange("CONFIRMED")}
                color="green"
              />
              <FilterButton
                label="Cancelled"
                active={statusFilter === "CANCELLED"}
                onClick={() => handleStatusChange("CANCELLED")}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {bookings.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.data.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                          <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                          <div className="text-sm text-gray-500">{booking.guestPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.homestayName}</div>
                          <div className="text-sm text-gray-500">{booking.roomType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.currency} {booking.totalPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.adults} adults, {booking.children} children
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/host/dashboard/bookings/${booking.id}`}
                              className="text-[#214B3F] hover:text-[#1a3d32] flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                            {booking.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmBooking(booking.id)}
                                className="text-green-600 hover:text-green-700 flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * 10, bookings.total)}</span> of{" "}
                    <span className="font-medium">{bookings.total}</span> results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(bookings.totalPages, p + 1))}
                      disabled={currentPage === bookings.totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {statusFilter ? `No ${statusFilter.toLowerCase()} bookings found` : "No bookings yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'yellow' | 'green' | 'red';
}

function FilterButton({ label, active, onClick, color }: FilterButtonProps) {
  const activeClasses = color ? {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  }[color] : 'bg-[#214B3F] text-white border-[#214B3F]';

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
        active ? activeClasses : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
