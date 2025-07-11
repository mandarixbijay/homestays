// src/app/list-your-property/owner-registration/types.ts
export interface HomestayImage {
  url?: string;
  isMain: boolean;
  tags?: string[];
}

export interface Step1FormData {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  documentType?: 'passport' | 'citizenship';
  idScanFront?: File | string;
  idScanBack?: File | string;
}

export interface Step2FormData {
  description: string;
  images: Array<{
    file: File | null;
    tags?: string[];
    url: string;
    base64?: string;
    isNew: boolean;
    isMain: boolean;
  }>;
}

export interface CustomFacility {
  name: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  maxOccupancy: {
    adults: number;
    children: number;
  };
  minOccupancy: {
    adults: number;
    children: number;
  };
  price: {
    value: number;
    currency: 'USD' | 'NPR';
  };
}

export interface Step3FormData {
  selectedFacilities: Array<number | string>;
  customFacilities: CustomFacility[];
  customFacilityIds?: Record<string, string>;
}

export interface Occupancy {
  adults: number;
  children: number;
}

export interface Price {
  value: number;
  currency: string;
}


export interface Step4FormData {
  totalRooms: number;
  rooms: RoomInfo[];
}

export interface RegisterFormData {
  email?: string;
  mobileNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserResponseDto {
  id: string;
  email?: string;
  mobileNumber?: string;
  firstName: string;
  lastName: string;
}