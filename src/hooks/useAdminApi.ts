import { useState, useCallback, useRef } from 'react';
import { adminApi } from '@/lib/api/admin';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageWithPreview {
  file?: File;
  preview?: string;
  url?: string;
  isMain: boolean;
  tags: string[];
}

export interface HomestayData {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  description?: string;
  imageMetadata: ImageWithPreview[];
  facilityIds?: number[];
  customFacilities?: string[];
  ownerId: number | string;
  rooms: any[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  discount?: number | string;
  vipAccess?: boolean;
}

export interface HomestayFilters {
  search: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  ownerId: string;
  address: string;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalHomestays: number;
  pendingHomestays: number;
  approvedHomestays: number;
  rejectedHomestays: number;
  totalUsers: number;
  activeUsers: number;
  totalRooms: number;
  averageRating: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  recentActivity: ActivityItem[];
  growthStats: {
    homestaysGrowth: number;
    usersGrowth: number;
    bookingsGrowth: number;
    revenueGrowth: number;
  };
}

export interface ActivityItem {
  id: number;
  type: 'homestay_created' | 'homestay_approved' | 'homestay_rejected' | 'user_registered' | 'booking_created' | 'payment_received';
  description: string;
  timestamp: string;
  userId?: number;
  homestayId?: number;
  bookingId?: number;
  metadata?: {
    userName?: string;
    homestayName?: string;
    amount?: number;
    status?: string;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

class FileProcessor {
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select a valid image file' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'Image file size must be less than 10MB' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'Image file cannot be empty' };
    }

    return { isValid: true };
  }

  static async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  static extractFilesFromHomestay(homestayData: HomestayData): { cleanData: any; files: File[] } {
    const files: File[] = [];

    // Process homestay images
    const cleanImageMetadata = homestayData.imageMetadata?.map((img: ImageWithPreview) => {
      if (img.file && img.file instanceof File) {
        files.push(img.file);
        return {
          isMain: img.isMain,
          tags: img.tags || [],
        };
      }
      return {
        url: img.url,
        isMain: img.isMain,
        tags: img.tags || [],
      };
    }).filter((img: any) => img.url || !img.url) || [];

    // Process rooms
    const cleanRooms = homestayData.rooms?.map((room: any) => {
      const cleanRoomImages = room.images?.map((img: ImageWithPreview) => {
        if (img.file && img.file instanceof File) {
          files.push(img.file);
          return {
            isMain: img.isMain,
            tags: img.tags || [],
          };
        }
        return {
          url: img.url,
          isMain: img.isMain,
          tags: img.tags || [],
        };
      }).filter((img: any) => img.url || !img.url) || [];

      return {
        ...room,
        totalArea: Number(room.totalArea) || 0,
        maxOccupancy: {
          adults: Number(room.maxOccupancy?.adults) || 0,
          children: Number(room.maxOccupancy?.children) || 0,
        },
        minOccupancy: {
          adults: Number(room.minOccupancy?.adults) || 0,
          children: Number(room.minOccupancy?.children) || 0,
        },
        price: {
          value: Number(room.price?.value) || 0,
          currency: room.price?.currency || 'NPR',
        },
        includeBreakfast: Boolean(room.includeBreakfast),
        beds: room.beds?.map((bed: any) => ({
          bedTypeId: Number(bed.bedTypeId),
          quantity: Number(bed.quantity) || 1,
        })) || [],
        images: cleanRoomImages,
      };
    }) || [];

    const cleanData = {
      propertyName: homestayData.propertyName,
      propertyAddress: homestayData.propertyAddress,
      contactNumber: homestayData.contactNumber,
      description: homestayData.description || '',
      imageMetadata: cleanImageMetadata,
      facilityIds: homestayData.facilityIds || [],
      customFacilities: homestayData.customFacilities || [],
      ownerId: Number(homestayData.ownerId),
      rooms: cleanRooms,
      status: homestayData.status || 'PENDING',
      discount: Number(homestayData.discount) || 0,
      vipAccess: Boolean(homestayData.vipAccess),
    };

    return { cleanData, files };
  }
}

class ValidationHelper {
  static validateHomestay(data: any): string[] {
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

    if (!data.imageMetadata || data.imageMetadata.length === 0) {
      errors.push('At least one homestay image is required');
    } else {
      const mainImages = data.imageMetadata.filter((img: any) => img.isMain);
      if (mainImages.length !== 1) {
        errors.push('Exactly one homestay image must be marked as main');
      }
    }

    if (!data.rooms || data.rooms.length === 0) {
      errors.push('At least one room is required');
    } else {
      data.rooms.forEach((room: any, index: number) => {
        if (!room.name?.trim()) {
          errors.push(`Room ${index + 1}: Name is required`);
        }

        if (!room.price?.value || room.price.value <= 0) {
          errors.push(`Room ${index + 1}: Valid price is required`);
        }

        if (!room.images || room.images.length === 0) {
          errors.push(`Room ${index + 1}: At least one image is required`);
        } else {
          const mainImages = room.images.filter((img: any) => img.isMain);
          if (mainImages.length !== 1) {
            errors.push(`Room ${index + 1}: Exactly one image must be marked as main`);
          }
        }
      });
    }

    return errors;
  }

  static validateBulkHomestays(homestays: any[]): Record<number, string[]> {
    const errors: Record<number, string[]> = {};

    if (!homestays || homestays.length === 0) {
      errors[0] = ['At least one homestay is required'];
      return errors;
    }

    homestays.forEach((homestay, index) => {
      const homestayErrors = this.validateHomestay(homestay);
      if (homestayErrors.length > 0) {
        errors[index] = homestayErrors;
      }
    });

    return errors;
  }
}

// Helper functions for dashboard calculations
export const calculateHomestayStats = (homestays: any[]) => {
  const stats = {
    totalHomestays: homestays.length,
    pendingHomestays: homestays.filter(h => h.status === 'PENDING').length,
    approvedHomestays: homestays.filter(h => h.status === 'APPROVED').length,
    rejectedHomestays: homestays.filter(h => h.status === 'REJECTED').length,
    totalRooms: homestays.reduce((total, h) => total + (h.rooms?.length || 0), 0),
    averageRating: 0
  };

  // Calculate average rating from homestays that have ratings
  const homestaysWithRatings = homestays.filter(h => h.rating && h.rating > 0);
  if (homestaysWithRatings.length > 0) {
    const totalRating = homestaysWithRatings.reduce((sum, h) => sum + h.rating, 0);
    stats.averageRating = Number((totalRating / homestaysWithRatings.length).toFixed(1));
  }

  return stats;
};

export const generateRecentActivity = (homestays: any[]): ActivityItem[] => {
  const activities: ActivityItem[] = [];

  // Sort homestays by createdAt or updatedAt, most recent first
  const sortedHomestays = [...homestays].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Generate activities for recent homestays
  sortedHomestays.slice(0, 10).forEach((homestay, index) => {
    const createdAt = new Date(homestay.createdAt);
    const updatedAt = new Date(homestay.updatedAt);

    // If updated recently and different from created date, show update activity
    if (homestay.updatedAt && updatedAt.getTime() !== createdAt.getTime()) {
      activities.push({
        id: homestay.id * 1000 + 1, // Generate unique ID
        type: 'homestay_approved', // Assume update means status change
        description: `Homestay "${homestay.name}" was updated`,
        timestamp: homestay.updatedAt,
        homestayId: homestay.id,
        metadata: {
          homestayName: homestay.name,
          status: homestay.status
        }
      });
    }

    // Show creation activity
    if (homestay.createdAt) {
      let description = `New homestay "${homestay.name}" was created`;
      let type: ActivityItem['type'] = 'homestay_created';

      if (homestay.status === 'APPROVED') {
        description = `Homestay "${homestay.name}" was approved`;
        type = 'homestay_approved';
      } else if (homestay.status === 'REJECTED') {
        description = `Homestay "${homestay.name}" was rejected`;
        type = 'homestay_rejected';
      } else if (homestay.status === 'PENDING') {
        description = `New homestay "${homestay.name}" submitted for approval`;
      }

      activities.push({
        id: homestay.id * 1000, // Generate unique ID
        type,
        description,
        timestamp: homestay.createdAt,
        homestayId: homestay.id,
        metadata: {
          homestayName: homestay.name,
          status: homestay.status
        }
      });
    }
  });

  // Sort activities by timestamp, most recent first
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // Show only 5 most recent activities
};

// ============================================================================
// CORE HOOKS
// ============================================================================

export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError
  };
}

export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(initialFilters).reduce((acc, key) => {
      (acc as any)[key] = key === 'status' ? undefined : '';
      return acc;
    }, {} as T);
    setFilters(clearedFilters);
  }, [initialFilters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilters,
    setFilters
  };
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation<DashboardStats>();

  const loadDashboardStats = useCallback(async () => {
    try {
      const result = await execute(() => adminApi.getDashboardStats());
      setStats(result);
      return result;
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      throw error;
    }
  }, [execute]);

  const loadCompleteStats = useCallback(async () => {
    try {
      // Load all dashboard data in parallel
      const [
        dashboardStats,
        homestayStats,
        usersCount,
        monthlyGrowth,
        recentActivity,
        averageRating
      ] = await Promise.all([
        adminApi.getDashboardStats().catch(() => null),
        adminApi.getHomestaysByStatus().catch(() => null),
        adminApi.getUsersCount().catch(() => null),
        adminApi.getMonthlyGrowthStats().catch(() => null),
        adminApi.getSystemActivity(10).catch(() => []),
        adminApi.getAverageRating().catch(() => null)
      ]);

      const combinedStats: DashboardStats = {
        totalHomestays: homestayStats?.total || dashboardStats?.totalHomestays || 0,
        pendingHomestays: homestayStats?.pending || dashboardStats?.pendingHomestays || 0,
        approvedHomestays: homestayStats?.approved || dashboardStats?.approvedHomestays || 0,
        rejectedHomestays: homestayStats?.rejected || dashboardStats?.rejectedHomestays || 0,
        totalUsers: usersCount?.total || dashboardStats?.totalUsers || 0,
        activeUsers: dashboardStats?.activeUsers || 0,
        totalRooms: dashboardStats?.totalRooms || 0,
        averageRating: averageRating?.averageRating || dashboardStats?.averageRating || 0,
        totalBookings: dashboardStats?.totalBookings || 0,
        totalRevenue: dashboardStats?.totalRevenue || 0,
        occupancyRate: dashboardStats?.occupancyRate || 0,
        recentActivity: recentActivity || [],
        growthStats: monthlyGrowth || {
          homestaysGrowth: 0,
          usersGrowth: 0,
          bookingsGrowth: 0,
          revenueGrowth: 0
        }
      };

      setStats(combinedStats);
      return combinedStats;
    } catch (error) {
      console.error('Error loading complete dashboard stats:', error);
      throw error;
    }
  }, [execute]);

  return {
    stats,
    loading,
    error,
    loadDashboardStats,
    loadCompleteStats,
    clearError
  };
}

// ============================================================================
// HOMESTAY OPERATIONS (existing code remains the same)
// ============================================================================

export function useHomestays() {
  const [homestays, setHomestays] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation();

  const loadHomestays = useCallback(async (params?: any) => {
    try {
      // Filter out empty or undefined values
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );
      const result = await execute(() => adminApi.getHomestays(filteredParams));
      if (result) {
        setHomestays(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading homestays:', error);
      throw error;
    }
  }, [execute]);

  const createHomestay = useCallback(async (homestayData: any) => {
    try {
      const { cleanData, files } = FileProcessor.extractFilesFromHomestay(homestayData);

      // Validate before sending
      const validationErrors = ValidationHelper.validateHomestay(cleanData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }

      const result = await execute(() => adminApi.createHomestay(cleanData, files));
      return result;
    } catch (error) {
      console.error('Error creating homestay:', error);
      throw error;
    }
  }, [execute]);

  const createBulkHomestays = useCallback(async (homestays: any[]) => {
    try {
      const allFiles: File[] = [];
      const cleanHomestays: any[] = [];

      homestays.forEach(homestay => {
        const { cleanData, files } = FileProcessor.extractFilesFromHomestay(homestay);
        cleanHomestays.push(cleanData);
        allFiles.push(...files);
      });

      // Validate all homestays
      const validationErrors = ValidationHelper.validateBulkHomestays(cleanHomestays);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors).map(
          ([index, errors]) => `Homestay ${parseInt(index) + 1}: ${errors.join(', ')}`
        );
        throw new Error(errorMessages.join('; '));
      }

      const result = await execute(() => adminApi.createBulkHomestays(cleanHomestays, allFiles));
      return result;
    } catch (error) {
      console.error('Error creating bulk homestays:', error);
      throw error;
    }
  }, [execute]);

  const updateHomestay = useCallback(async (id: number, homestayData: any) => {
    try {
      const { cleanData, files } = FileProcessor.extractFilesFromHomestay(homestayData);
      const result = await execute(() => adminApi.updateHomestay(id, cleanData, files));
      return result;
    } catch (error) {
      console.error('Error updating homestay:', error);
      throw error;
    }
  }, [execute]);

  const deleteHomestay = useCallback(async (id: number) => {
    try {
      const response = await execute(async () => {
        const result = await adminApi.deleteHomestay(id);
        return result || { success: true, message: 'Homestay deleted successfully' };
      });
      return response;
    } catch (error: any) {
      console.error('Error deleting homestay:', {
        id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.message.includes('Unexpected end of JSON input')
          ? 'Failed to delete homestay: Invalid server response'
          : error.response?.data?.message || 'Failed to delete homestay'
      );
    }
  }, [execute]);

  const approveHomestay = useCallback(async (id: number, data: any) => {
    try {
      const response = await execute(async () => {
        const result = await adminApi.approveHomestay(id, data);
        return result || { success: true, message: `Homestay ${data.status.toLowerCase()} successfully` };
      });
      return response;
    } catch (error: any) {
      console.error('Error approving homestay:', {
        id,
        data,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });
      throw new Error(
        error.message.includes('Unexpected end of JSON input')
          ? `Failed to ${data.status.toLowerCase()} homestay: Invalid server response`
          : error.response?.data?.message || `Failed to ${data.status.toLowerCase()} homestay`
      );
    }
  }, [execute]);

  return {
    homestays,
    totalPages,
    total,
    loading,
    error,
    loadHomestays,
    createHomestay,
    createBulkHomestays,
    updateHomestay,
    deleteHomestay,
    approveHomestay,
    clearError
  };
}

// ============================================================================
// REST OF THE HOOKS (unchanged)
// ============================================================================

export function useHomestayDetail(homestayId: number) {
  const [homestay, setHomestay] = useState<any>(null);
  const { loading, error, execute, clearError } = useAsyncOperation();

  const loadHomestay = useCallback(async () => {
    try {
      const result = await execute(() => adminApi.getHomestay(homestayId));
      setHomestay(result);
      return result;
    } catch (error) {
      console.error('Error loading homestay:', error);
      throw error;
    }
  }, [homestayId, execute]);

  const updateHomestay = useCallback(async (data: FormData) => {
    try {
      const result = await execute(() => adminApi.updateHomestay(homestayId, data));
      setHomestay(result);
      return result;
    } catch (error) {
      console.error('Error updating homestay:', error);
      throw error;
    }
  }, [homestayId, execute]);

  return {
    homestay,
    loading,
    error,
    loadHomestay,
    updateHomestay,
    clearError
  };
}

export function useMasterData() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [bedTypes, setBedTypes] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [areaUnits, setAreaUnits] = useState<any[]>([]);
  const { loading, error, execute, clearError } = useAsyncOperation();

  const loadAllData = useCallback(async () => {
    try {
      const result = await execute(async () => {
        const [facilitiesData, bedTypesData, currenciesData, areaUnitsData] = await Promise.all([
          adminApi.getFacilities().catch(() => []),
          adminApi.getBedTypes().catch(() => []),
          adminApi.getCurrencies().catch(() => []),
          adminApi.getAreaUnits().catch(() => [])
        ]);

        setFacilities(facilitiesData || []);
        setBedTypes(bedTypesData || []);
        setCurrencies(currenciesData || []);
        setAreaUnits(areaUnitsData || []);

        return { facilitiesData, bedTypesData, currenciesData, areaUnitsData };
      });
      return result;
    } catch (error) {
      console.error('Error loading master data:', error);
      throw error;
    }
  }, [execute]);

  // Master data CRUD operations (unchanged from original)
  const createFacility = useCallback(async (data: any) => {
    const result = await execute(() => adminApi.createFacility(data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateFacility = useCallback(async (id: number, data: any) => {
    const result = await execute(() => adminApi.updateFacility(id, data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteFacility = useCallback(async (id: number) => {
    const result = await execute(() => adminApi.deleteFacility(id));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  // Similar methods for bedTypes, currencies, areaUnits...
  const createBedType = useCallback(async (data: any) => {
    const result = await execute(() => adminApi.createBedType(data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateBedType = useCallback(async (id: number, data: any) => {
    const result = await execute(() => adminApi.updateBedType(id, data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteBedType = useCallback(async (id: number) => {
    const result = await execute(() => adminApi.deleteBedType(id));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const createCurrency = useCallback(async (data: any) => {
    const result = await execute(() => adminApi.createCurrency(data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateCurrency = useCallback(async (id: number, data: any) => {
    const result = await execute(() => adminApi.updateCurrency(id, data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteCurrency = useCallback(async (id: number) => {
    const result = await execute(() => adminApi.deleteCurrency(id));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const createAreaUnit = useCallback(async (data: any) => {
    const result = await execute(() => adminApi.createAreaUnit(data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateAreaUnit = useCallback(async (id: number, data: any) => {
    const result = await execute(() => adminApi.updateAreaUnit(id, data));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteAreaUnit = useCallback(async (id: number) => {
    const result = await execute(() => adminApi.deleteAreaUnit(id));
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  return {
    facilities,
    bedTypes,
    currencies,
    areaUnits,
    loading,
    error,
    loadAllData,
    clearError,
    // Facility operations
    createFacility,
    updateFacility,
    deleteFacility,
    // Bed type operations
    createBedType,
    updateBedType,
    deleteBedType,
    // Currency operations
    createCurrency,
    updateCurrency,
    deleteCurrency,
    // Area unit operations
    createAreaUnit,
    updateAreaUnit,
    deleteAreaUnit
  };
}

// ============================================================================
// IMAGE MANAGEMENT (unchanged)
// ============================================================================

export function useImageManager() {
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  const handleImageUpload = useCallback(async (
    key: string,
    files: FileList,
    onImageAdd: (imageData: ImageWithPreview) => void,
    onError?: (error: string) => void
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
        const imageData: ImageWithPreview = {
          file,
          preview,
          isMain: false,
          tags: [],
        };

        onImageAdd(imageData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading images';
      console.error('Error uploading images:', error);
      if (onError) {
        onError(errorMessage);
      }
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
    validateImageFile: FileProcessor.validateImageFile,
    createImagePreview: FileProcessor.createImagePreview,
  };
}

// ============================================================================
// VALIDATION HOOKS (unchanged)
// ============================================================================

export function useHomestayValidation() {
  const validateHomestay = useCallback((data: any): string[] => {
    return ValidationHelper.validateHomestay(data);
  }, []);

  const validateBulkHomestays = useCallback((homestays: any[]): Record<number, string[]> => {
    return ValidationHelper.validateBulkHomestays(homestays);
  }, []);

  return {
    validateHomestay,
    validateBulkHomestays
  };
}

// ============================================================================
// FORM STATE MANAGEMENT (unchanged)
// ============================================================================

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

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    setFormData,
    errors,
    touched,
    updateField,
    updateNestedField,
    setFieldError,
    setFieldTouched,
    resetForm,
    clearErrors,
  };
}