'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, X, Plus, Trash2, Upload, Image as ImageIcon,
  Home, MapPin, Phone, User, Star, Bed, Users, Square,
  Wifi, Settings, AlertCircle, Camera, Edit3
} from 'lucide-react';

import {
  useHomestayDetail,
  useMasterData,
  useImageManager,
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
  Modal,
  StatusBadge,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

interface HomestayEditPageProps {
  params: {
    id: string;
  };
}

interface Room {
  id?: number;
  name: string;
  description: string;
  totalArea: number;
  areaUnit: string;
  maxOccupancy: {
    adults: number;
    children: number;
  };
  minOccupancy: {
    adults: number;
    children: number;
  };
  price: {
    value: number;
    currency: string;
  };
  includeBreakfast: boolean;
  beds: Array<{
    bedTypeId: number;
    quantity: number;
  }>;
  images: ImageWithPreview[];
}

interface HomestayFormData {
  basicInfo: {
    propertyName: string;
    propertyAddress: string;
    contactNumber: string;
    ownerId: number;
  };
  descriptionAndImages: {
    description: string;
    imageMetadata: ImageWithPreview[];
  };
  facilities: {
    facilityIds: number[];
    customFacilities: string[];
  };
  rooms: Room[];
  status: string;
  discount: number;
  vipAccess: boolean;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const ImageUploadSection: React.FC<{
  title: string;
  images: ImageWithPreview[];
  onImageAdd: (images: ImageWithPreview[]) => void;
  onImageRemove: (index: number) => void;
  onImageUpdate: (index: number, updates: Partial<ImageWithPreview>) => void;
  maxImages?: number;
}> = ({ title, images, onImageAdd, onImageRemove, onImageUpdate, maxImages = 10 }) => {
  const { handleImageUpload, isUploading } = useImageManager();
  const { addToast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: ImageWithPreview[] = [];
      await handleImageUpload('homestay-images', files, (imageData) => {
        newImages.push(imageData);
      });
      onImageAdd(newImages);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to upload images'
      });
    }
  }, [handleImageUpload, onImageAdd, addToast]);

  const setAsMain = (index: number) => {
    // First, set all images as not main
    images.forEach((_, i) => {
      if (i !== index) {
        onImageUpdate(i, { isMain: false });
      }
    });
    // Then set the selected image as main
    onImageUpdate(index, { isMain: true });
  };

  return (
    <Card title={`${title} (${images.length}/${maxImages})`}>
      <div className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
            disabled={images.length >= maxImages || isUploading('homestay-images')}
          />
          <label
            htmlFor={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer block"
          >
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Images
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max {maxImages} images, up to 10MB each
            </p>
          </label>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
                  <img
                    src={image.preview || image.url}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <ActionButton
                      onClick={() => setAsMain(index)}
                      variant={image.isMain ? 'success' : 'secondary'}
                      size="xs"
                      icon={<Star className="h-3 w-3" />}
                    >
                      {image.isMain ? 'Main' : 'Set Main'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onImageRemove(index)}
                      variant="danger"
                      size="xs"
                      icon={<Trash2 className="h-3 w-3" />}
                    />
                  </div>
                </div>

                {/* Main Badge */}
                {image.isMain && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-lg">
                      ★ Main
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

const FacilitiesSection: React.FC<{
  selectedFacilities: number[];
  customFacilities: string[];
  onFacilitiesChange: (facilityIds: number[]) => void;
  onCustomFacilitiesChange: (customFacilities: string[]) => void;
}> = ({ selectedFacilities, customFacilities, onFacilitiesChange, onCustomFacilitiesChange }) => {
  const { facilities, loading } = useMasterData();
  const [newCustomFacility, setNewCustomFacility] = useState('');

  const toggleFacility = (facilityId: number) => {
    if (selectedFacilities.includes(facilityId)) {
      onFacilitiesChange(selectedFacilities.filter(id => id !== facilityId));
    } else {
      onFacilitiesChange([...selectedFacilities, facilityId]);
    }
  };

  const addCustomFacility = () => {
    if (newCustomFacility.trim() && !customFacilities.includes(newCustomFacility.trim())) {
      onCustomFacilitiesChange([...customFacilities, newCustomFacility.trim()]);
      setNewCustomFacility('');
    }
  };

  const removeCustomFacility = (index: number) => {
    onCustomFacilitiesChange(customFacilities.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Card title="Facilities">
        <LoadingSpinner text="Loading facilities..." />
      </Card>
    );
  }

  return (
    <Card title="Facilities">
      <div className="space-y-6">
        {/* Standard Facilities */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Standard Facilities
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {facilities.map((facility) => (
              <label
                key={facility.id}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility.id)}
                  onChange={() => toggleFacility(facility.id)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <Wifi className="h-4 w-4 text-gray-400 ml-3 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {facility.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Facilities */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Custom Facilities
          </h4>

          <div className="flex space-x-2 mb-3">
            <Input
              value={newCustomFacility}
              onChange={(e) => setNewCustomFacility(e.target.value)}
              placeholder="Add custom facility..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomFacility()}
            />
            <ActionButton
              onClick={addCustomFacility}
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              disabled={!newCustomFacility.trim()}
            >
              Add
            </ActionButton>
          </div>

          {customFacilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customFacilities.map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {facility}
                  <button
                    onClick={() => removeCustomFacility(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
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
  );
};

const RoomEditor: React.FC<{
  room: Room;
  onUpdate: (room: Room) => void;
  onRemove: () => void;
  currencies: any[];
  bedTypes: any[];
  areaUnits: any[];
}> = ({ room, onUpdate, onRemove, currencies, bedTypes, areaUnits }) => {
  const { handleImageUpload, isUploading } = useImageManager();
  const { addToast } = useToast();

  const updateRoom = (field: string, value: any) => {
    onUpdate({ ...room, [field]: value });
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    const sectionValue = room[section as keyof Room];
    onUpdate({
      ...room,
      [section]: {
        ...(typeof sectionValue === 'object' && sectionValue !== null && !Array.isArray(sectionValue)
          ? sectionValue
          : {}),
        [field]: value
      }
    });
  };

  const addBed = () => {
    const newBed = { bedTypeId: bedTypes[0]?.id || 1, quantity: 1 };
    updateRoom('beds', [...room.beds, newBed]);
  };

  const updateBed = (index: number, field: string, value: any) => {
    const updatedBeds = room.beds.map((bed, i) =>
      i === index ? { ...bed, [field]: value } : bed
    );
    updateRoom('beds', updatedBeds);
  };

  const removeBed = (index: number) => {
    updateRoom('beds', room.beds.filter((_, i) => i !== index));
  };

  const handleRoomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: ImageWithPreview[] = [];
      await handleImageUpload('room-images', files, (imageData) => {
        newImages.push(imageData);
      });
      updateRoom('images', [...room.images, ...newImages]);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to upload room images'
      });
    }
  };

  const removeRoomImage = (index: number) => {
    updateRoom('images', room.images.filter((_, i) => i !== index));
  };

  const setRoomImageAsMain = (index: number) => {
    const updatedImages = room.images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    updateRoom('images', updatedImages);
  };

  return (
    <Card className="relative">
      <div className="absolute top-4 right-4">
        <ActionButton
          onClick={onRemove}
          variant="danger"
          size="xs"
          icon={<Trash2 className="h-3 w-3" />}
        >
          Remove Room
        </ActionButton>
      </div>

      <div className="space-y-6 pr-20">
        {/* Basic Room Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Room Name"
            value={room.name}
            onChange={(e) => updateRoom('name', e.target.value)}
            placeholder="e.g., Deluxe Double Room"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Area"
              type="number"
              value={room.totalArea}
              onChange={(e) => updateRoom('totalArea', Number(e.target.value))}
              placeholder="Area"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit
              </label>
              <select
                value={room.areaUnit}
                onChange={(e) => updateRoom('areaUnit', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {areaUnits.map((unit) => (
                  <option key={unit.id} value={unit.name}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <TextArea
          label="Room Description"
          value={room.description}
          onChange={(e) => updateRoom('description', e.target.value)}
          placeholder="Describe this room..."
          rows={3}
        />

        {/* Occupancy */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Occupancy</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Min Adults"
              type="number"
              min="0"
              value={room.minOccupancy.adults}
              onChange={(e) => updateNestedField('minOccupancy', 'adults', Number(e.target.value))}
            />
            <Input
              label="Min Children"
              type="number"
              min="0"
              value={room.minOccupancy.children}
              onChange={(e) => updateNestedField('minOccupancy', 'children', Number(e.target.value))}
            />
            <Input
              label="Max Adults"
              type="number"
              min="1"
              value={room.maxOccupancy.adults}
              onChange={(e) => updateNestedField('maxOccupancy', 'adults', Number(e.target.value))}
            />
            <Input
              label="Max Children"
              type="number"
              min="0"
              value={room.maxOccupancy.children}
              onChange={(e) => updateNestedField('maxOccupancy', 'children', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={room.price.value}
              onChange={(e) => updateNestedField('price', 'value', Number(e.target.value))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={room.price.currency}
                onChange={(e) => updateNestedField('price', 'currency', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={room.includeBreakfast}
                onChange={(e) => updateRoom('includeBreakfast', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Breakfast
              </span>
            </label>
          </div>
        </div>

        {/* Beds */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Beds</h4>
            <ActionButton
              onClick={addBed}
              variant="secondary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Add Bed
            </ActionButton>
          </div>

          <div className="space-y-3">
            {room.beds.map((bed, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <select
                  value={bed.bedTypeId}
                  onChange={(e) => updateBed(index, 'bedTypeId', Number(e.target.value))}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bedTypes.map((bedType) => (
                    <option key={bedType.id} value={bedType.id}>
                      {bedType.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={bed.quantity}
                  onChange={(e) => updateBed(index, 'quantity', Number(e.target.value))}
                  className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <ActionButton
                  onClick={() => removeBed(index)}
                  variant="danger"
                  size="xs"
                  icon={<Trash2 className="h-3 w-3" />}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Room Images */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Room Images</h4>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleRoomImageUpload}
              className="hidden"
              id={`room-upload-${room.id || 'new'}`}
              disabled={isUploading('room-images')}
            />
            <label htmlFor={`room-upload-${room.id || 'new'}`} className="cursor-pointer block">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload room images</p>
            </label>
          </div>

          {room.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {room.images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img
                      src={image.preview || image.url}
                      alt={`Room ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-1">
                      <ActionButton
                        onClick={() => setRoomImageAsMain(index)}
                        variant={image.isMain ? 'success' : 'secondary'}
                        size="xs"
                        icon={<Star className="h-2 w-2" />}
                      />
                      <ActionButton
                        onClick={() => removeRoomImage(index)}
                        variant="danger"
                        size="xs"
                        icon={<Trash2 className="h-2 w-2" />}
                      />
                    </div>
                  </div>

                  {image.isMain && (
                    <div className="absolute top-1 left-1">
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                        ★
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HomestayEditPage({ params }: HomestayEditPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const homestayId = parseInt(params.id);

  // Hooks
  const { homestay, loading, error, loadHomestay, updateHomestay } = useHomestayDetail(homestayId);
  const { facilities, bedTypes, currencies, areaUnits, loadAllData } = useMasterData();
  const { formData, setFormData, updateField, updateNestedField } = useFormState<HomestayFormData>({
    basicInfo: {
      propertyName: '',
      propertyAddress: '',
      contactNumber: '',
      ownerId: 0,
    },
    descriptionAndImages: {
      description: '',
      imageMetadata: [],
    },
    facilities: {
      facilityIds: [],
      customFacilities: [],
    },
    rooms: [],
    status: 'PENDING',
    discount: 0,
    vipAccess: false,
  });

  // State
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadHomestay();
      loadAllData();
    }
  }, [status, session, router, loadHomestay, loadAllData]);

  // Populate form when homestay data loads
  useEffect(() => {
    if (homestay) {
      setFormData({
        basicInfo: {
          propertyName: homestay.name || '',
          propertyAddress: homestay.address || '',
          contactNumber: homestay.contactNumber || '',
          ownerId: homestay.ownerId || homestay.owner?.id || 0,
        },
        descriptionAndImages: {
          description: homestay.description || '',
          imageMetadata: homestay.images?.map((img: any) => ({
            url: img.url,
            isMain: img.isMain,
            tags: img.tags || [],
          })) || [],
        },
        facilities: {
          facilityIds: homestay.facilities?.map((f: any) => f.facilityId || f.facility?.id) || [],
          customFacilities: homestay.customFacilities || [],
        },
        rooms: homestay.rooms?.map((room: any) => ({
          id: room.id,
          name: room.name || '',
          description: room.description || '',
          totalArea: room.totalArea || 0,
          areaUnit: room.areaUnit || 'sqm',
          maxOccupancy: {
            adults: room.maxOccupancy?.adults || room.maxOccupancy || 2,
            children: room.maxOccupancy?.children || 0,
          },
          minOccupancy: {
            adults: room.minOccupancy?.adults || room.minOccupancy || 1,
            children: room.minOccupancy?.children || 0,
          },
          price: {
            value: room.price?.value || room.price || 0,
            currency: room.price?.currency || room.currency || 'NPR',
          },
          includeBreakfast: room.includeBreakfast || false,
          beds: room.beds?.map((bed: any) => ({
            bedTypeId: bed.bedTypeId || bed.bedType?.id,
            quantity: bed.quantity || 1,
          })) || [],
          images: room.images?.map((img: any) => ({
            url: img.url,
            isMain: img.isMain,
            tags: img.tags || [],
          })) || [],
        })) || [],
        status: homestay.status || 'PENDING',
        discount: homestay.discount || 0,
        vipAccess: homestay.vipAccess || false,
      });
    }
  }, [homestay, setFormData]);

  // Handlers
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      // Validation
      if (!formData.basicInfo.propertyName.trim()) {
        throw new Error('Property name is required');
      }
      if (!formData.basicInfo.propertyAddress.trim()) {
        throw new Error('Property address is required');
      }
      if (!formData.basicInfo.contactNumber.trim()) {
        throw new Error('Contact number is required');
      }
      if (formData.rooms.length === 0) {
        throw new Error('At least one room is required');
      }

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append('propertyName', formData.basicInfo.propertyName);
      formDataToSend.append('propertyAddress', formData.basicInfo.propertyAddress);
      formDataToSend.append('contactNumber', formData.basicInfo.contactNumber);
      formDataToSend.append('ownerId', formData.basicInfo.ownerId.toString());
      formDataToSend.append('status', formData.status);
      formDataToSend.append('discount', formData.discount.toString());
      formDataToSend.append('vipAccess', formData.vipAccess.toString());

      if (formData.descriptionAndImages.description) {
        formDataToSend.append('description', formData.descriptionAndImages.description);
      }

      // Process images
      const newImages = formData.descriptionAndImages.imageMetadata.filter(img => img.file);
      const imageMetadata = formData.descriptionAndImages.imageMetadata.map(img => ({
        url: img.url || undefined,
        isMain: img.isMain,
        tags: img.tags || [],
      }));
      formDataToSend.append('imageMetadata', JSON.stringify(imageMetadata));
      newImages.forEach(img => {
        if (img.file) {
          formDataToSend.append('images', img.file);
        }
      });

      formDataToSend.append('facilityIds', JSON.stringify(formData.facilities.facilityIds));
      formDataToSend.append('customFacilities', JSON.stringify(formData.facilities.customFacilities));

      // Process rooms
      const processedRooms = formData.rooms.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description || '',
        totalArea: Number(room.totalArea) || 0,
        areaUnit: room.areaUnit,
        maxOccupancy: {
          adults: Number(room.maxOccupancy.adults) || 0,
          children: Number(room.maxOccupancy.children) || 0,
        },
        minOccupancy: {
          adults: Number(room.minOccupancy.adults) || 0,
          children: Number(room.minOccupancy.children) || 0,
        },
        price: {
          value: Number(room.price.value) || 0,
          currency: room.price.currency,
        },
        includeBreakfast: Boolean(room.includeBreakfast),
        beds: room.beds.map(bed => ({
          bedTypeId: Number(bed.bedTypeId),
          quantity: Number(bed.quantity) || 1,
        })),
        images: room.images.map(img => ({
          url: img.url || undefined,
          isMain: img.isMain,
          tags: img.tags || [],
        })),
      }));

      // Append room images
      formData.rooms.forEach((room, roomIndex) => {
        room.images.filter(img => img.file).forEach(img => {
          if (img.file) {
            formDataToSend.append(`roomImages[${roomIndex}]`, img.file);
          }
        });
      });

      formDataToSend.append('rooms', JSON.stringify(processedRooms));

      // Call updateHomestay with FormData
      await updateHomestay(formDataToSend);

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Homestay updated successfully',
      });

      router.push(`/admin/homestays/${homestayId}`);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save homestay');
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save homestay',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const addRoom = () => {
    const newRoom: Room = {
      name: '',
      description: '',
      totalArea: 0,
      areaUnit: areaUnits[0]?.name || 'sqm',
      maxOccupancy: { adults: 2, children: 0 },
      minOccupancy: { adults: 1, children: 0 },
      price: { value: 0, currency: currencies[0]?.code || 'NPR' },
      includeBreakfast: false,
      beds: [],
      images: [],
    };
    updateField('rooms', [...formData.rooms, newRoom]);
  };

  const updateRoom = (index: number, room: Room) => {
    const updatedRooms = formData.rooms.map((r, i) => i === index ? room : r);
    updateField('rooms', updatedRooms);
  };

  const removeRoom = (index: number) => {
    updateField('rooms', formData.rooms.filter((_, i) => i !== index));
  };

  const addHomestayImages = (newImages: ImageWithPreview[]) => {
    updateNestedField('descriptionAndImages', 'imageMetadata', [
      ...formData.descriptionAndImages.imageMetadata,
      ...newImages
    ]);
  };

  const removeHomestayImage = (index: number) => {
    const updatedImages = formData.descriptionAndImages.imageMetadata.filter((_, i) => i !== index);
    updateNestedField('descriptionAndImages', 'imageMetadata', updatedImages);
  };

  const updateHomestayImage = (index: number, updates: Partial<ImageWithPreview>) => {
    const updatedImages = formData.descriptionAndImages.imageMetadata.map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    updateNestedField('descriptionAndImages', 'imageMetadata', updatedImages);
  };

  // Early returns
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading homestay..." />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Error"
          message={error}
          actions={
            <ActionButton onClick={() => router.push('/admin/homestays')} variant="secondary">
              Back to Homestays
            </ActionButton>
          }
        />
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Not Found"
          message="Homestay not found"
          actions={
            <ActionButton onClick={() => router.push('/admin/homestays')} variant="secondary">
              Back to Homestays
            </ActionButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={() => router.push(`/admin/homestays/${homestayId}`)}
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Homestay
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {homestay.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={() => router.push(`/admin/homestays/${homestayId}`)}
                variant="secondary"
                icon={<X className="h-4 w-4" />}
                disabled={saveLoading}
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleSave}
                variant="primary"
                loading={saveLoading}
                icon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {saveError && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Save Error"
              message={saveError}
              onClose={() => setSaveError(null)}
            />
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Basic Information">
              <div className="space-y-4">
                <Input
                  label="Property Name"
                  value={formData.basicInfo.propertyName}
                  onChange={(e) => updateNestedField('basicInfo', 'propertyName', e.target.value)}
                  placeholder="Enter property name"
                  required
                />

                <TextArea
                  label="Property Address"
                  value={formData.basicInfo.propertyAddress}
                  onChange={(e) => updateNestedField('basicInfo', 'propertyAddress', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                  required
                />

                <Input
                  label="Contact Number"
                  value={formData.basicInfo.contactNumber}
                  onChange={(e) => updateNestedField('basicInfo', 'contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  required
                />

                <Input
                  label="Owner ID"
                  type="number"
                  value={formData.basicInfo.ownerId}
                  onChange={(e) => updateNestedField('basicInfo', 'ownerId', Number(e.target.value))}
                  placeholder="Enter owner ID"
                  required
                />
              </div>
            </Card>

            {/* Settings */}
            <Card title="Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => updateField('discount', Number(e.target.value))}
                  placeholder="Enter discount percentage"
                />

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.vipAccess}
                      onChange={(e) => updateField('vipAccess', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      VIP Access
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          <Card title="Description">
            <TextArea
              value={formData.descriptionAndImages.description}
              onChange={(e) => updateNestedField('descriptionAndImages', 'description', e.target.value)}
              placeholder="Describe your homestay..."
              rows={6}
            />
          </Card>

          {/* Images */}
          <ImageUploadSection
            title="Homestay Images"
            images={formData.descriptionAndImages.imageMetadata}
            onImageAdd={addHomestayImages}
            onImageRemove={removeHomestayImage}
            onImageUpdate={updateHomestayImage}
          />

          {/* Facilities */}
          <FacilitiesSection
            selectedFacilities={formData.facilities.facilityIds}
            customFacilities={formData.facilities.customFacilities}
            onFacilitiesChange={(facilityIds) => updateNestedField('facilities', 'facilityIds', facilityIds)}
            onCustomFacilitiesChange={(customFacilities) => updateNestedField('facilities', 'customFacilities', customFacilities)}
          />

          {/* Rooms */}
          <Card
            title={`Rooms (${formData.rooms.length})`}
            actions={
              <ActionButton
                onClick={addRoom}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Add Room
              </ActionButton>
            }
          >
            {formData.rooms.length === 0 ? (
              <div className="text-center py-8">
                <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No rooms added</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Add rooms to complete your homestay listing
                </p>
                <ActionButton
                  onClick={addRoom}
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                  className="mt-4"
                >
                  Add Your First Room
                </ActionButton>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.rooms.map((room, index) => (
                  <RoomEditor
                    key={index}
                    room={room}
                    onUpdate={(updatedRoom) => updateRoom(index, updatedRoom)}
                    onRemove={() => removeRoom(index)}
                    currencies={currencies}
                    bedTypes={bedTypes}
                    areaUnits={areaUnits}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}