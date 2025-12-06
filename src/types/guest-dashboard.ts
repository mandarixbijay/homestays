// src/types/guest-dashboard.ts

// ============ Enums ============

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// ============ Dashboard Overview Types ============

export interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export interface SpendingStats {
  totalSpent: number;
  currency: string;
  averageBookingAmount: number;
  successfulPayments: number;
}

export interface RecentBooking {
  id: number;
  groupBookingId: string | null;
  homestayName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  adults: number;
  children: number;
  createdAt: string;
}

export interface GuestDashboard {
  bookingStats: BookingStats;
  spendingStats: SpendingStats;
  recentBookings: RecentBooking[];
  upcomingBookings: RecentBooking[];
}

// ============ Booking Management Types ============

export interface GetBookingsQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedBookings {
  data: RecentBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentDetails {
  id: number;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
}

export interface BookingDetails {
  id: number;
  groupBookingId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  homestayId: number;
  homestayName: string;
  homestayAddress: string;
  homestayContactNumber: string;
  homestayImages: string[];
  roomId: number;
  roomName: string;
  roomDescription: string;
  roomImages: string[];
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  numberOfNights: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  payments: PaymentDetails[];
  canCancel: boolean;
  cancellationNotAllowedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CancelBookingResponse {
  message: string;
  status: BookingStatus;
  refundInfo: string | null;
}

export interface BookingReceipt {
  receiptNumber: string;
  bookingId: number;
  groupBookingId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  homestayName: string;
  homestayAddress: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  adults: number;
  children: number;
  roomPricePerNight: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  bookingDate: string;
  paymentDate: string | null;
}

// ============ Review Types ============

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface Review {
  id: number;
  bookingId: number;
  homestayId: number;
  homestayName: string;
  roomId: number | null;
  roomName: string | null;
  rating: number;
  comment: string | null;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewResponse {
  message: string;
  review: Review;
}

// ============ Favorites/Wishlist Types ============

export interface Favorite {
  id: number;
  homestayId: number;
  homestayName: string;
  homestayAddress: string;
  homestayImages: string[];
  rating: number | null;
  reviews: number;
  startingPrice: number;
  currency: string;
  createdAt: string;
}

export interface AddFavoriteResponse {
  message: string;
  favoriteId: number;
}

export interface RemoveFavoriteResponse {
  message: string;
}

// ============ Refund Types ============

export interface CreateRefundDto {
  amount: number;
  currency?: string;
  reason: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface RefundResponse {
  message: string;
  refund: Refund;
}

export interface PaginatedRefunds {
  data: Refund[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
