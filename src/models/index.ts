export interface DealCardProps {
  imageSrc: string;
  location: string;
  hotelName: string;
  rating: string;
  reviews: string;
  originalPrice: string;
  nightlyPrice: string;
  totalPrice: string;
  categoryColor: string;
  slug: string;
  vipAccess?: boolean;
  discount?: string;
}

export interface Room {
  adults: number;
  children: number;
}

export interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otp: string;
  onOtpChange: (value: string) => void;
  otpError: string;
  onSubmitOtp: (otp: string) => void;
  isResending: boolean;
  onResend: () => Promise<void>;
  countdown: number;
  title?: string;
  description?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  blockedMessage?: string;
  isBlocked?: boolean;
}

export interface Hero3Card {
  image: string; // Single image for backward compatibility
  images?: string[]; // Array of images for gallery
  city: string;
  region: string;
  price: string;
  rating: number;
  slug: string;
}

export interface ImageGalleryProps {
  images: string[];
  totalPhotos: number;
  slug: string;
}

export interface IndividualHomestay {
  homestay: Hero3Card;
  imageUrl?: string;
  slug: string;
}


export interface PaymentOptions {
  children: React.ReactNode;
  nightlyPrice: number;
  totalPrice: number;
}

export interface RoomCards {
  imageUrls?: string[];
  roomTitle: string;
  rating: number;
  reviews: number;
  cityView: boolean;
  freeParking: boolean;
  freeWifi: boolean;
  sqFt: number;
  sleeps: number;
  bedType: string;
  refundable: boolean;
  nightlyPrice: number;
  totalPrice: number;
  extrasOptions: { label: string; price: number }[];
  roomsLeft: number;
}

export interface Homestay {
  id: string;
  name: string;
  rooms: RoomCards[];
}
