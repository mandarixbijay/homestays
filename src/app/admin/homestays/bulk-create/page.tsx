// components/admin/ImprovedBulkHomestayCreate.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, X, Home, Bed, Eye, EyeOff,
  AlertCircle, CheckCircle, Info, Trash2, Copy, Upload,
  Download, FileText, Settings
} from 'lucide-react';

import {
  useHomestays,
  useMasterData,
  useImageManager,
  useHomestayValidation,
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
  StatusBadge,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

interface HomestayBulkData {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  description: string;
  imageMetadata: ImageWithPreview[];
  facilityIds: number[];
  customFacilities: { name: string }[];
  ownerId: number;
  rooms: any[];
  status: string;
  discount: number;
  vipAccess: boolean;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const BulkProgressSummary: React.FC<{
  homestays: HomestayBulkData[];
  validationErrors: Record<number, string[]>;
  onCreateAll: () => void;
  loading: boolean;
}> = ({ homestays, validationErrors, onCreateAll, loading }) => {
  const totalHomestays = homestays.length;
  const completedHomestays = homestays.filter((_, index) => !validationErrors[index]).length;
  const totalRooms = homestays.reduce((sum, h) => sum + h.rooms.length, 0);
  const totalImages = homestays.reduce((sum, h) =>
    sum + h.imageMetadata.length + h.rooms.reduce((roomSum, r) => roomSum + r.images.length, 0), 0
  );
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <Card className="sticky top-4 z-10 border-2 border-[#1A403D]/20 bg-[#1A403D]/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : completedHomestays === totalHomestays ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Info className="h-5 w-5 text-[#1A403D]" />
            )}
            <div>
              <span className="text-sm font-medium text-gray-900">
                {completedHomestays} of {totalHomestays} homestays ready
              </span>
              {hasErrors && (
                <p className="text-xs text-red-600">
                  {Object.keys(validationErrors).length} homestay{Object.keys(validationErrors).length !== 1 ? 's' : ''} with errors
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{totalRooms} rooms</span>
            <span>{totalImages} images</span>
          </div>
        </div>
        
        <ActionButton
          onClick={onCreateAll}
          variant="primary"
          loading={loading}
          icon={<Save className="h-4 w-4" />}
          disabled={totalHomestays === 0 || hasErrors}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          Create {totalHomestays} Homestay{totalHomestays !== 1 ? 's' : ''}
        </ActionButton>
      </div>
    </Card>
  );
};

const ValidationErrorsDisplay: React.FC<{
  errors: string[];
  title: string;
}> = ({ errors, title }) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-red-800 mb-2">
            {title}
          </h4>
          <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
            {errors.map((error, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const QuickActionsPanel: React.FC<{
  onDuplicate: (index: number) => void;
  onImportTemplate: () => void;
  onExportTemplate: () => void;
  selectedHomestays: Set<number>;
  onBulkDelete: () => void;
  onBulkEdit: () => void;
}> = ({ 
  onDuplicate, 
  onImportTemplate, 
  onExportTemplate, 
  selectedHomestays,
  onBulkDelete,
  onBulkEdit
}) => {
  return (
    <Card title="Quick Actions" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ActionButton
          onClick={onImportTemplate}
          variant="secondary"
          icon={<Upload className="h-4 w-4" />}
          size="sm"
          fullWidth
        >
          Import Template
        </ActionButton>
        
        <ActionButton
          onClick={onExportTemplate}
          variant="secondary"
          icon={<Download className="h-4 w-4" />}
          size="sm"
          fullWidth
        >
          Export Template
        </ActionButton>
        
        {selectedHomestays.size > 0 && (
          <>
            <ActionButton
              onClick={onBulkEdit}
              variant="secondary"
              icon={<Settings className="h-4 w-4" />}
              size="sm"
              fullWidth
            >
              Bulk Edit ({selectedHomestays.size})
            </ActionButton>
            
            <ActionButton
              onClick={onBulkDelete}
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              size="sm"
              fullWidth
            >
              Delete Selected
            </ActionButton>
          </>
        )}
      </div>
    </Card>
  );
};

const HomestayBulkCard: React.FC<{
  homestay: HomestayBulkData;
  index: number;
  expanded: boolean;
  errors: string[];
  onToggleExpansion: () => void;
  onUpdate: (field: keyof HomestayBulkData, value: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onImageUpload: (files: FileList) => void;
  onImageRemove: (imageIndex: number) => void;
  onImageSetMain: (imageIndex: number) => void;
  facilities: any[];
  currencies: any[];
  areaUnits: any[];
  bedTypes: any[];
  selected: boolean;
  onSelect: (selected: boolean) => void;
}> = ({
  homestay,
  index,
  expanded,
  errors,
  onToggleExpansion,
  onUpdate,
  onRemove,
  onDuplicate,
  onImageUpload,
  onImageRemove,
  onImageSetMain,
  facilities,
  currencies,
  areaUnits,
  bedTypes,
  selected,
  onSelect
}) => {
  const hasErrors = errors.length > 0;

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 ${hasErrors ? 'border-red-200' : 'border-gray-200'}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300 text-[#1A403D] shadow-sm focus:border-[#1A403D] focus:ring focus:ring-[#1A403D]/20 focus:ring-opacity-50"
          />

          <ActionButton
            onClick={onToggleExpansion}
            variant="secondary"
            size="xs"
            icon={expanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {homestay.propertyName || `Homestay ${index + 1}`}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={hasErrors ? 'Errors' : 'Ready'} variant="small" />
              <span className="text-xs text-gray-500">
                {homestay.rooms.length} rooms • {homestay.imageMetadata.length} images
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={onDuplicate}
            variant="secondary"
            size="xs"
            icon={<Copy className="h-3 w-3" />}
          >
            Duplicate
          </ActionButton>
          <ActionButton
            onClick={onRemove}
            variant="danger"
            size="xs"
            icon={<Trash2 className="h-3 w-3" />}
          >
            Remove
          </ActionButton>
        </div>
      </div>

      {/* Errors Summary */}
      {hasErrors && (
        <ValidationErrorsDisplay
          errors={errors}
          title={`${errors.length} Error${errors.length !== 1 ? 's' : ''} in Homestay ${index + 1}:`}
        />
      )}

      {/* Card Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Property Name"
              value={homestay.propertyName}
              onChange={(e) => onUpdate('propertyName', e.target.value)}
              placeholder="Enter property name"
              required
            />

            <Input
              label="Contact Number"
              value={homestay.contactNumber}
              onChange={(e) => onUpdate('contactNumber', e.target.value)}
              placeholder="Enter contact number"
              required
            />

            <div className="md:col-span-2">
              <TextArea
                label="Address"
                value={homestay.propertyAddress}
                onChange={(e) => onUpdate('propertyAddress', e.target.value)}
                rows={2}
                placeholder="Enter property address"
                required
              />
            </div>

            <Input
              label="Owner ID"
              type="number"
              value={homestay.ownerId || ''}
              onChange={(e) => onUpdate('ownerId', parseInt(e.target.value) || 0)}
              placeholder="Enter owner ID"
              required
            />
          </div>

          {/* Description */}
          <TextArea
            label="Description"
            value={homestay.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={3}
            placeholder="Describe the homestay..."
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Homestay Images
            </label>
            <ImageUpload
              onUpload={onImageUpload}
              className="mb-4"
            />
            <ImagePreview
              images={homestay.imageMetadata}
              onRemove={onImageRemove}
              onSetMain={onImageSetMain}
            />
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Facilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {facilities.map((facility: any) => (
                <label key={facility.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homestay.facilityIds?.includes(facility.id) || false}
                    onChange={(e) => {
                      const currentIds = homestay.facilityIds || [];
                      const updatedIds = e.target.checked
                        ? [...currentIds, facility.id]
                        : currentIds.filter(id => id !== facility.id);
                      onUpdate('facilityIds', updatedIds);
                    }}
                    className="rounded border-gray-300 text-[#1A403D] shadow-sm focus:border-[#1A403D] focus:ring focus:ring-[#1A403D]/20 focus:ring-opacity-50"
                  />
                  <span className="text-xs text-gray-700">{facility.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={homestay.status}
                onChange={(e) => onUpdate('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20"
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
              value={homestay.discount || 0}
              onChange={(e) => onUpdate('discount', parseInt(e.target.value) || 0)}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={homestay.vipAccess || false}
                  onChange={(e) => onUpdate('vipAccess', e.target.checked)}
                  className="rounded border-gray-300 text-[#1A403D] shadow-sm focus:border-[#1A403D] focus:ring focus:ring-[#1A403D]/20 focus:ring-opacity-50"
                />
                <span className="text-sm text-gray-700">VIP Access</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImprovedBulkHomestayCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const { createBulkHomestays, loading: submitLoading } = useHomestays();
  const { facilities, currencies, areaUnits, bedTypes, loadAllData, loading: masterDataLoading } = useMasterData();
  const { handleImageUpload } = useImageManager();
  const { validateBulkHomestays } = useHomestayValidation();

  // State
  const [homestays, setHomestays] = useState<HomestayBulkData[]>([]);
  const [expandedHomestays, setExpandedHomestays] = useState<Set<number>>(new Set([0]));
  const [selectedHomestays, setSelectedHomestays] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // Validation effect
  useEffect(() => {
    const errors = validateBulkHomestays(homestays);
    setValidationErrors(errors);
  }, [homestays, validateBulkHomestays]);

  // Helpers
  const createEmptyHomestay = useCallback((): HomestayBulkData => ({
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
  }), []);

  // Handlers
  const addHomestay = useCallback(() => {
    const newHomestay = createEmptyHomestay();
    setHomestays(prev => [...prev, newHomestay]);
    const newIndex = homestays.length;
    setExpandedHomestays(prev => new Set([...prev, newIndex]));
  }, [homestays.length, createEmptyHomestay]);

  const removeHomestay = useCallback((index: number) => {
    if (homestays.length === 1) {
      addToast({
        type: 'warning',
        title: 'Cannot Remove',
        message: 'At least one homestay is required'
      });
      return;
    }

    setHomestays(prev => prev.filter((_, i) => i !== index));
    setExpandedHomestays(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for remaining items
      const adjustedSet = new Set<number>();
      newSet.forEach(i => {
        if (i < index) adjustedSet.add(i);
        else if (i > index) adjustedSet.add(i - 1);
      });
      return adjustedSet;
    });
    setSelectedHomestays(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for remaining items
      const adjustedSet = new Set<number>();
      newSet.forEach(i => {
        if (i < index) adjustedSet.add(i);
        else if (i > index) adjustedSet.add(i - 1);
      });
      return adjustedSet;
    });
  }, [homestays.length, addToast]);

  const updateHomestay = useCallback((index: number, field: keyof HomestayBulkData, value: any) => {
    setHomestays(prev => prev.map((homestay, i) =>
      i === index ? { ...homestay, [field]: value } : homestay
    ));
  }, []);

  const duplicateHomestay = useCallback((index: number) => {
    const homestayToDuplicate = { ...homestays[index] };
    homestayToDuplicate.propertyName = `${homestayToDuplicate.propertyName} (Copy)`;
    
    setHomestays(prev => [...prev, homestayToDuplicate]);
    const newIndex = homestays.length;
    setExpandedHomestays(prev => new Set([...prev, newIndex]));
  }, [homestays]);

  const toggleHomestayExpansion = useCallback((index: number) => {
    setExpandedHomestays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleHomestaySelection = useCallback((index: number, selected: boolean) => {
    setSelectedHomestays(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const handleHomestayImageUpload = useCallback(async (homestayIndex: number, files: FileList) => {
    try {
      await handleImageUpload(`homestay-${homestayIndex}`, files, (imageData) => {
        const updatedImages = [...homestays[homestayIndex].imageMetadata, imageData];
        if (updatedImages.length === 1) {
          imageData.isMain = true;
        }
        updateHomestay(homestayIndex, 'imageMetadata', updatedImages);
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: error instanceof Error ? error.message : 'Failed to upload images'
      });
    }
  }, [homestays, handleImageUpload, updateHomestay, addToast]);

  const removeImage = useCallback((homestayIndex: number, imageIndex: number) => {
    const updatedImages = homestays[homestayIndex].imageMetadata.filter((_, i) => i !== imageIndex);
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    updateHomestay(homestayIndex, 'imageMetadata', updatedImages);
  }, [homestays, updateHomestay]);

  const setMainImage = useCallback((homestayIndex: number, imageIndex: number) => {
    const updatedImages = homestays[homestayIndex].imageMetadata.map((img, i) => ({
      ...img,
      isMain: i === imageIndex,
    }));
    updateHomestay(homestayIndex, 'imageMetadata', updatedImages);
  }, [homestays, updateHomestay]);

  const handleBulkDelete = useCallback(() => {
    if (selectedHomestays.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedHomestays.size} selected homestay${selectedHomestays.size !== 1 ? 's' : ''}?`)) return;

    setHomestays(prev => prev.filter((_, index) => !selectedHomestays.has(index)));
    setSelectedHomestays(new Set());
    setExpandedHomestays(prev => {
      const newSet = new Set<number>();
      Array.from(prev).forEach(index => {
        const newIndex = index - Array.from(selectedHomestays).filter(i => i < index).length;
        if (newIndex >= 0) newSet.add(newIndex);
      });
      return newSet;
    });
  }, [selectedHomestays]);

  const handleBulkEdit = useCallback(() => {
    addToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Bulk edit functionality will be available soon'
    });
  }, [addToast]);

  const handleImportTemplate = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            if (Array.isArray(importedData)) {
              setHomestays(importedData);
              addToast({
                type: 'success',
                title: 'Import Successful',
                message: `Imported ${importedData.length} homestays`
              });
            }
          } catch (error) {
            addToast({
              type: 'error',
              title: 'Import Failed',
              message: 'Invalid file format'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [addToast]);

  const handleExportTemplate = useCallback(() => {
    const dataStr = JSON.stringify(homestays, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bulk-homestays-template-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [homestays]);

  const handleSave = useCallback(async () => {
    try {
      setSaveError(null);

      if (homestays.length === 0) {
        setSaveError('Please add at least one homestay before saving.');
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        setSaveError('Please fix all validation errors before saving.');
        return;
      }

      const result = await createBulkHomestays(homestays);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: `Successfully created ${homestays.length} homestays!`
      });

      router.push('/admin/homestays?created=bulk');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create homestays';
      setSaveError(errorMessage);
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    }
  }, [homestays, validationErrors, createBulkHomestays, addToast, router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="p-2 bg-[#1A403D]/10 rounded-lg">
                  <Home className="h-5 w-5 text-[#1A403D]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Create Bulk Homestays
                  </h1>
                  <p className="text-sm text-gray-500">
                    Add multiple homestays to the platform efficiently
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
                disabled={homestays.length === 0 || Object.keys(validationErrors).length > 0}
              >
                Create {homestays.length} Homestay{homestays.length !== 1 ? 's' : ''}
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Messages */}
        {saveError && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Error"
              message={saveError}
              onClose={() => setSaveError(null)}
            />
          </div>
        )}

        {/* Progress Summary */}
        <BulkProgressSummary
          homestays={homestays}
          validationErrors={validationErrors}
          onCreateAll={handleSave}
          loading={submitLoading}
        />

        {/* Quick Actions */}
        <QuickActionsPanel
          onDuplicate={duplicateHomestay}
          onImportTemplate={handleImportTemplate}
          onExportTemplate={handleExportTemplate}
          selectedHomestays={selectedHomestays}
          onBulkDelete={handleBulkDelete}
          onBulkEdit={handleBulkEdit}
        />

        {/* Add Homestay Button */}
        <div className="mb-6">
          <ActionButton
            onClick={addHomestay}
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            className="bg-gradient-to-r from-[#1A403D] to-[#214B3F] hover:from-[#214B3F] hover:to-[#2A5B4F]"
          >
            Add Homestay
          </ActionButton>
        </div>

        {/* Empty State */}
        {homestays.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No homestays added yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first homestay to create multiple properties at once.
              </p>
              <ActionButton
                onClick={addHomestay}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Add First Homestay
              </ActionButton>
            </div>
          </Card>
        )}

        {/* Homestays List */}
        <div className="space-y-6">
          {homestays.map((homestay, homestayIndex) => (
            <HomestayBulkCard
              key={homestayIndex}
              homestay={homestay}
              index={homestayIndex}
              expanded={expandedHomestays.has(homestayIndex)}
              errors={validationErrors[homestayIndex] || []}
              onToggleExpansion={() => toggleHomestayExpansion(homestayIndex)}
              onUpdate={(field, value) => updateHomestay(homestayIndex, field, value)}
              onRemove={() => removeHomestay(homestayIndex)}
              onDuplicate={() => duplicateHomestay(homestayIndex)}
              onImageUpload={(files) => handleHomestayImageUpload(homestayIndex, files)}
              onImageRemove={(imageIndex) => removeImage(homestayIndex, imageIndex)}
              onImageSetMain={(imageIndex) => setMainImage(homestayIndex, imageIndex)}
              facilities={facilities}
              currencies={currencies}
              areaUnits={areaUnits}
              bedTypes={bedTypes}
              selected={selectedHomestays.has(homestayIndex)}
              onSelect={(selected) => toggleHomestaySelection(homestayIndex, selected)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}