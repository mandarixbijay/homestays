// src/types/host-dashboard.ts

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  EXPIRED = 'EXPIRED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
}

// ============ Dashboard Overview Types ============

export interface HostRevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  currency: string;
  averageBookingValue: number;
  growthPercentage: number;
}

export interface HostBookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
}

export interface HomestayStats {
  id: number;
  name: string;
  status: string;
  totalBookings: number;
  totalRevenue: number;
  rating: number | null;
  reviews: number;
  totalRooms: number;
  occupancyRate: number;
}

export interface HostBooking {
  id: number;
  groupBookingId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  homestayName: string;
  roomType: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  adults: number;
  children: number;
  paymentStatus: string;
  createdAt: Date | string;
}

export interface HostDashboard {
  revenueStats: HostRevenueStats;
  bookingStats: HostBookingStats;
  homestayStats: HomestayStats[];
  recentBookings: HostBooking[];
  pendingBookings: HostBooking[];
}

// ============ Booking Management Types ============

export interface PaymentDetails {
  id: number;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string | null;
  createdAt: Date | string;
}

export interface HostBookingDetails {
  id: number;
  groupBookingId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  userId: number | null;
  homestayId: number;
  homestayName: string;
  roomId: number;
  roomName: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfNights: number;
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  payments: PaymentDetails[];
  canCancel: boolean;
  cancellationNotAllowedReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginatedHostBookings {
  data: HostBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetBookingsQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface CancelBookingDto {
  reason: string;
}

export interface CancelBookingResponse {
  message: string;
  status: BookingStatus;
  reason: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  notes?: string;
}

export interface UpdateBookingStatusResponse {
  message: string;
  status: BookingStatus;
}

export interface ConfirmBookingResponse {
  message: string;
  status: BookingStatus;
  confirmedAt: Date | string;
}

// ============ Review Management Types ============

export interface HostReview {
  id: number;
  guestName: string;
  bookingId: number;
  homestayId: number;
  homestayName: string;
  roomId: number | null;
  roomName: string | null;
  rating: number;
  comment: string | null;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  createdAt: Date | string;
}

export interface GetHostReviewsQuery {
  homestayId?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedHostReviews {
  data: HostReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReviewResponse {
  response: string;
}

export interface ReviewResponse {
  message: string;
  reviewId: number;
  hostResponse: string;
  hostResponseAt: Date | string;
}

// ============ Refund Types ============

export interface Refund {
  id: number;
  bookingId: number;
  userId: number;
  homestayName?: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: string;
  adminNotes: string | null;
  processedBy: number | null;
  processedByName: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginatedRefunds {
  data: Refund[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ Homestay Management Types ============

export interface ImageMetadata {
  url?: string;
  isMain: boolean;
  tags: string[];
}

export interface UpdateHomestayDto {
  name?: string;
  address?: string;
  contactNumber?: string;
  description?: string;
  facilityIds?: number[];
  images?: ImageMetadata[];
}

export interface HostHomestayDetails {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  description: string | null;
  status: string;
  rejectionReason: string | null;
  rating: number | null;
  reviews: number;
  discount: number | null;
  vipAccess: boolean;
  images: any[];
  facilities: any[];
  rooms: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface HostHomestayListItem {
  id: number;
  name: string;
  address: string;
  status: string;
  rating: number | null;
  reviews: number;
  roomCount: number;
  mainImage: string | null;
  createdAt: Date | string;
}

// ============ Room Management Types ============

export interface RoomBed {
  bedTypeId: number;
  quantity: number;
}

export interface RoomPrice {
  amount: number;
  currency: string;
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  totalArea?: number;
  areaUnit: string;
  maxOccupancy: number;
  minOccupancy: number;
  price: RoomPrice;
  includeBreakfast: boolean;
  beds: RoomBed[];
  facilityIds: number[];
  images: ImageMetadata[];
}

export interface UpdateRoomDto {
  name?: string;
  description?: string;
  totalArea?: number;
  areaUnit?: string;
  maxOccupancy?: number;
  minOccupancy?: number;
  price?: RoomPrice;
  includeBreakfast?: boolean;
  beds?: RoomBed[];
  facilityIds?: number[];
  images?: ImageMetadata[];
}

export interface RoomDetails {
  id: number;
  homestayId: number;
  name: string;
  description: string | null;
  totalArea: number | null;
  areaUnit: string | null;
  maxOccupancy: number;
  minOccupancy: number;
  price: number;
  currency: string;
  includeBreakfast: boolean;
  rating: number | null;
  reviews: number;
  images: any[];
  beds: any[];
  facilities: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============ Master Data Types ============

export interface Facility {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}

export interface BedType {
  id: number;
  name: string;
  description?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface AreaUnit {
  name: string;
  abbreviation: string;
}
