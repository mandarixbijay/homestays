"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Phone,
  Users,
  DollarSign,
  CreditCard,
  Download,
  XCircle,
  Star,
  CheckCircle,
  AlertCircle,
  Home,
  Bed,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type { BookingDetails, CreateReviewDto } from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = parseInt(params.id as string);

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState<CreateReviewDto>({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await guestDashboardApi.getBookingDetails(bookingId);
      setBooking(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load booking details",
        variant: "destructive",
      });
      // Redirect back to bookings if not found
      if (error.message.includes("not found")) {
        setTimeout(() => router.push("/guest/dashboard/bookings"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const result = await guestDashboardApi.cancelBooking(bookingId);
      toast({
        title: "Success",
        description: result.message,
      });
      setShowCancelDialog(false);
      // Reload booking details
      await loadBookingDetails();
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

  const handleDownloadReceipt = async () => {
    try {
      const receipt = await guestDashboardApi.getBookingReceipt(bookingId);
      // Create a simple receipt page and print it
      const receiptWindow = window.open("", "_blank");
      if (receiptWindow) {
        receiptWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${receipt.receiptNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                h1 { color: #214B3F; }
                .header { border-bottom: 2px solid #214B3F; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 30px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .label { font-weight: bold; }
                .total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #ccc; padding-top: 10px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Nepal Homestays</h1>
                <p>Receipt Number: ${receipt.receiptNumber}</p>
                <p>Date: ${new Date(receipt.bookingDate).toLocaleDateString()}</p>
              </div>
              <div class="section">
                <h2>Guest Information</h2>
                <p><span class="label">Name:</span> ${receipt.guestName}</p>
                <p><span class="label">Email:</span> ${receipt.guestEmail}</p>
                <p><span class="label">Phone:</span> ${receipt.guestPhone}</p>
              </div>
              <div class="section">
                <h2>Booking Details</h2>
                <p><span class="label">Homestay:</span> ${receipt.homestayName}</p>
                <p><span class="label">Address:</span> ${receipt.homestayAddress}</p>
                <p><span class="label">Room:</span> ${receipt.roomName}</p>
                <p><span class="label">Check-in:</span> ${new Date(receipt.checkInDate).toLocaleDateString()}</p>
                <p><span class="label">Check-out:</span> ${new Date(receipt.checkOutDate).toLocaleDateString()}</p>
                <p><span class="label">Nights:</span> ${receipt.numberOfNights}</p>
                <p><span class="label">Guests:</span> ${receipt.adults} Adult(s), ${receipt.children} Child(ren)</p>
              </div>
              <div class="section">
                <h2>Payment Summary</h2>
                <div class="row"><span class="label">Room Price per Night:</span> <span>${receipt.currency} ${receipt.roomPricePerNight.toFixed(2)}</span></div>
                <div class="row"><span class="label">Subtotal:</span> <span>${receipt.currency} ${receipt.subtotal.toFixed(2)}</span></div>
                <div class="row"><span class="label">Tax:</span> <span>${receipt.currency} ${receipt.taxAmount.toFixed(2)}</span></div>
                <div class="row total"><span class="label">Total:</span> <span>${receipt.currency} ${receipt.totalAmount.toFixed(2)}</span></div>
              </div>
              <div class="section">
                <h2>Payment Information</h2>
                <p><span class="label">Method:</span> ${receipt.paymentMethod}</p>
                <p><span class="label">Status:</span> ${receipt.paymentStatus}</p>
                ${receipt.transactionId ? `<p><span class="label">Transaction ID:</span> ${receipt.transactionId}</p>` : ""}
                ${receipt.paymentDate ? `<p><span class="label">Payment Date:</span> ${new Date(receipt.paymentDate).toLocaleDateString()}</p>` : ""}
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        receiptWindow.document.close();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const result = await guestDashboardApi.createReview(bookingId, reviewData);
      toast({
        title: "Success",
        description: result.message,
      });
      setShowReviewDialog(false);
      // Optionally reload booking to show review was submitted
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const canLeaveReview = () => {
    if (!booking) return false;
    const checkoutDate = new Date(booking.checkOutDate);
    const now = new Date();
    return booking.status === "CONFIRMED" && checkoutDate < now;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/guest/dashboard/bookings"
            className="text-sm text-[#214B3F] hover:underline flex items-center gap-1 mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Bookings
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {booking.homestayName}
              </h1>
              <p className="text-gray-600 mt-1">{booking.roomName}</p>
              {booking.groupBookingId && (
                <p className="text-sm text-gray-500 mt-2">
                  Booking ID: {booking.groupBookingId}
                </p>
              )}
            </div>
            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Homestay Images */}
            {booking.homestayImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Homestay Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {booking.homestayImages.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${booking.homestayName} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Check-in</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Check-out</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Guests</p>
                    <p className="text-sm text-gray-600">
                      {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                      {booking.children > 0 &&
                        `, ${booking.children} Child${
                          booking.children > 1 ? "ren" : ""
                        }`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bed className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nights</p>
                    <p className="text-sm text-gray-600">
                      {booking.numberOfNights} night
                      {booking.numberOfNights > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Guest Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.guestName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.guestEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.guestPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Room Information
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {booking.roomDescription}
              </p>
              {booking.roomImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {booking.roomImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${booking.roomName} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment History
              </h2>
              {booking.payments.length > 0 ? (
                <div className="space-y-4">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.paymentMethod}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Txn ID: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                            payment.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No payment records</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Summary
              </h3>
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {booking.numberOfNights} night(s)
                  </span>
                  <span className="font-medium text-gray-900">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#214B3F]">
                  {booking.currency} {booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Homestay Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Homestay Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{booking.homestayAddress}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {booking.homestayContactNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>

                {canLeaveReview() && (
                  <button
                    onClick={() => setShowReviewDialog(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    Leave a Review
                  </button>
                )}

                {booking.canCancel && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Booking
                  </button>
                )}

                {!booking.canCancel && booking.cancellationNotAllowedReason && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        {booking.cancellationNotAllowedReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Booking
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Leave a Review
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewDialog(false)}
                disabled={submittingReview}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
