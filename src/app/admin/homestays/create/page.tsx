// components/admin/ImprovedHomestayCreate.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, X, Home, Bed, Users, Square, 
  DollarSign, ImageIcon, AlertCircle, CheckCircle, Info
} from 'lucide-react';

import {
  useHomestays,
  useMasterData,
  useImageManager,
  useHomestayValidation,
  useFormState,
  ImageWithPreview
} from '@/hooks/useAdminApi';

import {
  LoadingSpinner,
  Alert,
  ActionButton,
  Card,
  Input,
  TextArea,
  ImageUpload,
  ImagePreview,
  Modal,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

interface Room {
  id: string;
  name: string;
  description: string;
  totalArea: number;
  areaUnit: string;
  maxOccupancy: { adults: number; children: number };
  minOccupancy: { adults: number; children: number };
  price: { value: number; currency: string };
  includeBreakfast: boolean;
  images: ImageWithPreview[];
  beds: { bedTypeId: number; quantity: number }[];
}

interface HomestayFormData {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  description: string;
  imageMetadata: ImageWithPreview[];
  facilityIds: number[];
  customFacilities: { name: string }[];
  ownerId: number;
  rooms: Room[];
  status: string;
  discount: number;
  vipAccess: boolean;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const ProgressIndicator: React.FC<{
  current: number;
  total: number;
  hasErrors: boolean;
}> = ({ current, total, hasErrors }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Form Progress
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {current}/{total} completed
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            hasErrors ? 'bg-red-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ValidationSummary: React.FC<{
  errors: string[];
  onFix?: () => void;
}> = ({ errors, onFix }) => {
  if (errors.length === 0) return null;

  return (
    <Alert
      type="error"
      title="Validation Errors"
      message={`Please fix ${errors.length} error${errors.length !== 1 ? 's' : ''} before saving:`}
      actions={
        onFix && (
          <ActionButton onClick={onFix} variant="secondary" size="sm">
            Review Errors
          </ActionButton>
        )
      }
    >
      <ul className="mt-2 text-sm space-y-1">
        {errors.slice(0, 5).map((error, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{error}</span>
          </li>
        ))}
        {errors.length > 5 && (
          <li className="text-gray-600 dark:text-gray-400">
            ... and {errors.length - 5} more errors
          </li>
        )}
      </ul>
    </Alert>
  );
};

const RoomCard: React.FC<{
  room: Room;
  roomIndex: number;
  onUpdate: (field: keyof Room, value: any) => void;
  onRemove: () => void;
  currencies: any[];
  areaUnits: any[];
  bedTypes: any[];
  onImageUpload: (files: FileList) => void;
  onImageRemove: (imageIndex: number) => void;
  onImageSetMain: (imageIndex: number) => void;
  onAddBed: () => void;
  onUpdateBed: (bedIndex: number, field: string, value: any) => void;
  onRemoveBed: (bedIndex: number) => void;
}> = ({
  room,
  roomIndex,
  onUpdate,
  onRemove,
  currencies,
  areaUnits,
  bedTypes,
  onImageUpload,
  onImageRemove,
  onImageSetMain,
  onAddBed,
  onUpdateBed,
  onRemoveBed
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Card
      title={room.name || `Room ${roomIndex + 1}`}
      subtitle={`${room.images.length} images • ${room.beds.length} bed${room.beds.length !== 1 ? 's' : ''}`}
      actions={
        <ActionButton
          onClick={onRemove}
          variant="danger"
          size="sm"
          icon={<X className="h-4 w-4" />}
        >
          Remove Room
        </ActionButton>
      }
      className="mb-6"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Room Name"
            value={room.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Deluxe Room"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Area"
              type="number"
              value={room.totalArea}
              onChange={(e) => onUpdate('totalArea', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={room.areaUnit}
                onChange={(e) => onUpdate('areaUnit', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {areaUnits.map((unit: any) => (
                  <option key={unit.id} value={unit.name}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            value={room.price.value}
            onChange={(e) => onUpdate('price', { ...room.price, value: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={room.price.currency}
              onChange={(e) => onUpdate('price', { ...room.price, currency: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((currency: any) => (
                <option key={currency.id} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Occupancy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Occupancy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={room.maxOccupancy.adults}
                onChange={(e) => onUpdate('maxOccupancy', { 
                  ...room.maxOccupancy, 
                  adults: parseInt(e.target.value) || 0 
                })}
                placeholder="Adults"
                min="0"
              />
              <Input
                type="number"
                value={room.maxOccupancy.children}
                onChange={(e) => onUpdate('maxOccupancy', { 
                  ...room.maxOccupancy, 
                  children: parseInt(e.target.value) || 0 
                })}
                placeholder="Children"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Occupancy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={room.minOccupancy.adults}
                onChange={(e) => onUpdate('minOccupancy', { 
                  ...room.minOccupancy, 
                  adults: parseInt(e.target.value) || 0 
                })}
                placeholder="Adults"
                min="0"
              />
              <Input
                type="number"
                value={room.minOccupancy.children}
                onChange={(e) => onUpdate('minOccupancy', { 
                  ...room.minOccupancy, 
                  children: parseInt(e.target.value) || 0 
                })}
                placeholder="Children"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <TextArea
          label="Description"
          value={room.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          rows={3}
          placeholder="Describe the room..."
        />

        {/* Breakfast */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={room.includeBreakfast}
              onChange={(e) => onUpdate('includeBreakfast', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Include Breakfast</span>
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Room Images *
          </label>
          <ImageUpload
            onUpload={onImageUpload}
            className="mb-4"
          />
          <ImagePreview
            images={room.images}
            onRemove={onImageRemove}
            onSetMain={onImageSetMain}
            onView={setSelectedImage}
          />
        </div>

        {/* Beds */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Beds
            </label>
            <ActionButton
              onClick={onAddBed}
              variant="secondary"
              size="sm"
              icon={<Plus className="h-3 w-3" />}
              disabled={bedTypes.length === 0}
            >
              Add Bed
            </ActionButton>
          </div>

          {room.beds.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No beds added yet</p>
          ) : (
            <div className="space-y-3">
              {room.beds.map((bed, bedIndex) => (
                <div key={bedIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <select
                    value={bed.bedTypeId}
                    onChange={(e) => onUpdateBed(bedIndex, 'bedTypeId', parseInt(e.target.value))}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {bedTypes.map((bedType: any) => (
                      <option key={bedType.id} value={bedType.id}>{bedType.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={bed.quantity}
                    onChange={(e) => onUpdateBed(bedIndex, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                  <ActionButton
                    onClick={() => onRemoveBed(bedIndex)}
                    variant="danger"
                    size="sm"
                    icon={<X className="h-4 w-4" />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image View Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Image Preview"
          size="lg"
        >
          <img
            src={selectedImage}
            alt="Room preview"
            className="w-full h-auto rounded-lg"
          />
        </Modal>
      )}
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImprovedHomestayCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const { createHomestay, loading: submitLoading } = useHomestays();
  const { facilities, currencies, areaUnits, bedTypes, loadAllData, loading: masterDataLoading } = useMasterData();
  const { handleImageUpload } = useImageManager();
  const { validateHomestay } = useHomestayValidation();

  // Form state
  const {
    formData,
    errors,
    updateField,
    setFieldError,
    resetForm
  } = useFormState<HomestayFormData>({
    propertyName: '',
    propertyAddress: '',
    contactNumber: '',
    description: '',
    imageMetadata: [],
    facilityIds: [],
    customFacilities: [],
    ownerId: 0,
    rooms: [],
    status: 'PENDING',
    discount: 0,
    vipAccess: false,
  });

  // Local state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadAllData();
    }
  }, [status, session, router, loadAllData]);

  // Validation
  useEffect(() => {
    const errors = validateHomestay(formData);
    setValidationErrors(errors);
  }, [formData, validateHomestay]);

  // Helpers
  const createEmptyRoom = useCallback((): Room => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    description: '',
    totalArea: 0,
    areaUnit: areaUnits.find((unit: any) => unit.isDefault)?.name || areaUnits[0]?.name || 'sqft',
    maxOccupancy: { adults: 2, children: 0 },
    minOccupancy: { adults: 1, children: 0 },
    price: {
      value: 0,
      currency: currencies.find((curr: any) => curr.isDefault)?.code || currencies[0]?.code || 'NPR'
    },
    includeBreakfast: false,
    images: [],
    beds: [],
  }), [areaUnits, currencies]);

  const getProgress = useCallback(() => {
    let completed = 0;
    const total = 6; // Number of required sections

    if (formData.propertyName) completed++;
    if (formData.propertyAddress) completed++;
    if (formData.contactNumber) completed++;
    if (formData.ownerId > 0) completed++;
    if (formData.imageMetadata.length > 0) completed++;
    if (formData.rooms.length > 0) completed++;

    return { completed, total, hasErrors: validationErrors.length > 0 };
  }, [formData, validationErrors]);

  // Handlers
  const handleHomestayImageUpload = useCallback(async (files: FileList) => {
    try {
      await handleImageUpload('homestay', files, (imageData) => {
        const updatedImages = [...formData.imageMetadata, imageData];
        if (updatedImages.length === 1) {
          imageData.isMain = true;
        }
        updateField('imageMetadata', updatedImages);
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: error instanceof Error ? error.message : 'Failed to upload images'
      });
    }
  }, [formData.imageMetadata, handleImageUpload, updateField, addToast]);

  const handleHomestayImageRemove = useCallback((imageIndex: number) => {
    const updatedImages = formData.imageMetadata.filter((_, i) => i !== imageIndex);
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    updateField('imageMetadata', updatedImages);
  }, [formData.imageMetadata, updateField]);

  const handleHomestayImageSetMain = useCallback((imageIndex: number) => {
    const updatedImages = formData.imageMetadata.map((img, i) => ({
      ...img,
      isMain: i === imageIndex,
    }));
    updateField('imageMetadata', updatedImages);
  }, [formData.imageMetadata, updateField]);

  const addRoom = useCallback(() => {
    const newRoom = createEmptyRoom();
    updateField('rooms', [...formData.rooms, newRoom]);
  }, [formData.rooms, createEmptyRoom, updateField]);

  const updateRoom = useCallback((roomIndex: number, field: keyof Room, value: any) => {
    const updatedRooms = formData.rooms.map((room, i) =>
      i === roomIndex ? { ...room, [field]: value } : room
    );
    updateField('rooms', updatedRooms);
  }, [formData.rooms, updateField]);

  const removeRoom = useCallback((roomIndex: number) => {
    const updatedRooms = formData.rooms.filter((_, i) => i !== roomIndex);
    updateField('rooms', updatedRooms);
  }, [formData.rooms, updateField]);

  const handleRoomImageUpload = useCallback(async (roomIndex: number, files: FileList) => {
    try {
      await handleImageUpload(`room-${roomIndex}`, files, (imageData) => {
        const updatedRooms = [...formData.rooms];
        const updatedImages = [...updatedRooms[roomIndex].images, imageData];
        if (updatedImages.length === 1) {
          imageData.isMain = true;
        }
        updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], images: updatedImages };
        updateField('rooms', updatedRooms);
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: error instanceof Error ? error.message : 'Failed to upload room images'
      });
    }
  }, [formData.rooms, handleImageUpload, updateField, addToast]);

  const addCustomFacility = useCallback((facilityName: string) => {
    const trimmedName = facilityName.trim();
    if (!trimmedName) return;

    const existingNames = formData.customFacilities.map(f => f.name.toLowerCase());
    if (existingNames.includes(trimmedName.toLowerCase())) {
      addToast({
        type: 'warning',
        title: 'Duplicate Facility',
        message: 'This facility already exists.'
      });
      return;
    }

    const newFacility = { name: trimmedName };
    updateField('customFacilities', [...formData.customFacilities, newFacility]);
  }, [formData.customFacilities, updateField, addToast]);

  const removeCustomFacility = useCallback((facilityIndex: number) => {
    const updatedFacilities = formData.customFacilities.filter((_, i) => i !== facilityIndex);
    updateField('customFacilities', updatedFacilities);
  }, [formData.customFacilities, updateField]);

  const handleSave = useCallback(async () => {
    try {
      if (validationErrors.length > 0) {
        addToast({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fix all errors before saving.'
        });
        return;
      }

      const result = await createHomestay(formData);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Homestay created successfully!'
      });

      router.push(`/admin/homestays/${result.id}?created=true`);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create homestay'
      });
    }
  }, [validationErrors, formData, createHomestay, addToast, router]);

  // Early returns
  if (status === 'loading' || masterDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={() => router.push('/admin/homestays')}
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New Homestay
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add a new homestay property to the platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={() => router.push('/admin/homestays')}
                variant="secondary"
                icon={<X className="h-4 w-4" />}
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleSave}
                variant="primary"
                loading={submitLoading}
                icon={<Save className="h-4 w-4" />}
                disabled={progress.hasErrors}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Create Homestay
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <ProgressIndicator
          current={progress.completed}
          total={progress.total}
          hasErrors={progress.hasErrors}
        />

        {/* Validation Summary */}
        <ValidationSummary errors={validationErrors} />

        <div className="space-y-8">
          {/* Basic Information */}
          <Card title="Basic Information" subtitle="Essential property details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Property Name"
                value={formData.propertyName}
                onChange={(e) => updateField('propertyName', e.target.value)}
                placeholder="Enter property name"
                required
                error={errors.propertyName}
              />

              <Input
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => updateField('contactNumber', e.target.value)}
                placeholder="Enter contact number"
                required
                error={errors.contactNumber}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Address"
                  value={formData.propertyAddress}
                  onChange={(e) => updateField('propertyAddress', e.target.value)}
                  rows={3}
                  placeholder="Enter property address"
                  required
                  error={errors.propertyAddress}
                />
              </div>

              <Input
                label="Owner ID"
                type="number"
                value={formData.ownerId || ''}
                onChange={(e) => updateField('ownerId', parseInt(e.target.value) || 0)}
                placeholder="Enter owner ID"
                required
                error={errors.ownerId}
              />
            </div>
          </Card>

          {/* Description */}
          <Card title="Description" subtitle="Tell guests about your property">
            <TextArea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={6}
              placeholder="Describe the homestay..."
            />
          </Card>

          {/* Images */}
          <Card title="Homestay Images" subtitle="Add photos to showcase your property">
            <div className="space-y-4">
              <ImageUpload onUpload={handleHomestayImageUpload} />
              <ImagePreview
                images={formData.imageMetadata}
                onRemove={handleHomestayImageRemove}
                onSetMain={handleHomestayImageSetMain}
                onView={setSelectedImage}
              />
            </div>
          </Card>

          {/* Facilities */}
          <Card title="Facilities" subtitle="Select amenities and services">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Facilities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {facilities.map((facility: any) => (
                    <label key={facility.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.facilityIds.includes(facility.id)}
                        onChange={(e) => {
                          const updatedIds = e.target.checked
                            ? [...formData.facilityIds, facility.id]
                            : formData.facilityIds.filter(id => id !== facility.id);
                          updateField('facilityIds', updatedIds);
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {facility.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Input
                  label="Custom Facilities"
                  placeholder="Add custom facility (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addCustomFacility(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  hint="Press Enter to add a custom facility"
                />
                {formData.customFacilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.customFacilities.map((facility, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {facility.name}
                        <button
                          onClick={() => removeCustomFacility(index)}
                          className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Rooms */}
          <Card
            title={`Rooms (${formData.rooms.length})`}
            subtitle="Add rooms available for booking"
            actions={
              <ActionButton
                onClick={addRoom}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                size="sm"
              >
                Add Room
              </ActionButton>
            }
          >
            {formData.rooms.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Bed className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No rooms added yet</p>
                <ActionButton
                  onClick={addRoom}
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                  size="sm"
                >
                  Add First Room
                </ActionButton>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.rooms.map((room, roomIndex) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    roomIndex={roomIndex}
                    onUpdate={(field, value) => updateRoom(roomIndex, field, value)}
                    onRemove={() => removeRoom(roomIndex)}
                    currencies={currencies}
                    areaUnits={areaUnits}
                    bedTypes={bedTypes}
                    onImageUpload={(files) => handleRoomImageUpload(roomIndex, files)}
                    onImageRemove={(imageIndex) => {
                      const updatedRooms = [...formData.rooms];
                      const updatedImages = updatedRooms[roomIndex].images.filter((_, i) => i !== imageIndex);
                      if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
                        updatedImages[0].isMain = true;
                      }
                      updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], images: updatedImages };
                      updateField('rooms', updatedRooms);
                    }}
                    onImageSetMain={(imageIndex) => {
                      const updatedRooms = [...formData.rooms];
                      const updatedImages = updatedRooms[roomIndex].images.map((img, i) => ({
                        ...img,
                        isMain: i === imageIndex,
                      }));
                      updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], images: updatedImages };
                      updateField('rooms', updatedRooms);
                    }}
                    onAddBed={() => {
                      if (bedTypes.length === 0) return;
                      const updatedRooms = [...formData.rooms];
                      const newBed = { bedTypeId: bedTypes[0].id, quantity: 1 };
                      updatedRooms[roomIndex] = {
                        ...updatedRooms[roomIndex],
                        beds: [...updatedRooms[roomIndex].beds, newBed]
                      };
                      updateField('rooms', updatedRooms);
                    }}
                    onUpdateBed={(bedIndex, field, value) => {
                      const updatedRooms = [...formData.rooms];
                      const updatedBeds = updatedRooms[roomIndex].beds.map((bed, i) =>
                        i === bedIndex ? { ...bed, [field]: value } : bed
                      );
                      updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], beds: updatedBeds };
                      updateField('rooms', updatedRooms);
                    }}
                    onRemoveBed={(bedIndex) => {
                      const updatedRooms = [...formData.rooms];
                      const updatedBeds = updatedRooms[roomIndex].beds.filter((_, i) => i !== bedIndex);
                      updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], beds: updatedBeds };
                      updateField('rooms', updatedRooms);
                    }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Settings */}
          <Card title="Settings" subtitle="Additional property settings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <Input
                label="Discount (%)"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => updateField('discount', parseInt(e.target.value) || 0)}
              />

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vipAccess}
                    onChange={(e) => updateField('vipAccess', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">VIP Access</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {progress.hasErrors ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : progress.completed === progress.total ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Info className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {progress.hasErrors 
                    ? `${validationErrors.length} error${validationErrors.length !== 1 ? 's' : ''} to fix`
                    : progress.completed === progress.total 
                      ? 'Ready to create' 
                      : 'In progress'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.rooms.length} room{formData.rooms.length !== 1 ? 's' : ''} • {formData.imageMetadata.length + formData.rooms.reduce((sum, room) => sum + room.images.length, 0)} image{(formData.imageMetadata.length + formData.rooms.reduce((sum, room) => sum + room.images.length, 0)) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <ActionButton
              onClick={handleSave}
              variant="primary"
              loading={submitLoading}
              icon={<Save className="h-4 w-4" />}
              disabled={progress.hasErrors}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Create Homestay
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Image View Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Image Preview"
          size="xl"
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-auto rounded-lg"
          />
        </Modal>
      )}
    </div>
  );
}