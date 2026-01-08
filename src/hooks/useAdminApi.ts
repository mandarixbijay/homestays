import { useState, useCallback, useRef } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAuthenticatedApi } from '@/hooks/useSessionManager';
import { Homestay, PaginatedResponse } from '@/types/admin';

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



const calculateHomestayStats = (homestays: Homestay[]) => {
  console.log('[Dashboard] Calculating stats from homestays:', {
    total: homestays.length,
    sample: homestays.slice(0, 2).map(h => ({
      id: h.id,
      name: h.name,
      status: h.status,
      rooms: h.rooms?.length,
      rating: h.rating
    })),
    allStatuses: homestays.map(h => ({
      id: h.id,
      status: h.status,
      rooms: h.rooms?.length,
      rating: h.rating
    }))
  });

  const stats = {
    totalHomestays: homestays.length,
    pendingHomestays: homestays.filter(h => h.status?.toUpperCase() === 'PENDING').length,
    approvedHomestays: homestays.filter(h => h.status?.toUpperCase() === 'APPROVED').length,
    rejectedHomestays: homestays.filter(h => h.status?.toUpperCase() === 'REJECTED').length,
    totalRooms: homestays.reduce((total, h) => total + (Array.isArray(h.rooms) ? h.rooms.length : 0), 0),
    averageRating: 0
  };

  const homestaysWithRatings = homestays.filter(h => typeof h.rating === 'number' && h.rating > 0);
  if (homestaysWithRatings.length > 0) {
    const totalRating = homestaysWithRatings.reduce((sum, h) => sum + Number(h.rating), 0);
    stats.averageRating = Number((totalRating / homestaysWithRatings.length).toFixed(1));
  }

  console.log('[Dashboard] Calculated stats:', stats);
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
// CORE HOOKS WITH SESSION MANAGEMENT
// ============================================================================

export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { handleApiError } = useAuthenticatedApi();

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      await handleApiError(err, async () => {
        const retryResult = await operation();
        setState({ data: retryResult, loading: false, error: null });
        return retryResult;
      });
      
      throw err;
    }
  }, [handleApiError]);

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
  const [filterKey, setFilterKey] = useState(0); // Force re-render

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      console.log('[useFilters] Updated:', { key, value, newFilters: updated });
      return updated;
    });
    setFilterKey(prev => prev + 1); // Force dependency change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setFilterKey(prev => prev + 1);
  }, [initialFilters]);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(initialFilters).reduce((acc, key) => {
      (acc as any)[key] = key === 'status' ? undefined : '';
      return acc;
    }, {} as T);
    setFilters(clearedFilters);
    setFilterKey(prev => prev + 1);
  }, [initialFilters]);

  return {
    filters,
    filterKey, // Add this to track changes
    updateFilter,
    resetFilters,
    clearFilters,
    setFilters
  };
}






// ============================================================================
// DASHBOARD HOOKS WITH PROPER TYPING
// ============================================================================

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { loading, error, execute, clearError } = useAsyncOperation<DashboardStats>();

  const loadDashboardStats = useCallback(async (): Promise<DashboardStats> => {
    try {
      const result = await execute(async (): Promise<DashboardStats> => {
        const response = await adminApi.getDashboardStats();
        return response as DashboardStats;
      });
      setStats(result);
      return result;
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      throw error;
    }
  }, [execute]);

  const loadCompleteStats = useCallback(async (): Promise<DashboardStats> => {
    try {
      const result = await execute(async (): Promise<DashboardStats> => {
        // Load all dashboard data in parallel with proper error handling
        const [
          dashboardStatsRaw,
          homestayStatsRaw,
          usersCountRaw,
          monthlyGrowth,
          recentActivity,
          averageRating
        ] = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getHomestaysByStatus(),
          adminApi.getUsersCount(),
          adminApi.getMonthlyGrowthStats(),
          adminApi.getSystemActivity(10),
          adminApi.getAverageRating()
        ]);

        // Helper function to safely extract values from settled promises
        const getSettledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
          return result.status === 'fulfilled' ? result.value : fallback;
        };

        // Safely extract and type the results
        const dashboardStats = getSettledValue(dashboardStatsRaw, {}) as Partial<DashboardStats>;
        const homestayStats = getSettledValue(
          homestayStatsRaw,
          { total: 0, pending: 0, approved: 0, rejected: 0 }
        ) as { 
          total?: number; 
          pending?: number; 
          approved?: number; 
          rejected?: number; 
        };
        const usersCount = getSettledValue(usersCountRaw, { total: 0 }) as { total: number };
        const growthStats = getSettledValue(monthlyGrowth, null);
        const activities = getSettledValue(recentActivity, []) as ActivityItem[];
        const rating = getSettledValue(averageRating, null) as { averageRating?: number } | null;

        const combinedStats: DashboardStats = {
          totalHomestays: homestayStats?.total ?? dashboardStats?.totalHomestays ?? 0,
          pendingHomestays: homestayStats?.pending ?? dashboardStats?.pendingHomestays ?? 0,
          approvedHomestays: homestayStats?.approved ?? dashboardStats?.approvedHomestays ?? 0,
          rejectedHomestays: homestayStats?.rejected ?? dashboardStats?.rejectedHomestays ?? 0,
          totalUsers: usersCount?.total ?? dashboardStats?.totalUsers ?? 0,
          activeUsers: dashboardStats?.activeUsers ?? 0,
          totalRooms: dashboardStats?.totalRooms ?? 0,
          averageRating: rating?.averageRating ?? dashboardStats?.averageRating ?? 0,
          totalBookings: dashboardStats?.totalBookings ?? 0,
          totalRevenue: dashboardStats?.totalRevenue ?? 0,
          occupancyRate: dashboardStats?.occupancyRate ?? 0,
          recentActivity: activities,
          growthStats: growthStats || {
            homestaysGrowth: 0,
            usersGrowth: 0,
            bookingsGrowth: 0,
            revenueGrowth: 0
          }
        };

        return combinedStats;
      });

      setStats(result);
      return result;
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
// HOMESTAY OPERATIONS WITH SESSION MANAGEMENT
// ============================================================================

export function useHomestays() {
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<PaginatedResponse<Homestay>>();

  const loadHomestays = useCallback(async (params?: any): Promise<PaginatedResponse<Homestay>> => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );
      
      const result = await execute(async (): Promise<PaginatedResponse<Homestay>> => {
        const response = await adminApi.getHomestays(filteredParams);
        console.log('[useHomestays] Raw API response:', JSON.stringify(response, null, 2));
        return response as PaginatedResponse<Homestay>;
      });
      
      if (result) {
        console.log('[useHomestays] Processed homestays:', {
          count: result.data?.length || 0,
          sample: result.data?.slice(0, 2) || [],
          total: result.total,
          totalPages: result.totalPages
        });
        setHomestays(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('[useHomestays] Error loading homestays:', error);
      setHomestays([]);
      setTotalPages(1);
      setTotal(0);
      throw error;
    }
  }, [execute]);

  const createHomestay = useCallback(async (homestayData: any) => {
    try {
      const { cleanData, files } = FileProcessor.extractFilesFromHomestay(homestayData);
      const validationErrors = ValidationHelper.validateHomestay(cleanData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }
      const result = await execute(async () => {
        return await adminApi.createHomestay(cleanData, files);
      });
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
      const validationErrors = ValidationHelper.validateBulkHomestays(cleanHomestays);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors).map(
          ([index, errors]) => `Homestay ${parseInt(index) + 1}: ${errors.join(', ')}`
        );
        throw new Error(errorMessages.join('; '));
      }
      const result = await execute(async () => {
        return await adminApi.createBulkHomestays(cleanHomestays, allFiles);
      });
      return result;
    } catch (error) {
      console.error('Error creating bulk homestays:', error);
      throw error;
    }
  }, [execute]);

  const updateHomestay = useCallback(async (id: number, homestayData: any) => {
    try {
      const { cleanData, files } = FileProcessor.extractFilesFromHomestay(homestayData);
      const result = await execute(async () => {
        return await adminApi.updateHomestay(id, cleanData, files);
      });
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
    setHomestays, // Added
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
// REST OF THE HOOKS WITH PROPER TYPING
// ============================================================================

export function useHomestayDetail(homestayId: number) {
  const [homestay, setHomestay] = useState<any>(null);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

const loadHomestay = useCallback(async () => {
  try {
    const result = await execute(async () => {
      // Fetch single homestay by ID from the API
      const response = await adminApi.getHomestay(homestayId);
      return response;
    });

    if (result) {
      setHomestay(result);
    } else {
      setHomestay(null);
    }

    return result;
  } catch (error) {
    console.error('Error loading homestay detail:', error);
    setHomestay(null);
    throw error;
  }
}, [homestayId, execute]);

  const updateHomestay = useCallback(async (data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.updateHomestay(homestayId, data);
      });
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
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadAllData = useCallback(async () => {
    try {
      const result = await execute(async () => {
        const [facilitiesData, bedTypesData, currenciesData, areaUnitsData] = await Promise.allSettled([
          adminApi.getFacilities(),
          adminApi.getBedTypes(),
          adminApi.getCurrencies(),
          adminApi.getAreaUnits()
        ]);

        // Helper function to safely extract values
        const getSettledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
          return result.status === 'fulfilled' ? result.value : fallback;
        };

        const facilities = getSettledValue(facilitiesData, []) as any[];
        const bedTypes = getSettledValue(bedTypesData, []) as any[];
        const currencies = getSettledValue(currenciesData, []) as any[];
        const areaUnits = getSettledValue(areaUnitsData, []) as any[];

        setFacilities(facilities);
        setBedTypes(bedTypes);
        setCurrencies(currencies);
        setAreaUnits(areaUnits);

        return { facilities, bedTypes, currencies, areaUnits };
      });
      return result;
    } catch (error) {
      console.error('Error loading master data:', error);
      throw error;
    }
  }, [execute]);

  // Master data CRUD operations with proper error handling
  const createFacility = useCallback(async (data: any) => {
    const result = await execute(async () => {
      return await adminApi.createFacility(data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateFacility = useCallback(async (id: number, data: any) => {
    const result = await execute(async () => {
      return await adminApi.updateFacility(id, data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteFacility = useCallback(async (id: number) => {
    const result = await execute(async () => {
      return await adminApi.deleteFacility(id);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  // Similar methods for bedTypes, currencies, areaUnits...
  const createBedType = useCallback(async (data: any) => {
    const result = await execute(async () => {
      return await adminApi.createBedType(data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateBedType = useCallback(async (id: number, data: any) => {
    const result = await execute(async () => {
      return await adminApi.updateBedType(id, data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteBedType = useCallback(async (id: number) => {
    const result = await execute(async () => {
      return await adminApi.deleteBedType(id);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const createCurrency = useCallback(async (data: any) => {
    const result = await execute(async () => {
      return await adminApi.createCurrency(data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateCurrency = useCallback(async (id: number, data: any) => {
    const result = await execute(async () => {
      return await adminApi.updateCurrency(id, data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteCurrency = useCallback(async (id: number) => {
    const result = await execute(async () => {
      return await adminApi.deleteCurrency(id);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const createAreaUnit = useCallback(async (data: any) => {
    const result = await execute(async () => {
      return await adminApi.createAreaUnit(data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const updateAreaUnit = useCallback(async (id: number, data: any) => {
    const result = await execute(async () => {
      return await adminApi.updateAreaUnit(id, data);
    });
    await loadAllData();
    return result;
  }, [execute, loadAllData]);

  const deleteAreaUnit = useCallback(async (id: number) => {
    const result = await execute(async () => {
      return await adminApi.deleteAreaUnit(id);
    });
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

// ============================================================================
// DESTINATIONS MANAGEMENT
// ============================================================================

export function useDestinations() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [destination, setDestination] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadDestinations = useCallback(async (params?: any) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );

      const result = await execute(async () => {
        const response = await adminApi.getDestinations(filteredParams);
        return response;
      });

      if (result) {
        setDestinations(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading destinations:', error);
      setDestinations([]);
      setTotalPages(1);
      setTotal(0);
      throw error;
    }
  }, [execute]);

  const loadDestination = useCallback(async (id: number) => {
    try {
      const result = await execute(async () => {
        const response = await adminApi.getDestination(id);
        return response;
      });

      if (result) {
        setDestination(result);
      }
      return result;
    } catch (error) {
      console.error('Error loading destination:', error);
      setDestination(null);
      throw error;
    }
  }, [execute]);

  const createDestination = useCallback(async (data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.createDestination(data);
      });
      return result;
    } catch (error) {
      console.error('Error creating destination:', error);
      throw error;
    }
  }, [execute]);

  const updateDestination = useCallback(async (id: number, data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.updateDestination(id, data);
      });
      return result;
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  }, [execute]);

  const deleteDestination = useCallback(async (id: number) => {
    try {
      const result = await execute(async () => {
        return await adminApi.deleteDestination(id);
      });
      return result;
    } catch (error) {
      console.error('Error deleting destination:', error);
      throw error;
    }
  }, [execute]);

  const addHomestayToDestination = useCallback(async (homestayId: number, destinationId: number) => {
    try {
      const result = await execute(async () => {
        return await adminApi.addHomestayToDestination(homestayId, destinationId);
      });
      return result;
    } catch (error) {
      console.error('Error adding homestay to destination:', error);
      throw error;
    }
  }, [execute]);

  const removeHomestayFromDestination = useCallback(async (homestayId: number, destinationId: number) => {
    try {
      const result = await execute(async () => {
        return await adminApi.removeHomestayFromDestination(homestayId, destinationId);
      });
      return result;
    } catch (error) {
      console.error('Error removing homestay from destination:', error);
      throw error;
    }
  }, [execute]);

  return {
    destinations,
    destination,
    setDestinations,
    setDestination,
    totalPages,
    total,
    loading,
    error,
    loadDestinations,
    loadDestination,
    createDestination,
    updateDestination,
    deleteDestination,
    addHomestayToDestination,
    removeHomestayFromDestination,
    clearError
  };
}

// ============================================================================
// LAST MINUTE DEALS MANAGEMENT
// ============================================================================

export function useLastMinuteDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadDeals = useCallback(async (params?: any) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );

      const result = await execute(async () => {
        const response = await adminApi.getLastMinuteDeals(filteredParams);
        return response;
      });

      if (result) {
        setDeals(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading last minute deals:', error);
      setDeals([]);
      setTotalPages(1);
      setTotal(0);
      throw error;
    }
  }, [execute]);

  const createDeal = useCallback(async (data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.createLastMinuteDeal(data);
      });
      return result;
    } catch (error) {
      console.error('Error creating last minute deal:', error);
      throw error;
    }
  }, [execute]);

  const updateDeal = useCallback(async (id: number, data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.updateLastMinuteDeal(id, data);
      });
      return result;
    } catch (error) {
      console.error('Error updating last minute deal:', error);
      throw error;
    }
  }, [execute]);

  const deleteDeal = useCallback(async (id: number) => {
    try {
      const result = await execute(async () => {
        return await adminApi.deleteLastMinuteDeal(id);
      });
      return result;
    } catch (error) {
      console.error('Error deleting last minute deal:', error);
      throw error;
    }
  }, [execute]);

  return {
    deals,
    setDeals,
    totalPages,
    total,
    loading,
    error,
    loadDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    clearError
  };
}

// ============================================================================
// TOP HOMESTAYS MANAGEMENT
// ============================================================================

export function useTopHomestays() {
  const [topHomestays, setTopHomestays] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, error, execute, clearError } = useAsyncOperation<any>();

  const loadTopHomestays = useCallback(async (params?: any) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== '' && value !== undefined)
      );

      const result = await execute(async () => {
        const response = await adminApi.getTopHomestays(filteredParams);
        return response;
      });

      if (result) {
        setTopHomestays(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
      }
      return result;
    } catch (error) {
      console.error('Error loading top homestays:', error);
      setTopHomestays([]);
      setTotalPages(1);
      setTotal(0);
      throw error;
    }
  }, [execute]);

  const createTopHomestay = useCallback(async (data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.createTopHomestay(data);
      });
      return result;
    } catch (error) {
      console.error('Error creating top homestay:', error);
      throw error;
    }
  }, [execute]);

  const updateTopHomestay = useCallback(async (id: number, data: any) => {
    try {
      const result = await execute(async () => {
        return await adminApi.updateTopHomestay(id, data);
      });
      return result;
    } catch (error) {
      console.error('Error updating top homestay:', error);
      throw error;
    }
  }, [execute]);

  const deleteTopHomestay = useCallback(async (id: number) => {
    try {
      const result = await execute(async () => {
        return await adminApi.deleteTopHomestay(id);
      });
      return result;
    } catch (error) {
      console.error('Error deleting top homestay:', error);
      throw error;
    }
  }, [execute]);

  return {
    topHomestays,
    setTopHomestays,
    totalPages,
    total,
    loading,
    error,
    loadTopHomestays,
    createTopHomestay,
    updateTopHomestay,
    deleteTopHomestay,
    clearError
  };
}