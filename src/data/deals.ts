// src/data/deals.ts
export interface DealCardData {
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
  features: string[];
  vipAccess?: boolean;
  discount?: string;
  rooms: {
    imageUrls: string[];
    roomTitle: string;
    rating: number;
    reviews: number;
    cityView?: boolean;
    freeParking?: boolean;
    freeWifi?: boolean;
    sqFt: number;
    sleeps: number;
    bedType: string;
    refundable: boolean;
    nightlyPrice: number;
    totalPrice: number;
    extrasOptions: { label: string; price: number }[];
    roomsLeft: number;
  }[];
}

export const dealCardsData: DealCardData[] = [
  {
    imageSrc: "/images/deal/sitapaila_homestay.webp",
    location: "Kathmandu",
    hotelName: "Sitapaila Homestay",
    rating: "9.6",
    reviews: "Exceptional (25 reviews)",
    originalPrice: "$26",
    nightlyPrice: "$18",
    totalPrice: "$18",
    categoryColor: "bg-primary",
    slug: "sitapaila-homestay",
    features: ["wifiIncluded", "kitchen", "petFriendly"],
    rooms: [
      {
        imageUrls: [
          "/images/rooms/sitapaila_room1.jpg",
          "/images/rooms/sitapaila_room2.jpg",
        ],
        roomTitle: "Standard Room, 1 Queen Bed",
        rating: 9.6,
        reviews: 25,
        cityView: true,
        freeParking: true,
        freeWifi: true,
        sqFt: 300,
        sleeps: 2,
        bedType: "1 Queen Bed",
        refundable: true,
        nightlyPrice: 18,
        totalPrice: 18,
        extrasOptions: [
          { label: "No extras", price: 0 },
          { label: "Breakfast", price: 5 },
        ],
        roomsLeft: 3,
      },
    ],
  },
  {
    imageSrc: "/images/deal/Dorje_Homestay.jpg",
    location: "Kathmandu",
    hotelName: "Dorje Homestay",
    rating: "9.0",
    reviews: "Wonderful (239 reviews)",
    originalPrice: "$28",
    nightlyPrice: "$22",
    totalPrice: "$22",
    categoryColor: "bg-accent",
    slug: "dorje-homestay",
    features: ["wifiIncluded", "airConditioned"],
    rooms: [
      {
        imageUrls: [
          "/images/rooms/dorje_room1.jpg",
          "/images/rooms/dorje_room2.jpg",
        ],
        roomTitle: "Deluxe Room, 1 King Bed",
        rating: 9.0,
        reviews: 239,
        cityView: false,
        freeParking: true,
        freeWifi: true,
        sqFt: 350,
        sleeps: 2,
        bedType: "1 King Bed",
        refundable: true,
        nightlyPrice: 22,
        totalPrice: 22,
        extrasOptions: [
          { label: "No extras", price: 0 },
          { label: "Breakfast", price: 8 },
        ],
        roomsLeft: 2,
      },
    ],
  },
  {
    imageSrc: "/images/deal/tibetan_homestay.jpg",
    location: "Pokhara",
    hotelName: "Tibetan Homestay",
    rating: "9.0",
    reviews: "Wonderful (2,253 reviews)",
    originalPrice: "$25",
    nightlyPrice: "$18",
    totalPrice: "$18",
    vipAccess: false,
    categoryColor: "bg-discount",
    slug: "tibetan-homestay",
    features: ["outdoorSpace", "petFriendly"],
    rooms: [
      {
        imageUrls: [
          "/images/rooms/tibetan_room1.jpg",
          "/images/rooms/tibetan_room2.jpg",
        ],
        roomTitle: "Lake View Room, 2 Twin Beds",
        rating: 9.0,
        reviews: 2253,
        cityView: true,
        freeParking: false,
        freeWifi: true,
        sqFt: 280,
        sleeps: 2,
        bedType: "2 Twin Beds",
        refundable: true,
        nightlyPrice: 18,
        totalPrice: 18,
        extrasOptions: [
          { label: "No extras", price: 0 },
          { label: "Breakfast", price: 6 },
        ],
        roomsLeft: 4,
      },
    ],
  },
  {
    imageSrc: "/images/deal/satkhauluwa_homestay.jpg",
    location: "Thori",
    hotelName: "Satkhaluwa Homestay",
    rating: "9.6",
    reviews: "Exceptional (41 reviews)",
    originalPrice: "$28",
    nightlyPrice: "$22.9",
    totalPrice: "$22.9",
    discount: "18% off",
    categoryColor: "bg-warning",
    slug: "satkhaluwa-homestay",
    features: ["kitchen", "parking"],
    rooms: [
      {
        imageUrls: [
          "/images/rooms/satkhaluwa_room1.jpg",
          "/images/rooms/satkhaluwa_room2.jpg",
        ],
        roomTitle: "Family Room, 1 Double Bed",
        rating: 9.6,
        reviews: 41,
        cityView: false,
        freeParking: true,
        freeWifi: false,
        sqFt: 400,
        sleeps: 3,
        bedType: "1 Double Bed",
        refundable: true,
        nightlyPrice: 22.9,
        totalPrice: 22.9,
        extrasOptions: [
          { label: "No extras", price: 0 },
          { label: "Breakfast", price: 7 },
        ],
        roomsLeft: 2,
      },
    ],
  },
  {
    imageSrc: "/images/deal/corridor_homestays.jpg",
    location: "Bardiya",
    hotelName: "Corridor Homestays",
    rating: "9.0",
    reviews: "Wonderful (239 reviews)",
    originalPrice: "$25",
    nightlyPrice: "$17",
    totalPrice: "$17",
    categoryColor: "bg-primary",
    slug: "corridor-homestays",
    features: ["wifiIncluded", "outdoorSpace"],
    rooms: [
      {
        imageUrls: [
          "/images/rooms/corridor_room1.jpg",
          "/images/rooms/corridor_room2.jpg",
        ],
        roomTitle: "Standard Room, 2 Single Beds",
        rating: 9.0,
        reviews: 239,
        cityView: false,
        freeParking: true,
        freeWifi: true,
        sqFt: 320,
        sleeps: 2,
        bedType: "2 Single Beds",
        refundable: true,
        nightlyPrice: 17,
        totalPrice: 17,
        extrasOptions: [
          { label: "No extras", price: 0 },
          { label: "Breakfast", price: 5 },
        ],
        roomsLeft: 5,
      },
    ],
  },
];