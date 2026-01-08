"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  MapPin,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
  X,
  Home,
  Calendar,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { guestDashboardApi } from "@/lib/api/guest-dashboard-api";
import type { Favorite } from "@/types/guest-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 9;

type SortOption = "date_desc" | "date_asc" | "price_low" | "price_high" | "rating";
type ViewMode = "grid" | "list";

export default function FavoritesPage() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFavorites();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true);
      const timer = setTimeout(() => {
        setSearchLoading(false);
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

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

  const handleRemoveFavorite = async (homestayId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setRemovingId(homestayId);
      await guestDashboardApi.removeFavorite(homestayId);
      toast({
        title: "Removed from favorites",
        description: "The homestay has been removed from your favorites.",
      });
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

  // Filter and sort favorites
  const filteredAndSortedFavorites = useMemo(() => {
    let result = [...favorites];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.homestayName.toLowerCase().includes(query) ||
          f.homestayAddress.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "date_desc":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date_asc":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price_low":
        result.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price_high":
        result.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [favorites, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFavorites.length / ITEMS_PER_PAGE);
  const paginatedFavorites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedFavorites.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedFavorites, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const generateProfileSlug = (name: string, address: string, id: number) => {
    const combined = `${name}-${address}`;
    const slugified = combined
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return `${slugified}-id-${id}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-br from-[#214B3F] via-[#2d6654] to-[#214B3F] pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-64 bg-white/20 mb-4" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-12 flex-1 max-w-md" />
            <Skeleton className="h-12 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="h-56 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between pt-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#214B3F] via-[#2d6654] to-[#214B3F] pt-20 pb-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/guest/dashboard"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-400 fill-red-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">My Favorites</h1>
              </div>
              <p className="text-white/70 text-lg max-w-xl">
                Your curated collection of dream homestays. {favorites.length} saved destination{favorites.length !== 1 ? "s" : ""} waiting for you.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Total Saved</p>
                <p className="text-2xl font-bold text-white">{favorites.length}</p>
              </div>
              {favorites.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Avg. Price</p>
                  <p className="text-2xl font-bold text-white">
                    {favorites[0]?.currency}{" "}
                    {Math.round(
                      favorites.reduce((sum, f) => sum + f.startingPrice, 0) / favorites.length
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length > 0 ? (
          <>
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search your favorites by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-10 h-12 rounded-xl border-gray-200 focus:border-[#214B3F] focus:ring-[#214B3F] text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {searchLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#214B3F] animate-spin" />
                  )}
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full lg:w-56 h-12 rounded-xl border-gray-200">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Recently Added
                      </div>
                    </SelectItem>
                    <SelectItem value="date_asc">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Oldest First
                      </div>
                    </SelectItem>
                    <SelectItem value="price_low">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Price: Low to High
                      </div>
                    </SelectItem>
                    <SelectItem value="price_high">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 rotate-180" />
                        Price: High to Low
                      </div>
                    </SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Highest Rated
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2.5 rounded-lg transition-all",
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-[#214B3F]"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2.5 rounded-lg transition-all",
                      viewMode === "list"
                        ? "bg-white shadow-sm text-[#214B3F]"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    aria-label="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {searchQuery ? (
                    <>
                      Found <span className="font-semibold text-gray-900">{filteredAndSortedFavorites.length}</span> result{filteredAndSortedFavorites.length !== 1 ? "s" : ""}
                      {" "}for "{searchQuery}"
                    </>
                  ) : (
                    <>
                      Showing <span className="font-semibold text-gray-900">{paginatedFavorites.length}</span> of{" "}
                      <span className="font-semibold text-gray-900">{filteredAndSortedFavorites.length}</span> favorites
                    </>
                  )}
                </p>
                {searchQuery && filteredAndSortedFavorites.length === 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            </div>

            {/* Favorites Grid/List */}
            {filteredAndSortedFavorites.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                    )}
                  >
                    {paginatedFavorites.map((favorite, index) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={`/homestays/profile/${generateProfileSlug(
                            favorite.homestayName,
                            favorite.homestayAddress,
                            favorite.homestayId
                          )}`}
                          className="block"
                        >
                          {viewMode === "grid" ? (
                            <GridCard
                              favorite={favorite}
                              onRemove={handleRemoveFavorite}
                              removingId={removingId}
                              formatDate={formatDate}
                            />
                          ) : (
                            <ListCard
                              favorite={favorite}
                              onRemove={handleRemoveFavorite}
                              removingId={removingId}
                              formatDate={formatDate}
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              className={cn(
                                "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                                currentPage === page
                                  ? "bg-[#214B3F] text-white shadow-md"
                                  : "text-gray-600 hover:bg-gray-100"
                              )}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No Search Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any favorites matching "{searchQuery}". Try a different search term.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Heart className="h-12 w-12 text-red-400" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-400" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Your favorites list is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing homestays and save your favorites for easy access. Start exploring Nepal's best accommodations!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/homestays">
                <Button className="bg-[#214B3F] hover:bg-[#1a3d33] text-white px-8 py-3 rounded-xl font-semibold gap-2">
                  <Home className="h-5 w-5" />
                  Explore Homestays
                </Button>
              </Link>
              <Link href="/deals">
                <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold gap-2 border-[#214B3F] text-[#214B3F] hover:bg-[#214B3F]/5">
                  <Sparkles className="h-5 w-5" />
                  View Deals
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Grid Card Component
function GridCard({
  favorite,
  onRemove,
  removingId,
  formatDate,
}: {
  favorite: Favorite;
  onRemove: (id: number, e: React.MouseEvent) => void;
  removingId: number | null;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        {favorite.homestayImages.length > 0 ? (
          <Image
            src={favorite.homestayImages[0]}
            alt={favorite.homestayName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Home className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Remove Button */}
        <button
          onClick={(e) => onRemove(favorite.homestayId, e)}
          disabled={removingId === favorite.homestayId}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all disabled:opacity-50 z-10"
          aria-label="Remove from favorites"
        >
          {removingId === favorite.homestayId ? (
            <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
          ) : (
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          )}
        </button>

        {/* Rating Badge */}
        {favorite.rating !== null && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{favorite.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#214B3F] transition-colors">
          {favorite.homestayName}
        </h3>

        <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{favorite.homestayAddress}</span>
        </div>

        <div className="mt-auto">
          {/* Reviews */}
          {favorite.reviews > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              {favorite.reviews} review{favorite.reviews !== 1 ? "s" : ""}
            </p>
          )}

          {/* Price and CTA */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-[#214B3F]">
                {favorite.currency} {favorite.startingPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">per night</p>
            </div>
            <span className="px-4 py-2 bg-[#214B3F] text-white text-sm font-medium rounded-xl group-hover:bg-[#1a3d33] transition-colors">
              View Details
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
          Saved on {formatDate(favorite.createdAt)}
        </p>
      </div>
    </div>
  );
}

// List Card Component
function ListCard({
  favorite,
  onRemove,
  removingId,
  formatDate,
}: {
  favorite: Favorite;
  onRemove: (id: number, e: React.MouseEvent) => void;
  removingId: number | null;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-72 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          {favorite.homestayImages.length > 0 ? (
            <Image
              src={favorite.homestayImages[0]}
              alt={favorite.homestayName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Home className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 sm:bg-gradient-to-t sm:from-black/40 sm:via-transparent sm:to-transparent" />

          {/* Remove Button */}
          <button
            onClick={(e) => onRemove(favorite.homestayId, e)}
            disabled={removingId === favorite.homestayId}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all disabled:opacity-50 z-10"
            aria-label="Remove from favorites"
          >
            {removingId === favorite.homestayId ? (
              <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
            ) : (
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#214B3F] transition-colors">
                  {favorite.homestayName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{favorite.homestayAddress}</span>
                </div>
              </div>

              {/* Rating */}
              {favorite.rating !== null && (
                <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-3 py-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-amber-700">{favorite.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {favorite.reviews > 0 && (
              <p className="text-sm text-gray-500">
                {favorite.reviews} review{favorite.reviews !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-[#214B3F]">
                {favorite.currency} {favorite.startingPrice.toLocaleString()}
                <span className="text-sm font-normal text-gray-400"> / night</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-400 hidden md:block">
                Saved {formatDate(favorite.createdAt)}
              </p>
              <span className="px-5 py-2.5 bg-[#214B3F] text-white text-sm font-medium rounded-xl group-hover:bg-[#1a3d33] transition-colors">
                View Details
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
