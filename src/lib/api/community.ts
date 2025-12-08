// Public Community API
const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001')
  : 'http://13.61.8.56:3001';

interface CommunityMeal {
  id: number;
  communityId: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  description: string;
  isIncluded: boolean;
  extraCost: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface CommunityActivity {
  id: number;
  communityId: number;
  name: string;
  description: string;
  isIncluded: boolean;
  extraCost: number;
  currency: string;
  duration: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface CommunityHomestay {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  totalRooms: number;
  totalCapacity: number;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  images: string[];
  pricePerPerson: number;
  currency: string;
  isActive: boolean;
  manager: {
    id: number;
    fullName: string;
    image: string | null;
    phone: string;
    email: string;
    alternatePhone: string | null;
  };
  meals: CommunityMeal[];
  activities: CommunityActivity[];
  homestays: CommunityHomestay[];
  totalRooms: number;
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomestayRoom {
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
  createdAt: string;
  updatedAt: string;
  rating: number | null;
  reviews: number;
  images: {
    id: number;
    roomId: number;
    url: string;
    isMain: boolean;
    tags: string[];
    createdAt: string;
  }[];
  facilities: any[];
  beds: any[];
  bedType: string;
  imageUrls: string[];
  refundable: boolean;
  extrasOptions: any[];
  roomsLeft: number;
}

export interface Homestay {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  description: string;
  facilities: any[];
  images: {
    id: number;
    homestayId: number;
    url: string;
    isMain: boolean;
    tags: string[];
    createdAt: string;
  }[];
  rooms: HomestayRoom[];
  rating: number | null;
  reviews: number;
  vipAccess: boolean;
  ownerId: number;
  idScanFront: string | null;
  idScanBack: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  discount: number | null;
  isCampaignRegistered: boolean;
  hostEmail: string | null;
  hostPhone: string | null;
  lastMinuteDeal: any | null;
  imageSrc: string;
  features: any[];
}

class CommunityAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Fetch all communities
   */
  async getCommunities(): Promise<Community[]> {
    try {
      const url = `${this.baseUrl}/communities`;
      console.log('[CommunityAPI] Fetching communities from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CommunityAPI] Error response:', errorText);
        throw new Error(`Failed to fetch communities: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CommunityAPI] Fetched communities:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('[CommunityAPI] Error fetching communities:', error);
      throw error;
    }
  }

  /**
   * Fetch a single community by ID
   */
  async getCommunity(id: number): Promise<Community> {
    try {
      const url = `${this.baseUrl}/communities/${id}`;
      console.log('[CommunityAPI] Fetching community from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CommunityAPI] Error response:', errorText);
        throw new Error(`Failed to fetch community: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CommunityAPI] Fetched community:', data?.name || id);
      return data;
    } catch (error) {
      console.error(`[CommunityAPI] Error fetching community ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch homestay details by ID
   */
  async getHomestay(id: number): Promise<Homestay> {
    try {
      const url = `${this.baseUrl}/homestays/${id}`;
      console.log('[CommunityAPI] Fetching homestay from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CommunityAPI] Error response:', errorText);
        throw new Error(`Failed to fetch homestay: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CommunityAPI] Fetched homestay:', data?.name || id);
      return data;
    } catch (error) {
      console.error(`[CommunityAPI] Error fetching homestay ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check room availability for a homestay
   */
  async checkRoomAvailability(params: {
    homestayId: number;
    roomId: number;
    checkIn: string;
    checkOut: string;
    adults: number;
  }): Promise<{ available: boolean; roomsLeft: number }> {
    try {
      const { homestayId, roomId, checkIn, checkOut, adults } = params;

      // This is a placeholder - you'll need to implement the actual availability check endpoint
      const response = await fetch(
        `${this.baseUrl}/homestays/${homestayId}/rooms/${roomId}/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // If endpoint doesn't exist, return default availability
        return { available: true, roomsLeft: 1 };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking room availability:', error);
      // Return default availability on error
      return { available: true, roomsLeft: 1 };
    }
  }
}

// Export singleton instance
export const communityAPI = new CommunityAPI();
