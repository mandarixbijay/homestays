"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { HostBookingDetails, BookingStatus } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  User,
  Home,
  DollarSign,
  CreditCard,
  XCircle,
  CheckCircle,
  ChevronLeft,
  Clock,
  Users,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const bookingId = parseInt(params.id as string);

  const [booking, setBooking] = useState<HostBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getBookingDetails(bookingId);
      setBooking(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load booking details",
        variant: "destructive",
      });
      router.push("/host/new-dashboard/bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason || cancelReason.length < 10) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason (min 10 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      setCancelling(true);
      await hostDashboardApi.cancelBooking(bookingId, { reason: cancelReason });
      toast({
        title: "Success",
        description: "Booking cancelled successfully. Guest will be notified.",
      });
      setShowCancelModal(false);
      loadBookingDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await hostDashboardApi.confirmBooking(bookingId);
      toast({
        title: "Success",
        description: "Booking confirmed successfully",
      });
      loadBookingDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking",
        variant: "destructive",
      });
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const totalPayment = booking.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/host/new-dashboard/bookings"
            className="inline-flex items-center text-sm text-[#214B3F] hover:underline mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Bookings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
              <p className="text-gray-600 mt-1">
                {booking.groupBookingId ? `Group: ${booking.groupBookingId}` : "Single booking"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {booking.status === "PENDING" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This booking is pending confirmation. Please review and take action.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleConfirmBooking}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </button>
                {booking.canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {booking.canCancel && booking.status === "CONFIRMED" && (
          <div className="mb-6">
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </button>
          </div>
        )}

        {!booking.canCancel && booking.cancellationNotAllowedReason && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> {booking.cancellationNotAllowedReason}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Guest Name</p>
                    <p className="font-medium text-gray-900">{booking.guestName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${booking.guestEmail}`}
                      className="font-medium text-[#214B3F] hover:underline"
                    >
                      {booking.guestEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a
                      href={`tel:${booking.guestPhone}`}
                      className="font-medium text-[#214B3F] hover:underline"
                    >
                      {booking.guestPhone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Party Size</p>
                    <p className="font-medium text-gray-900">
                      {booking.adults} {booking.adults === 1 ? "Adult" : "Adults"}
                      {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "Child" : "Children"}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property & Room */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property & Room</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Homestay</p>
                    <Link
                      href={`/host/new-dashboard/homestays/${booking.homestayId}`}
                      className="font-medium text-[#214B3F] hover:underline"
                    >
                      {booking.homestayName}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium text-gray-900">{booking.roomName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">
                      {checkInDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">
                      {checkOutDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Number of Nights</p>
                    <p className="font-medium text-gray-900">
                      {booking.numberOfNights} {booking.numberOfNights === 1 ? "Night" : "Nights"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              {booking.payments.length > 0 ? (
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Transaction: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No payments recorded</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Price</span>
                  <span className="font-medium text-gray-900">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    {booking.currency} {totalPayment.toLocaleString()}
                  </span>
                </div>
                {totalPayment < booking.totalPrice && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-medium">Remaining</span>
                    <span className="font-semibold text-red-600">
                      {booking.currency} {(booking.totalPrice - totalPayment).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Booking Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancelling this booking. The guest will be notified and
              a full refund will be processed automatically.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason (min 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#214B3F] min-h-[120px]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling || cancelReason.length < 10}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
