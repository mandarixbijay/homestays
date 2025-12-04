"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { HostHomestayListItem } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Star,
  MapPin,
  Eye,
  Edit,
  ChevronLeft,
  Building,
  Grid3x3,
  List,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type ViewMode = "grid" | "table";
type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

export default function HostHomestaysPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [homestays, setHomestays] = useState<HostHomestayListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadHomestays();
  }, []);

  const loadHomestays = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getHomestays();
      setHomestays(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load homestays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredHomestays = useMemo(() => {
    return homestays.filter((homestay) => {
      // Status filter
      if (statusFilter !== "ALL" && homestay.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          homestay.name.toLowerCase().includes(query) ||
          homestay.address.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [homestays, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-1">
                Manage your homestays and their details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/host/dashboard"
                className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
              <Link
                href="/host/dashboard/homestays/new"
                className="px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Add New Property
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-[#214B3F] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-[#214B3F] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredHomestays.length} of {homestays.length} properties
          </div>
        </div>

        {/* Homestays Grid or Table */}
        {filteredHomestays.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHomestays.map((homestay) => (
              <div
                key={homestay.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {homestay.mainImage ? (
                    <Image
                      src={homestay.mainImage}
                      alt={homestay.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {homestay.name}
                      </h3>
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{homestay.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        homestay.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : homestay.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : homestay.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {homestay.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Rooms</p>
                      <p className="font-semibold text-gray-900">{homestay.roomCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reviews</p>
                      <p className="font-semibold text-gray-900">{homestay.reviews}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  {homestay.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {homestay.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({homestay.reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Created Date */}
                  <p className="text-xs text-gray-400 mb-4">
                    Created on {new Date(homestay.createdAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/host/dashboard/homestays/${homestay.id}`}
                      className="flex-1 px-3 py-2 text-sm bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    <Link
                      href={`/host/dashboard/homestays/${homestay.id}/edit`}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviews
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHomestays.map((homestay) => (
                      <tr key={homestay.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {homestay.mainImage ? (
                                <Image
                                  src={homestay.mainImage}
                                  alt={homestay.name}
                                  fill
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Home className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {homestay.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1 text-sm text-gray-600 max-w-xs">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{homestay.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              homestay.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : homestay.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : homestay.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {homestay.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {homestay.roomCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {homestay.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {homestay.rating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {homestay.reviews}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(homestay.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/host/dashboard/homestays/${homestay.id}`}
                              className="text-[#214B3F] hover:text-[#1a3d32]"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/host/dashboard/homestays/${homestay.id}/edit`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "ALL" ? "No Properties Found" : "No Properties Yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria."
                : "You haven't added any properties yet. Start by adding your first homestay to begin hosting guests."}
            </p>
            {!(searchQuery || statusFilter !== "ALL") && (
              <Link
                href="/host/dashboard/homestays/new"
                className="inline-flex items-center px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors gap-2"
              >
                <Home className="h-5 w-5" />
                Add Your First Property
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
