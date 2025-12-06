"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type { PaginatedRefunds, RefundStatus } from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";

export default function RefundsPage() {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<PaginatedRefunds | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRefunds();
  }, [currentPage]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const data = await guestDashboardApi.getRefunds(currentPage, 10);
      setRefunds(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load refunds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: RefundStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate stats
  const stats = refunds
    ? {
        total: refunds.total,
        pending: refunds.data.filter((r) => r.status === "PENDING").length,
        approved: refunds.data.filter((r) => r.status === "APPROVED").length,
        completed: refunds.data.filter((r) => r.status === "COMPLETED").length,
        rejected: refunds.data.filter((r) => r.status === "REJECTED").length,
        totalAmount: refunds.data.reduce((sum, r) => sum + r.amount, 0),
      }
    : null;

  if (loading || !refunds) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading refunds...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Refunds</h1>
              <p className="text-gray-600 mt-1">
                Track your refund requests and status
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

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-teal-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    NPR {stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-cyan-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refunds List */}
        {refunds.data.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {refunds.data.map((refund) => (
                <div
                  key={refund.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Refund Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(refund.status)}
                            <h3 className="text-lg font-semibold text-gray-900">
                              Refund #{refund.id}
                            </h3>
                          </div>
                          {refund.homestayName && (
                            <p className="text-sm text-gray-600">
                              {refund.homestayName}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            refund.status
                          )}`}
                        >
                          {refund.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Reason:</span>{" "}
                        {refund.reason}
                      </p>

                      {refund.adminNotes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">Admin Note:</span>{" "}
                            {refund.adminNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Requested on {formatDate(refund.createdAt)}</span>
                        </div>
                        {refund.processedByName && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Processed by {refund.processedByName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Refund Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {refund.currency} {refund.amount.toLocaleString()}
                      </p>
                      <Link
                        href={`/guest/dashboard/bookings/${refund.bookingId}`}
                        className="text-sm text-[#214B3F] hover:underline mt-2 inline-block"
                      >
                        View booking →
                      </Link>
                    </div>
                  </div>
                </div>
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
                    {Math.min(currentPage * 10, refunds.total)}
                  </span>{" "}
                  of <span className="font-medium">{refunds.total}</span> results
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
                    Page {currentPage} of {refunds.totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(refunds.totalPages, p + 1))
                    }
                    disabled={currentPage === refunds.totalPages}
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
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No refund requests
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any refund requests yet
            </p>
            <Link
              href="/guest/dashboard/bookings"
              className="inline-block px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
            >
              View Bookings
            </Link>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Refund Processing Information
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Refund requests are typically reviewed within 3-5 business days</li>
                <li>
                  Once approved, refunds are processed within 5-7 business days
                </li>
                <li>
                  You'll receive email notifications when your refund status changes
                </li>
                <li>
                  For urgent inquiries, please contact our support team
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
