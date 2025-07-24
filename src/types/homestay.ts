export interface ApiHomestay {
  id: number; // Added
  name: string;
  address: string;
  aboutDescription: string;
  imageSrc: string;
  totalPrice: number;
  rating: number;
  slug: string;
  categoryColor?: string;
  features?: string[];
  vipAccess?: boolean;
  rooms: {
    id: number; // Added
    name: string;
    imageUrls: string[];
    rating: number;
    reviews: number;
    facilities?: string[];
    bedType: string;
    refundable: boolean;
    nightlyPrice: number;
    totalPrice: number;
    originalPrice?: number;
    extrasOptions: { label: string; price: number }[];
    roomsLeft: number;
    maxOccupancy: number;
  }[];
}

export interface Hero3Card {
  id?: number; // Added
  image: string;
  images: string[];
  name: string;
  address: string;
  aboutDescription: string;
  city: string;
  region: string;
  price: string;
  rating: number;
  slug: string;
  categoryColor: string;
  features: string[];
  vipAccess: boolean;
  rooms: {
    imageUrls: string[];
    roomTitle: string;
    rating: number;
    reviews: number;
    facilities: string[];
    bedType: string;
    refundable: boolean;
    nightlyPrice: number;
    totalPrice: number;
    originalPrice?: number;
    extrasOptions: { label: string; price: number }[];
    roomsLeft: number;
    sqFt: number;
    sleeps: number;
    cityView: boolean;
    freeParking: boolean;
    freeWifi: boolean;
    roomId?: number; // Added
  }[];
}