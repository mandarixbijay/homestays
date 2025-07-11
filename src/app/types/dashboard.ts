export interface HostProfile {
  name: string;
  email: string;
  contactNumber: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  status: "active" | "draft" | "inactive";
  images: { url: string; tags: string[] }[];
  totalRooms: number;
  description: string;
  facilities: string[];
  rooms: RoomInfo[];
  mealPlans: MealPlan[];
  rules: Rules;
  defaultPrice: { value: number; currency: "USD" | "NPR" };
  customPrices: { from: string; to: string; price: { value: number; currency: "USD" | "NPR" } }[];
}

export interface RoomInfo {
  id: string;
  name: string;
  description: string;
  numberOfBeds: number;
  maxOccupancy: { adults: number; children: number };
  minOccupancy: { adults: number; children: number };
  area: { value: number; unit: "sqft" | "sqm" };
  price: { value: number; currency: "USD" | "NPR" };
  includesMeals: boolean;
  mainImage: string | null;
  images: { url: string; tags: string[] }[];
  selectedFacilities: string[];
  customFacilities: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  isSelected: boolean;
  price: { value: number; currency: "USD" | "NPR" };
  pax: number;
  description: string;
  images: { url: string; isMain: boolean }[];
  isCustom: boolean;
}

export interface Rules {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: {
    flexible: { enabled: boolean; hoursBeforeCheckIn?: number; description: string };
    standard: { enabled: boolean; hoursBeforeCheckIn?: number; description: string };
  };
  refundPolicy: {
    description: string;
    fullRefund?: { percentage: number; hoursBeforeCancellation: number };
    noRefundHoursBeforeCancellation?: number;
  };
  petPolicy: { type: "allowed" | "not-allowed" | "restricted"; description: string };
  smokingPolicy?: { enabled: boolean; allowed?: boolean; description?: string };
  noisePolicy?: { enabled: boolean; quietHoursStart?: string; quietHoursEnd?: string; description?: string };
  guestPolicy?: { enabled: boolean; description?: string };
  safetyRules?: { enabled: boolean; description?: string };
}

export interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "paid" | "pending" | "failed";
  totalPrice: { value: number; currency: "USD" | "NPR" };
}