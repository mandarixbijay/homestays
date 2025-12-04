"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { PaginatedHostReviews, HostReview } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function HostReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<PaginatedHostReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [currentPage, minRating]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getReviews({
        page: currentPage,
        limit: 10,
        minRating,
      });
      setReviews(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilter = (rating: number | undefined) => {
    setMinRating(rating);
    setCurrentPage(1);
  };

  const handleRespondToReview = async (reviewId: number) => {
    if (!responseText || responseText.length < 10) {
      toast({
        title: "Error",
        description: "Please write a response (min 10 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await hostDashboardApi.respondToReview(reviewId, responseText);
      toast({
        title: "Success",
        description: "Response sent successfully. Guest will be notified.",
      });
      setRespondingTo(null);
      setResponseText("");
      loadReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !reviews) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
              <p className="text-gray-600 mt-1">Manage guest reviews and feedback</p>
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
              <span className="text-sm font-medium text-gray-700">Minimum rating:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <RatingFilterButton
                label="All Ratings"
                active={minRating === undefined}
                onClick={() => handleRatingFilter(undefined)}
              />
              {[5, 4, 3].map((rating) => (
                <RatingFilterButton
                  key={rating}
                  label={`${rating}+ Stars`}
                  active={minRating === rating}
                  onClick={() => handleRatingFilter(rating)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.data.length > 0 ? (
            <>
              {reviews.data.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{review.homestayName}</span>
                        {review.roomName && (
                          <>
                            <span>•</span>
                            <span>{review.roomName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )}

                  {/* Stay Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Stay period</p>
                    <p className="text-sm text-gray-700">
                      {new Date(review.checkInDate).toLocaleDateString()} -{" "}
                      {new Date(review.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Respond Button */}
                  {respondingTo === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response to the guest... (min 10 characters)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#214B3F] min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText("");
                          }}
                          disabled={submitting}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespondToReview(review.id)}
                          disabled={submitting || responseText.length < 10}
                          className="px-4 py-2 text-sm bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          {submitting ? "Sending..." : "Send Response"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className="inline-flex items-center gap-2 text-sm text-[#214B3F] hover:underline"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Respond to Review
                    </button>
                  )}
                </div>
              ))}

              {/* Pagination */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * 10, reviews.total)}</span> of{" "}
                    <span className="font-medium">{reviews.total}</span> reviews
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
                      onClick={() => setCurrentPage((p) => Math.min(reviews.totalPages, p + 1))}
                      disabled={currentPage === reviews.totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {minRating ? `No reviews with ${minRating}+ stars found` : "No reviews yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RatingFilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function RatingFilterButton({ label, active, onClick }: RatingFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
        active
          ? "bg-[#214B3F] text-white border-[#214B3F]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}
