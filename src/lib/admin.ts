// lib/admin.ts
import { useState, useCallback } from 'react';
import { adminApi } from './api/admin';
import { 
  CreateHomestayDto, 
  CreateBulkHomestaysDto, 
  UpdateHomestayDto,
  RoomDto,
  ImageMetadataDto,
  RoomImageDto,
  HomestayStatus,
  convertLegacyHomestayDto,
  convertToLegacyHomestayDto 
} from '@/types/admin';

// Validation utilities
export class HomestayValidator {
  static validateBasicInfo(data: Partial<CreateHomestayDto>): string[] {
    const errors: string[] = [];
    
    if (!data.propertyName?.trim()) {
      errors.push('Property name is required');
    }
    
    if (!data.propertyAddress?.trim()) {
      errors.push('Property address is required');
    }
    
    if (!data.contactNumber?.trim()) {
      errors.push('Contact number is required');
    }
    
    if (!data.ownerId || data.ownerId <= 0) {
      errors.push('Valid owner ID is required');
    }
    
    return errors;
  }
  
  static validateRooms(rooms: RoomDto[]): string[] {
    const errors: string[] = [];
    
    if (!rooms || rooms.length === 0) {
      errors.push('At least one room is required');
    }
    
    rooms.forEach((room, index) => {
      if (!room.name?.trim()) {
        errors.push(`Room ${index + 1}: Name is required`);
      }
      
      if (!room.price?.value || room.price.value <= 0) {
        errors.push(`Room ${index + 1}: Valid price is required`);
      }
      
      if (!room.maxOccupancy || (room.maxOccupancy.adults + room.maxOccupancy.children) <= 0) {
        errors.push(`Room ${index + 1}: Maximum occupancy must be greater than 0`);
      }
      
      if (!room.minOccupancy || (room.minOccupancy.adults + room.minOccupancy.children) <= 0) {
        errors.push(`Room ${index + 1}: Minimum occupancy must be greater than 0`);
      }
      
      if (room.images && !room.images.some(img => img.isMain)) {
        errors.push(`Room ${index + 1}: One image must be marked as main`);
      }
    });
    
    return errors;
  }
  
  static validateImages(images: ImageMetadataDto[]): string[] {
    const errors: string[] = [];
    
    if (!images || images.length === 0) {
      errors.push('At least one homestay image is required');
    }
    
    const mainImages = images.filter(img => img.isMain);
    if (mainImages.length !== 1) {
      errors.push('Exactly one image must be marked as main');
    }
    
    return errors;
  }
  
  static validateHomestay(data: CreateHomestayDto): string[] {
    const errors: string[] = [];
    
    errors.push(...this.validateBasicInfo(data));
    errors.push(...this.validateRooms(data.rooms));
    errors.push(...this.validateImages(data.imageMetadata));
    
    return errors;
  }
}

// File processing utilities
export class FileProcessor {
  static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff', 
    'image/avif', 'image/heic', 'image/heif'
  ];
  
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select a valid image file' };
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'Image file size must be less than 10MB' };
    }
    
    return { isValid: true };
  }
  
  static async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  static extractFilesFromHomestay(homestay: CreateHomestayDto): {
    files: File[];
    homestayWithoutFiles: CreateHomestayDto;
  } {
    const files: File[] = [];
    
    // Process homestay images
    const imageMetadata = homestay.imageMetadata.map(img => {
      if (img.file) {
        files.push(img.file);
        return {
          isMain: img.isMain,
          tags: img.tags || [],
        };
      }
      return img;
    });
    
    // Process room images
    const rooms = homestay.rooms.map(room => {
      const roomImages = room.images.map(img => {
        if ((img as any).file) {
          files.push((img as any).file);
          return {
            isMain: img.isMain,
            tags: img.tags || [],
          };
        }
        return img;
      });
      
      return {
        ...room,
        images: roomImages,
      };
    });
    
    return {
      files,
      homestayWithoutFiles: {
        ...homestay,
        imageMetadata,
        rooms,
      },
    };
  }
  
  static extractFilesFromBulkHomestays(homestays: CreateHomestayDto[]): {
    files: File[];
    homestaysWithoutFiles: CreateHomestayDto[];
  } {
    const allFiles: File[] = [];
    
    const homestaysWithoutFiles = homestays.map(homestay => {
      const { files, homestayWithoutFiles } = this.extractFilesFromHomestay(homestay);
      allFiles.push(...files);
      return homestayWithoutFiles;
    });
    
    return {
      files: allFiles,
      homestaysWithoutFiles,
    };
  }
}

// Data transformation utilities
export class DataTransformer {
  static prepareHomestayForAPI(data: any): CreateHomestayDto {
    // Handle both new and legacy formats
    if (data.basicInfo) {
      // Legacy format - convert to new format
      return convertLegacyHomestayDto(data);
    }
    
    // Already in new format
    return data as CreateHomestayDto;
  }
  
  static prepareBulkHomestaysForAPI(homestays: any[]): CreateHomestayDto[] {
    return homestays.map(homestay => this.prepareHomestayForAPI(homestay));
  }
  
  static addFilesToImageMetadata(
    imageMetadata: ImageMetadataDto[],
    files: File[]
  ): ImageMetadataDto[] {
    let fileIndex = 0;
    
    return imageMetadata.map(img => {
      if (!img.url && fileIndex < files.length) {
        return {
          ...img,
          file: files[fileIndex++],
        };
      }
      return img;
    });
  }
}

// Custom hooks for admin operations
export function useHomestayOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createHomestay = useCallback(async (
    homestayData: CreateHomestayDto | any, // Accept both formats
    imageFiles: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const normalizedData = DataTransformer.prepareHomestayForAPI(homestayData);
      const validationErrors = HomestayValidator.validateHomestay(normalizedData);
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }
      
      const result = await adminApi.createHomestay(normalizedData, imageFiles);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create homestay';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createBulkHomestays = useCallback(async (
    homestays: CreateHomestayDto[] | any[], // Accept both formats
    imageFiles: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const normalizedHomestays = DataTransformer.prepareBulkHomestaysForAPI(homestays);
      
      // Validate all homestays
      const allErrors: string[] = [];
      normalizedHomestays.forEach((homestay, index) => {
        const errors = HomestayValidator.validateHomestay(homestay);
        if (errors.length > 0) {
          allErrors.push(`Homestay ${index + 1}: ${errors.join(', ')}`);
        }
      });
      
      if (allErrors.length > 0) {
        throw new Error(allErrors.join('; '));
      }
      
      const result = await adminApi.createBulkHomestays(normalizedHomestays, imageFiles);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create homestays';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateHomestay = useCallback(async (
    id: number,
    homestayData: Partial<CreateHomestayDto> | any,
    imageFiles: File[] = []
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminApi.updateHomestay(id, homestayData, imageFiles);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update homestay';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    createHomestay,
    createBulkHomestays,
    updateHomestay,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Form state management utilities
export function useFormState<T>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);
  
  const updateNestedField = useCallback((
    section: keyof T,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as object) || {}),
        [field]: value,
      },
    }));
  }, []);
  
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);
  
  const validateRequired = useCallback((fields: (keyof T)[]): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field as string] = 'This field is required';
        isValid = false;
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  }, [formData]);
  
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);
  
  return {
    formData,
    setFormData,
    errors,
    touched,
    updateField,
    updateNestedField,
    setFieldError,
    setFieldTouched,
    validateRequired,
    resetForm,
  };
}

// Image management utilities
export function useImageManager() {
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  
  const handleImageUpload = useCallback(async (
    key: string,
    files: FileList,
    onImageAdd: (imageData: ImageMetadataDto | RoomImageDto) => void
  ) => {
    setUploadingImages(prev => ({ ...prev, [key]: true }));
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = FileProcessor.validateImageFile(file);
        
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
        
        const preview = await FileProcessor.createImagePreview(file);
        const imageData = {
          file,
          preview,
          isMain: false, // Will be set by the calling component
          tags: [],
        } as ImageMetadataDto;
        
        onImageAdd(imageData);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploadingImages(prev => ({ ...prev, [key]: false }));
    }
  }, []);
  
  const isUploading = useCallback((key: string) => {
    return uploadingImages[key] || false;
  }, [uploadingImages]);
  
  return {
    handleImageUpload,
    isUploading,
  };
}

// Export utilities as default object
const AdminUtils = {
  Validator: HomestayValidator,
  FileProcessor,
  DataTransformer,
  useHomestayOperations,
  useFormState,
  useImageManager,
};

export default AdminUtils;