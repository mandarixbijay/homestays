"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type {
  HostHomestayDetails,
  Facility,
  UpdateHomestayDto,
} from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  ChevronLeft,
  Save,
  ImageIcon,
  X,
  Upload,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditHomestayPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const homestayId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homestay, setHomestay] = useState<HostHomestayDetails | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    facilityIds: [] as number[],
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [homestayId]);

  useEffect(() => {
    if (homestay) {
      setFormData({
        name: homestay.name,
        address: homestay.address,
        description: homestay.description || "",
        facilityIds: homestay.facilities?.map((f) => f.id) || [],
      });
    }
  }, [homestay]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [homestayData, facilitiesData] = await Promise.all([
        hostDashboardApi.getHomestayDetails(homestayId),
        hostDashboardApi.getFacilities(),
      ]);
      setHomestay(homestayData);
      setFacilities(facilitiesData);
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

  const handleFacilityToggle = (facilityId: number) => {
    setFormData((prev) => ({
      ...prev,
      facilityIds: prev.facilityIds.includes(facilityId)
        ? prev.facilityIds.filter((id) => id !== facilityId)
        : [...prev.facilityIds, facilityId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Property name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "Address is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const updateDto: UpdateHomestayDto = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        facilityIds: formData.facilityIds,
      };

      await hostDashboardApi.updateHomestay(
        homestayId,
        updateDto,
        newImages.length > 0 ? newImages : undefined
      );

      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      router.push(`/host/dashboard/homestays/${homestayId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/host/dashboard/homestays/${homestayId}`}
            className="text-sm text-[#214B3F] hover:underline flex items-center gap-1 mb-3"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-1">
            Update your property details and images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Property Name *
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
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
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
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                  placeholder="Describe your property..."
                />
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Facilities & Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.facilityIds.includes(facility.id)}
                    onChange={() => handleFacilityToggle(facility.id)}
                    className="w-4 h-4 text-[#214B3F] border-gray-300 rounded focus:ring-[#214B3F]"
                  />
                  <span className="text-sm text-gray-700">{facility.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Images */}
          {homestay.images && homestay.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {homestay.images.map((image, index) => (
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
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
        </form>
      </div>
    </div>
  );
}
