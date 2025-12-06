"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Heart,
  Star,
  MapPin,
  DollarSign,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type { Favorite } from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await guestDashboardApi.getFavorites();
      setFavorites(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (homestayId: number) => {
    try {
      setRemovingId(homestayId);
      await guestDashboardApi.removeFavorite(homestayId);
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
      // Remove from local state
      setFavorites(favorites.filter((f) => f.homestayId !== homestayId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-1">
                Homestays you've saved for later
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

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600 fill-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Saved Homestays
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {favorites.length}
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48">
                  {favorite.homestayImages.length > 0 ? (
                    <Image
                      src={favorite.homestayImages[0]}
                      alt={favorite.homestayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.homestayId)}
                    disabled={removingId === favorite.homestayId}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {removingId === favorite.homestayId ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Heart className="h-5 w-5 text-red-600 fill-red-600" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {favorite.homestayName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {favorite.homestayAddress}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    {favorite.rating !== null && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {favorite.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {favorite.reviews > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4" />
                        <span>{favorite.reviews} reviews</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Starting from</p>
                      <p className="text-lg font-bold text-[#214B3F]">
                        {favorite.currency} {favorite.startingPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">per night</p>
                    </div>
                    <Link
                      href={`/homestay/${favorite.homestayId}`}
                      className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Saved on {formatDate(favorite.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring homestays and save your favorites for easy access
              later
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
