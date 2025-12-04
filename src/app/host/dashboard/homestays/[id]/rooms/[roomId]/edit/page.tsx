"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type {
  HostRoom,
  BedType,
  Currency,
  AreaUnit,
  UpdateRoomDto,
} from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Bed,
  ChevronLeft,
  Save,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const homestayId = parseInt(params.id as string);
  const roomId = parseInt(params.roomId as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [room, setRoom] = useState<HostRoom | null>(null);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [areaUnits, setAreaUnits] = useState<AreaUnit[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerNight: "",
    capacity: "1",
    size: "",
    bedTypeId: "",
    currencyId: "",
    areaUnitId: "",
    isAvailable: true,
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [roomId]);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || "",
        pricePerNight: room.pricePerNight.toString(),
        capacity: room.capacity.toString(),
        size: room.size?.toString() || "",
        bedTypeId: room.bedTypeId?.toString() || "",
        currencyId: room.currencyId?.toString() || "",
        areaUnitId: room.areaUnitId?.toString() || "",
        isAvailable: room.isAvailable,
      });
    }
  }, [room]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomData, bedTypesData, currenciesData, areaUnitsData] =
        await Promise.all([
          hostDashboardApi.getRoomDetails(roomId),
          hostDashboardApi.getBedTypes(),
          hostDashboardApi.getCurrencies(),
          hostDashboardApi.getAreaUnits(),
        ]);
      setRoom(roomData as unknown as HostRoom);
      setBedTypes(bedTypesData);
      setCurrencies(currenciesData);
      setAreaUnits(areaUnitsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0) {
      toast({
        title: "Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const updateDto: UpdateRoomDto = {
        name: formData.name,
        description: formData.description,
        pricePerNight: parseFloat(formData.pricePerNight),
        capacity: parseInt(formData.capacity),
        size: formData.size ? parseFloat(formData.size) : undefined,
        bedTypeId: parseInt(formData.bedTypeId),
        currencyId: parseInt(formData.currencyId),
        areaUnitId: parseInt(formData.areaUnitId),
        isAvailable: formData.isAvailable,
      };

      await hostDashboardApi.updateRoom(
        roomId,
        updateDto,
        newImages.length > 0 ? newImages : undefined
      );

      toast({
        title: "Success",
        description: "Room updated successfully",
      });

      router.push(`/host/dashboard/homestays/${homestayId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update room",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await hostDashboardApi.deleteRoom(roomId);

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });

      router.push(`/host/dashboard/homestays/${homestayId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Room Not Found
          </h3>
          <Link
            href={`/host/dashboard/homestays/${homestayId}`}
            className="inline-flex items-center px-6 py-3 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/host/dashboard/homestays/${homestayId}`}
            className="text-sm text-[#214B3F] hover:underline flex items-center gap-1 mb-3"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
          <p className="text-gray-600 mt-1">Update room details and pricing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Room Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="capacity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Guest Capacity *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="bedType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bed Type *
                  </label>
                  <select
                    id="bedType"
                    value={formData.bedTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, bedTypeId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                    required
                  >
                    {bedTypes.map((bedType) => (
                      <option key={bedType.id} value={bedType.id}>
                        {bedType.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pricing & Size
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price Per Night *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.currencyId}
                    onChange={(e) =>
                      setFormData({ ...formData, currencyId: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                    required
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.pricePerNight}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerNight: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="size"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="size"
                    min="0"
                    step="0.01"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                  />
                  <select
                    value={formData.areaUnitId}
                    onChange={(e) =>
                      setFormData({ ...formData, areaUnitId: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                  >
                    {areaUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Availability
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="w-5 h-5 text-[#214B3F] border-gray-300 rounded focus:ring-[#214B3F]"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Room is available for booking
                </span>
                <p className="text-sm text-gray-500">
                  Uncheck this if the room is under maintenance or not ready
                </p>
              </div>
            </label>
          </div>

          {/* Current Images */}
          {room.images && room.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-40 bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`Current image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Images
            </h2>

            <div className="mb-4">
              <label
                htmlFor="images"
                className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#214B3F] transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
                </div>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={url}
                      alt={`New image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Room
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <Link
                href={`/host/dashboard/homestays/${homestayId}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#1a3d32] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
