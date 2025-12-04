"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HostHomestaysPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [homestays, setHomestays] = useState<HostHomestayListItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-1">
                Manage your homestays and their details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/host/new-dashboard"
                className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
              <Link
                href="/host/dashboard"
                className="px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Add New Property
              </Link>
            </div>
          </div>
        </div>

        {/* Homestays Grid */}
        {homestays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestays.map((homestay) => (
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
                      href={`/host/new-dashboard/homestays/${homestay.id}`}
                      className="flex-1 px-3 py-2 text-sm bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    <Link
                      href={`/host/dashboard?edit=${homestay.id}`}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Properties Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't added any properties yet. Start by adding your first
              homestay to begin hosting guests.
            </p>
            <Link
              href="/host/dashboard"
              className="inline-flex items-center px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors gap-2"
            >
              <Home className="h-5 w-5" />
              Add Your First Property
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
