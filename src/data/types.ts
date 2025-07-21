// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/data/types.ts

export interface Step1Data {
  propertyName: string;
  propertyAddress: string;
  contactNumber: string;
  documentType?: 'passport' | 'citizenship';
  idScanFront?: string;
  idScanBack?: string;
  frontFile?: File;
  backFile?: File;
}

export interface ImageMetadata {
  url?: string;
  tags?: string[];
  isNew?: boolean;
  isMain?: boolean;
  file?: File;
}

export interface Step2Data {
  description: string;
  imageMetadata: { url?: string; tags?: string[]; isMain: boolean }[];
  images: File[];
}

export interface CustomFacility {
  name: string;
}

export interface Step3Data {
  facilityIds: number[];
  customFacilities: CustomFacility[];
}

export interface Occupancy {
  adults: number;
  children: number;
}

export interface Price {
  value: number;
  currency: 'USD' | 'NPR';
}

export interface Room {
  id: string;
  name: string;
  maxOccupancy: Occupancy;
  minOccupancy: Occupancy;
  price: Price;
}

export interface Step4Data {
  totalRooms: number;
  rooms: Room[];
}

export interface RegisterData {
  name: string;
  email?: string;
  mobileNumber?: string;
  password: string;
}