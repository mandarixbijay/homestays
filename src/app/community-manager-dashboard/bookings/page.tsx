'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { communityManagerApi, CommunityBooking } from '@/lib/api/community-manager';
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Home,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get('status') as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | null;

  const [bookings, setBookings] = useState<CommunityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(statusFilter || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  useEffect(() => {
    if (statusFilter) {
      setSelectedStatus(statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = selectedStatus !== 'ALL' ? (selectedStatus as any) : undefined;
      const data = await communityManagerApi.getMyBookings(status);
      setBookings(data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-100',
          icon: CheckCircle2,
        };
      case 'PENDING':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          icon: Clock,
        };
      case 'CANCELLED':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          icon: XCircle,
        };
      case 'COMPLETED':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: CheckCircle2,
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          icon: Clock,
        };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const guestName = booking.guestName || booking.user?.name || '';
    const guestEmail = booking.guestEmail || booking.user?.email || '';
    const guestPhone = booking.guestPhone || booking.user?.mobileNumber || '';
    const communityName = booking.community?.name || '';

    return (
      guestName.toLowerCase().includes(searchLower) ||
      guestEmail.toLowerCase().includes(searchLower) ||
      guestPhone.includes(searchTerm) ||
      communityName.toLowerCase().includes(searchLower) ||
      booking.groupBookingId.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Bookings</h1>
        <p className="text-gray-600">Manage and view all bookings for your communities</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name, email, phone, or community..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-md">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'ALL'
                ? 'Try adjusting your filters or search terms'
                : 'No bookings have been made for your communities yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const guestName = booking.guestName || booking.user?.name || 'Unknown Guest';
            const guestEmail = booking.guestEmail || booking.user?.email || 'N/A';
            const guestPhone = booking.guestPhone || booking.user?.mobileNumber || 'N/A';

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
              >
                {/* Booking Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.community?.name}
                        </h3>
                        <span className={`flex items-center gap-1.5 px-3 py-1 ${statusConfig.bgColor} ${statusConfig.color} text-xs font-semibold rounded-full`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Booking ID: <span className="font-mono">{booking.groupBookingId}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {booking.totalPrice.toLocaleString()} {booking.currency}
                      </div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Check-in</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Check-out</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Guests</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.totalGuests} {booking.totalGuests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Home className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Rooms</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.roomAssignments?.length || 0} Assigned
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Guest Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Name</p>
                          <p className="text-sm font-medium text-gray-900">{guestName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-sm font-medium text-gray-900">{guestEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{guestPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand Details Button */}
                  {booking.roomAssignments && booking.roomAssignments.length > 0 && (
                    <button
                      onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-medium text-sm"
                    >
                      {expandedBooking === booking.id ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Room Assignments
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Room Assignments
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Room Assignments */}
                <AnimatePresence>
                  {expandedBooking === booking.id && booking.roomAssignments && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-white space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Room Assignments</h4>
                        {booking.roomAssignments.map((assignment, idx) => (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Home className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {assignment.room.name}
                                </p>
                                <p className="text-xs text-gray-600">{assignment.homestay.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                {assignment.guestsAssigned} {assignment.guestsAssigned === 1 ? 'Guest' : 'Guests'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
