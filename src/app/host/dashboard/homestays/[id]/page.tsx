"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { HostHomestayDetails, HostRoom } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Star,
  MapPin,
  Edit,
  ChevronLeft,
  Calendar,
  Users,
  DollarSign,
  Bed,
  Plus,
  Eye,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomestayDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const homestayId = parseInt(params.id as string);

  const [homestay, setHomestay] = useState<HostHomestayDetails | null>(null);
  const [rooms, setRooms] = useState<HostRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (homestayId) {
      loadHomestayDetails();
      loadRooms();
    }
  }, [homestayId]);

  const loadHomestayDetails = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getHomestayDetails(homestayId);
      setHomestay(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load homestay details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await hostDashboardApi.getHomestayRooms(homestayId);
      setRooms(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load rooms",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Property Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/host/dashboard/homestays"
            className="inline-flex items-center px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Properties
          </Link>
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
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/host/dashboard/homestays"
                  className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Properties
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{homestay.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <p className="text-gray-600">{homestay.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/host/dashboard/homestays/${homestayId}/edit`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Property
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {homestay.images && homestay.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Property Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {homestay.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-40 bg-gray-200 rounded-lg overflow-hidden"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={`${homestay.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {homestay.description || "No description provided."}
              </p>
            </div>

            {/* Facilities */}
            {homestay.facilities && homestay.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Facilities & Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {homestay.facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-[#214B3F] rounded-full"></div>
                      <span className="text-sm">{facility.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Rooms ({rooms.length})
                </h2>
                <Link
                  href={`/host/dashboard/homestays/${homestayId}/rooms/new`}
                  className="px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Room
                </Link>
              </div>

              {rooms.length > 0 ? (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#214B3F] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {room.name}
                            </h3>
                            {room.isAvailable ? (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                Available
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>

                          {room.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {room.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Price</p>
                              <p className="font-medium text-gray-900">
                                {room.currency} {room.pricePerNight?.toLocaleString() || 0}
                                <span className="text-gray-500">/night</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Capacity</p>
                              <p className="font-medium text-gray-900 flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {room.capacity || 0} guests
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bed Type</p>
                              <p className="font-medium text-gray-900">
                                {room.bedType || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Size</p>
                              <p className="font-medium text-gray-900">
                                {room.size ? `${room.size} ${room.areaUnit || ''}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/host/dashboard/homestays/${homestayId}/rooms/${room.id}/edit`}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No rooms added yet</p>
                  <Link
                    href={`/host/dashboard/homestays/${homestayId}/rooms/new`}
                    className="inline-flex items-center px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Room
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Status
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                </div>
                {homestay.rating && (
                  <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <p className="text-2xl font-bold text-gray-900">
                        {homestay.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}
                {homestay.reviews !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {homestay.reviews}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {new Date(homestay.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {homestay.updatedAt && (
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(homestay.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
