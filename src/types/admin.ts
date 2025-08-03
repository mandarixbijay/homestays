// types/admin.ts

export interface Homestay {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  ownerId: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rating?: number;
  reviews: number;
  discount: number;
  vipAccess: boolean;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  images: HomestayImage[];
  facilities: HomestayFacility[];
  rooms: Room[];
  owner: User;
  mealPlans: MealPlan[];
  rules: HomestayRules[];
}

export interface HomestayImage {
  id: number;
  url: string;
  isMain: boolean;
  tags: string[];
}

export interface HomestayFacility {
  id: number;
  homestayId: number;
  facilityId: number;
  facility: Facility;
}

export interface Room {
  id: number;
  homestayId: number;
  name: string;
  description: string;
  totalArea: number;
  areaUnit: string;
  maxOccupancy: number;
  minOccupancy: number;
  price: number;
  currency: string;
  includeBreakfast: boolean;
  images: RoomImage[];
  beds: RoomBed[];
}

export interface RoomImage {
  id: number;
  roomId: number;
  url: string;
  isMain: boolean;
  tags: string[];
}

export interface RoomBed {
  id: number;
  roomId: number;
  bedTypeId: number;
  quantity: number;
  bedType: BedType;
}

export interface User {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  role: 'ADMIN' | 'HOST' | 'GUEST';
  permissions: string[];
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: number;
  name: string;
  isDefault: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BedType {
  id: number;
  name: string;
  size?: number;
  sizeUnit?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AreaUnit {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: number;
  homestayId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: MealPlanImage[];
}

export interface MealPlanImage {
  id: number;
  mealPlanId: number;
  url: string;
  isMain: boolean;
  tags: string[];
}

export interface HomestayRules {
  id: number;
  homestayId: number;
  flexibleCancellation?: FlexibleCancellation;
  standardCancellation?: StandardCancellation;
  refundPolicies: RefundPolicy[];
  petPolicy?: PetPolicy;
  smokingPolicy?: SmokingPolicy;
  noisePolicy?: NoisePolicy;
  guestPolicy?: GuestPolicy;
  safetyPolicy?: SafetyPolicy;
  customPolicies: CustomPolicy[];
}

export interface FlexibleCancellation {
  id: number;
  isEnabled: boolean;
  description?: string;
}

export interface StandardCancellation {
  id: number;
  isEnabled: boolean;
  description?: string;
}

export interface RefundPolicy {
  id: number;
  rulesId: number;
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckIn: number;
}

export interface PetPolicy {
  id: number;
  isAllowed: boolean;
  description?: string;
  additionalFee?: number;
}

export interface SmokingPolicy {
  id: number;
  isAllowed: boolean;
  description?: string;
  designatedAreas?: string;
}

export interface NoisePolicy {
  id: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  description?: string;
}

export interface GuestPolicy {
  id: number;
  maxGuestsAllowed?: number;
  overnightGuestsAllowed: boolean;
  description?: string;
}

export interface SafetyPolicy {
  id: number;
  smokeDectorsInstalled: boolean;
  carbonMonoxideDetectors: boolean;
  fireExtinguisher: boolean;
  firstAidKit: boolean;
  description?: string;
}

export interface CustomPolicy {
  id: number;
  rulesId: number;
  title: string;
  description: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Form Data Types
export interface HomestayFilters {
  search: string;
  status: string;
  ownerId: string;
  address: string;
}

export interface CreateFacilityForm {
  name: string;
}

export interface CreateBedTypeForm {
  name: string;
  size?: number;
  sizeUnit?: string;
}

export interface CreateCurrencyForm {
  code: string;
  name: string;
  isDefault?: boolean;
}

export interface CreateAreaUnitForm {
  name: string;
  isDefault?: boolean;
}

export interface UpdateUserRoleForm {
  role: 'ADMIN' | 'HOST' | 'GUEST';
  permissions?: string[];
}

export interface ApproveHomestayForm {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

// Image and Room Types for DTOs
export interface ImageMetadataDto {
  url?: string;
  isMain: boolean;
  tags: string[];
  file?: File; // For frontend file uploads
}

export interface CustomFacilityDto {
  name: string;
}

export interface OccupancyDto {
  adults: number;
  children: number;
}

export interface PriceDto {
  value: number;
  currency: string;
}

export interface BedDto {
  bedTypeId: number;
  quantity: number;
}

export interface RoomImageDto {
  url?: string;
  isMain: boolean;
  tags: string[];
  file?: File; // For frontend file uploads
}

export interface RoomDto {
  id?: string; // Optional for new rooms
  name: string;
  description: string;
  totalArea: number;
  areaUnit: string;
  maxOccupancy: OccupancyDto;
  minOccupancy: OccupancyDto;
  price: PriceDto;
  includeBreakfast: boolean;
  beds: BedDto[];
  images: RoomImageDto[];
}

// Updated DTO Interfaces to match backend
export interface CreateHomestayDto {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  description?: string;
  imageMetadata: ImageMetadataDto[];
  facilityIds?: number[];
  customFacilities: CustomFacilityDto[];
  ownerId: number;
  rooms: RoomDto[];
  status: HomestayStatus;
  discount: number;
  vipAccess: boolean;
}

export interface UpdateHomestayDto {
  propertyName?: string;
  propertyAddress?: string;
  contactNumber?: string;
  description?: string;
  imageMetadata?: ImageMetadataDto[];
  facilityIds?: number[];
  customFacilities?: CustomFacilityDto[];
  ownerId?: number;
  rooms?: RoomDto[];
  status?: HomestayStatus;
  discount?: number;
  vipAccess?: boolean;
  images?: File[]; // For file uploads
}

export interface CreateBulkHomestaysDto {
  homestays: CreateHomestayDto[];
  images?: File[]; // For file uploads
}

export interface CreateRoomDto {
  room: RoomDto;
  images?: File[]; // For file uploads
}

export interface UpdateRoomDto {
  room?: RoomDto;
  images?: File[]; // For file uploads
}

// Utility Types
export type HomestayStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'ADMIN' | 'HOST' | 'GUEST';

// Enums for consistency
export enum AreaUnitEnum {
  SQFT = 'sqft',
  SQM = 'sqm',
}

export enum CurrencyEnum {
  NPR = 'NPR',
  USD = 'USD',
}

// Constants
export const HOMESTAY_STATUS_OPTIONS: { value: HomestayStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
];

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'HOST', label: 'Host' },
  { value: 'GUEST', label: 'Guest' },
];

export const PERMISSIONS_OPTIONS = [
  'VIEW_OWN_PROFILE',
  'CREATE_HOMESTAY',
  'UPDATE_HOMESTAY',
  'DELETE_HOMESTAY',
  'VIEW_HOMESTAY',
  'CREATE_ROOM',
  'UPDATE_ROOM',
  'DELETE_ROOM',
  'APPROVE_HOMESTAY',
  'MANAGE_USERS',
  'MANAGE_MASTER_DATA',
] as const;

export type Permission = typeof PERMISSIONS_OPTIONS[number];

// Legacy types for backward compatibility (can be removed when old components are updated)
export interface Step1Dto {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
}

export interface Step2Dto {
  description: string;
  imageMetadata: ImageMetadataDto[];
}

export interface Step3Dto {
  facilityIds: number[];
  customFacilities: CustomFacilityDto[];
}

// Helper function to convert old format to new format
export function convertLegacyHomestayDto(legacyDto: {
  basicInfo: Step1Dto;
  descriptionAndImages: Step2Dto;
  facilities: Step3Dto;
  ownerId: string;
  rooms: RoomDto[];
  status?: HomestayStatus;
  discount?: number;
  vipAccess?: boolean;
}): CreateHomestayDto {
  return {
    propertyName: legacyDto.basicInfo.propertyName,
    propertyAddress: legacyDto.basicInfo.propertyAddress,
    contactNumber: legacyDto.basicInfo.contactNumber,
    description: legacyDto.descriptionAndImages.description,
    imageMetadata: legacyDto.descriptionAndImages.imageMetadata,
    facilityIds: legacyDto.facilities.facilityIds,
    customFacilities: legacyDto.facilities.customFacilities,
    ownerId: Number(legacyDto.ownerId),
    rooms: legacyDto.rooms,
    status: legacyDto.status || 'PENDING',
    discount: legacyDto.discount || 0,
    vipAccess: legacyDto.vipAccess || false,
  };
}

// Helper function to convert new format to legacy format (for components that still use old structure)
export function convertToLegacyHomestayDto(newDto: CreateHomestayDto): {
  basicInfo: Step1Dto;
  descriptionAndImages: Step2Dto;
  facilities: Step3Dto;
  ownerId: string;
  rooms: RoomDto[];
  status: HomestayStatus;
  discount: number;
  vipAccess: boolean;
} {
  return {
    basicInfo: {
      propertyName: newDto.propertyName,
      propertyAddress: newDto.propertyAddress,
      contactNumber: newDto.contactNumber,
    },
    descriptionAndImages: {
      description: newDto.description || '',
      imageMetadata: newDto.imageMetadata,
    },
    facilities: {
      facilityIds: newDto.facilityIds || [],
      customFacilities: newDto.customFacilities,
    },
    ownerId: newDto.ownerId.toString(),
    rooms: newDto.rooms,
    status: newDto.status,
    discount: newDto.discount,
    vipAccess: newDto.vipAccess,
  };
}