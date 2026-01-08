// src/app/homestays/profile/[slug]/page.tsx
"use client";

import { useState, useEffect, useMemo, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MapPin, Star, Users, Calendar as CalendarIcon, Plus, Minus, X, Search, Phone, Mail,
  Clock, Check, Shield, AlertCircle, Bed, Wifi, Car, Coffee, Home, ChevronRight, Heart
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { cn } from "@/lib/utils";
import HomestayImageGallery from "@/components/homestay/components/details/image-gallery";
import AboutProperty from "@/components/homestay/components/details/about-property";
import Policies from "@/components/homestay/components/details/policies";
import PaymentOptionsDialog from "@/components/homestay/components/dialogs/payment-options-dialog";
import { useHomestayStore } from "@/store/homestayStore";
import { useFavorite } from "@/hooks/useFavorite";

interface Room {
  adults: number;
  children: number;
}

interface HomestayRoom {
  id: number;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  maxOccupancy: number;
  minOccupancy?: number;
  bedType?: string;
  facilities?: string[];
  imageUrls?: string[];
  roomsLeft?: number;
}

interface AvailableRoom {
  id: number;
  name: string;
  maxOccupancy: number;
  nightlyPrice: number;
  totalPrice: number;
  currency: string;
  imageUrls: string[];
  rating: number;
  reviews: number;
  facilities: string[];
  bedType: string;
  refundable: boolean;
  extrasOptions: any[];
  roomsLeft: number;
  originalPrice?: number;
  discountedPrice?: number;
  savings?: number;
}

interface LastMinuteDeal {
  id: number;
  discount: number;
  discountType: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface AvailabilityResponse {
  homestay: {
    id: number;
    name: string;
    address: string;
    description: string;
    imageSrc: string;
    rating: number;
    reviews: number;
    nightlyPrice: number;
    totalPrice: number;
    features: string[];
    vipAccess: boolean;
    discount: string;
  };
  availableRooms: AvailableRoom[];
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  activeLastMinuteDeal: LastMinuteDeal | null;
}

interface Homestay {
  id: number;
  name: string;
  address: string;
  rating: number | null;
  reviews: number;
  imageSrc: string;
  image?: string;
  images?: string[];
  facilities: string[];
  aboutDescription?: string;
  description?: string;
  phone?: string;
  email?: string;
  contactNumber?: string;
  contactEmail?: string;
  checkInTime?: string;
  checkOutTime?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discount?: number;
  discountType?: string;
  rooms?: HomestayRoom[];
  vipAccess?: boolean;
}

export default function HomestayProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addRoom: addRoomToStore, clearSelectedRooms } = useHomestayStore();

  // Extract ID from slug (format: name-address-id-{id})
  const extractIdFromSlug = (slug: string): number => {
    // Look for "id-{number}" pattern at the end of the slug
    const match = slug.match(/-id-(\d+)$/);
    if (match && match[1]) {
      const id = parseInt(match[1]);
      console.log('Extracting ID from slug:', { slug, match: match[0], id });
      return id;
    }

    // Fallback: try to get the last segment if it's a number
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    const id = parseInt(lastPart);
    console.log('Fallback extraction from slug:', { slug, lastPart, id });
    return id || 0;
  };

  const homestayId = slug ? extractIdFromSlug(slug as string) : 0;

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);

  // Availability states
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Favorites
  const { isFavorite, toggleFavorite, isToggling } = useFavorite();
  const favorited = homestayId ? isFavorite(homestayId) : false;
  const isTogglingFavorite = homestayId ? isToggling === homestayId : false;

  // Fetch homestay data from API
  useEffect(() => {
    const fetchHomestay = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching homestay with ID: ${homestayId} from slug: ${slug}`);

        const response = await fetch(`/api/homestays/${homestayId}`);

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch homestay');
        }

        const data = await response.json();
        console.log('Homestay data received:', data);

        // Handle images - support multiple formats
        let imagesArray: string[] = [];
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          // Filter and map images, handling both string and object formats
          imagesArray = data.images
            .map((img: any) => {
              // If it's a string, return it
              if (typeof img === 'string') return img;
              // If it's an object with url/src property, extract it
              if (typeof img === 'object' && img !== null) {
                return img.url || img.src || img.imageUrl || null;
              }
              return null;
            })
            .filter((img: string | null) => img && typeof img === 'string' && img.trim().length > 0);
        } else if (data.imageSrc || data.image) {
          imagesArray = [data.imageSrc || data.image];
        }

        // Fallback if no valid images
        if (imagesArray.length === 0) {
          imagesArray = ["/images/fallback-image.png"];
        }

        console.log('Processed images:', imagesArray);

        // Transform API response
        setHomestay({
          id: data.id,
          name: data.name || "Unnamed Homestay",
          address: data.address || "Nepal",
          rating: data.rating,
          reviews: data.reviews || 0,
          imageSrc: imagesArray[0],
          image: imagesArray[0],
          images: imagesArray,
          facilities: data.facilities || data.amenities || [],
          aboutDescription: data.aboutDescription || data.description || "No description available.",
          phone: data.phone || data.contactNumber,
          email: data.email || data.contactEmail,
          checkInTime: data.checkInTime || "2:00 PM",
          checkOutTime: data.checkOutTime || "11:00 AM",
          originalPrice: data.originalPrice,
          discountedPrice: data.discountedPrice,
          discount: data.discount,
          discountType: data.discountType,
          rooms: data.rooms || [],
          vipAccess: data.vipAccess || false,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching homestay:", error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setHomestay(null);
        setLoading(false);
      }
    };

    if (homestayId && homestayId > 0) {
      fetchHomestay();
    } else {
      console.error('Invalid homestay ID:', homestayId);
      setError('Invalid homestay ID');
      setLoading(false);
    }
  }, [homestayId, slug]);

  // Room management functions
  const addRoom = () => {
    setRooms([...rooms, { adults: 2, children: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: "adults" | "children", value: number) => {
    const newRooms = [...rooms];
    newRooms[index][field] = Math.max(field === "adults" ? 1 : 0, value);
    setRooms(newRooms);
  };

  // Check availability handler
  const handleCheckAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityError(null);

    try {
      const requestBody = {
        checkInDate: format(checkInDate, "yyyy-MM-dd"),
        checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
        rooms: rooms.map(room => ({
          adults: room.adults,
          ...(room.children > 0 && { children: room.children }),
        })),
      };

      console.log('Checking availability:', requestBody);

      const response = await fetch(`/api/bookings/check-availability/${homestayId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to check availability');
      }

      const data: AvailabilityResponse = await response.json();
      console.log('Availability data:', data);

      setAvailabilityData(data);

      // Scroll to rooms section
      setTimeout(() => {
        document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError(error instanceof Error ? error.message : 'Failed to check availability');
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed to check availability'));
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle booking a specific room
  const handleBookRoom = (room: AvailableRoom, roomIndex: number) => {
    // Clear any existing selections
    clearSelectedRooms();

    // Get the guest assignment for this room (use the first room's guests by default)
    const roomGuests = rooms[roomIndex] || rooms[0] || { adults: 2, children: 0 };

    // Add the selected room to the store (only properties that exist in SelectedRoom interface)
    addRoomToStore({
      roomId: room.id,
      roomTitle: room.name,
      adults: roomGuests.adults,
      children: roomGuests.children,
      nightlyPrice: room.nightlyPrice,
      totalPrice: room.totalPrice,
      sleeps: room.maxOccupancy,
      numRooms: 1, // Added required property
    });

    console.log('Room added to booking:', {
      roomId: room.id,
      roomTitle: room.name,
      guests: roomGuests,
    });
  };

  // Guest summary
  const guestSummary = useMemo(() => {
    const totalGuests = rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
    const totalRooms = rooms.length;
    return `${totalGuests} traveler${totalGuests !== 1 ? "s" : ""}, ${totalRooms} room${totalRooms !== 1 ? "s" : ""}`;
  }, [rooms]);

  // Compute number of nights
  const numNights = useMemo(() => {
    if (checkInDate && checkOutDate) {
      return differenceInDays(checkOutDate, checkInDate) || 1;
    }
    return 1;
  }, [checkInDate, checkOutDate]);

  // Amenity icons
  const amenityIcons: Record<string, JSX.Element> = {
    "Free WiFi": <Wifi className="h-5 w-5" />,
    "Wifi": <Wifi className="h-5 w-5" />,
    "Parking": <Car className="h-5 w-5" />,
    "Breakfast": <Coffee className="h-5 w-5" />,
  };

  const navigationSections = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "rooms", label: "Rooms" },
    { id: "policies", label: "Policies" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <Skeleton className="w-full h-96 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <h1 className="text-3xl font-bold mb-4">Homestay not found</h1>
            <p className="text-muted-foreground mb-4">The homestay you&apos;re looking for doesn&apos;t exist.</p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-mono">Error: {error}</p>
                <p className="text-xs text-gray-600 mt-2">Slug: {slug}</p>
                <p className="text-xs text-gray-600">Extracted ID: {homestayId}</p>
              </div>
            )}
            <Button onClick={() => router.push("/deals")}>Back to Deals</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use homestay.images directly since they're already processed
  const images = homestay.images || ["/images/fallback-image.png"];
  const totalPhotos = images.length;

  console.log('Rendering with images:', images);
  const totalRoomsLeft = homestay.rooms?.reduce((sum, room) => sum + (room.roomsLeft || 0), 0) || 0;

  // Get minimum room price if homestay-level price not available
    const getMinPrice = () => {
      if (homestay.discountedPrice) return homestay.discountedPrice;
      if (homestay.originalPrice) return homestay.originalPrice;
      if (homestay.rooms && homestay.rooms.length > 0) {
        const prices = homestay.rooms
          .map(r => r.discountedPrice ?? r.originalPrice ?? r.price)
          .filter((p): p is number => typeof p === "number" && p > 0);
        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
      return null;
    };

  const minPrice = getMinPrice();

  // Transform homestay to Hero3Card type for AboutProperty component
    const homestayForAbout = {
      ...homestay,
      rating: homestay.rating ?? 0,
      reviews: homestay.reviews ?? 0,
      image: homestay.image || homestay.imageSrc || "/images/placeholder-homestay.jpg",
      images: homestay.images || [homestay.image || homestay.imageSrc || "/images/placeholder-homestay.jpg"],
      aboutDescription: homestay.aboutDescription || homestay.description || "No description available.",
      price: homestay.discountedPrice ? `NPR ${homestay.discountedPrice}` : "N/A",
      categoryColor: "bg-primary",
      slug: slug,
      city: homestay.address.split(",")[0] || "Nepal",
      region: homestay.address.split(",")[1] || "Nepal",
      features: homestay.facilities,
      vipAccess: homestay.vipAccess || false,
      rooms: (homestay.rooms || []).map(room => {
        const roomPrice = room.discountedPrice ?? room.originalPrice ?? room.price ?? 0;
        return {
          imageUrls: room.imageUrls || [homestay.imageSrc],
          roomTitle: room.name,
          rating: homestay.rating || 0,
          reviews: homestay.reviews,
          facilities: room.facilities || [],
          bedType: room.bedType || "Standard",
          refundable: true,
          nightlyPrice: roomPrice,
          totalPrice: roomPrice * numNights,
          originalPrice: room.originalPrice ?? room.price,
          extrasOptions: [],
          roomsLeft: room.roomsLeft || 10,
          sqFt: room.maxOccupancy * 100,
          sleeps: room.maxOccupancy,
          cityView: false,
          freeParking: room.facilities?.includes("Parking") || false,
          freeWifi: room.facilities?.includes("Wifi") || false,
          roomId: room.id,
        };
      }),
    };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {homestay.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-base">{homestay.address}</span>
                </div>
              </div>
            </div>

            {/* Rating and Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {homestay.rating && (
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 text-blue-600 fill-current" />
                  <span className="text-sm font-semibold text-blue-700">{homestay.rating.toFixed(1)}</span>
                </div>
              )}
              <span className="text-sm text-gray-500">({homestay.reviews} reviews)</span>

              {homestay.vipAccess && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full font-semibold shadow-sm">
                  VIP Access
                </Badge>
              )}

              {totalRoomsLeft > 0 && totalRoomsLeft < 5 && (
                <Badge className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {totalRoomsLeft} {totalRoomsLeft === 1 ? "room" : "rooms"} left
                </Badge>
              )}

              <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Verified Property</span>
              </div>

              {/* Favorite Button */}
              <button
                onClick={(e) => homestayId && toggleFavorite(homestayId, e)}
                disabled={isTogglingFavorite || !homestayId}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition-all duration-200 ${
                  favorited
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200"
                } disabled:opacity-50`}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                {isTogglingFavorite ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Heart
                    className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`}
                  />
                )}
                <span className="text-sm">{favorited ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {minPrice ? `NPR ${minPrice.toLocaleString()}` : "Contact for price"}
                </div>
                <div className="text-sm text-gray-500">starting from</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{homestay.rooms?.length || 0}</div>
                <div className="text-sm text-gray-500">room types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {homestay.rooms && homestay.rooms.length > 0
                    ? Math.max(...homestay.rooms.map(r => r.maxOccupancy))
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-500">max guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{homestay.facilities.length}</div>
                <div className="text-sm text-gray-500">amenities</div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-12">
            <HomestayImageGallery images={images} totalPhotos={totalPhotos} slug={slug} />
          </div>
        </motion.div>
      </section>

      {/* Navigation */}
      <div className="sticky top-16 bg-white z-40 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`
                    whitespace-nowrap pb-2 text-sm font-medium transition-colors border-b-2
                    ${activeSection === section.id
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileBookingOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <CalendarIcon className="h-4 w-4" />
              Check Availability
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-16">
              {/* Overview */}
              <motion.div
                id="overview"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {homestay.aboutDescription}
                  </p>
                </div>
                <div className="mt-8">
                  <AboutProperty homestay={homestayForAbout} />
                </div>
              </motion.div>

              {/* Amenities */}
              <motion.div
                id="amenities"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homestay.facilities.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {amenityIcons[feature] || <Check className="h-5 w-5 text-blue-600" />}
                      </div>
                      <span className="font-medium text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Rooms */}
              <motion.div
                id="rooms"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Information</h2>
                {homestay.rooms && homestay.rooms.length > 0 ? (
                  <div className="space-y-6">
                    {homestay.rooms.map((room) => (
                      <div key={room.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Room Image */}
                          <div className="relative h-48 md:h-full">
                            <Image
                              src={room.imageUrls?.[0] || homestay.imageSrc || "/images/fallback-image.png"}
                              alt={room.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/fallback-image.png";
                              }}
                            />
                          </div>

                          {/* Room Details */}
                          <div className="md:col-span-2 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                            {room.description && <p className="text-gray-600 mb-4">{room.description}</p>}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Bed className="h-4 w-4" />
                                <span>{room.bedType || "Standard"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>Max {room.maxOccupancy} guests</span>
                              </div>
                            </div>

                            {room.facilities && room.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.facilities.map((facility, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-end justify-between">
                              <div>
                                {room.originalPrice && room.discountedPrice && room.originalPrice !== room.discountedPrice && (
                                  <div className="text-sm text-gray-500 line-through">
                                    NPR {room.originalPrice.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-2xl font-bold text-gray-900">
                                  NPR {(room.discountedPrice || room.originalPrice || room.price || 0).toLocaleString()}
                                  <span className="text-sm font-normal text-gray-500"> / night</span>
                                </div>
                              </div>
                              {room.roomsLeft && room.roomsLeft < 5 && (
                                <Badge variant="destructive" className="text-xs">
                                  Only {room.roomsLeft} left
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Bed className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>No room information available</p>
                  </div>
                )}
              </motion.div>

              {/* Available Rooms (After Availability Check) */}
              {availabilityData && availabilityData.availableRooms.length > 0 && (
                <motion.div
                  id="available-rooms"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg border-2 border-blue-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Rooms</h2>
                      <p className="text-sm text-gray-600">
                        For {format(new Date(availabilityData.checkInDate), "MMM d")} - {format(new Date(availabilityData.checkOutDate), "MMM d, yyyy")} ({availabilityData.nights} {availabilityData.nights === 1 ? 'night' : 'nights'})
                      </p>
                    </div>
                    {availabilityData.activeLastMinuteDeal && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold">
                        🎉 {availabilityData.activeLastMinuteDeal.discount}% OFF - {availabilityData.activeLastMinuteDeal.description}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    {availabilityData.availableRooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border-2 border-blue-100 rounded-xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Room Image */}
                          <div className="relative h-48 md:h-full">
                            <Image
                              src={room.imageUrls?.[0] || homestay.imageSrc || "/images/fallback-image.png"}
                              alt={room.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/fallback-image.png";
                              }}
                            />
                            {room.roomsLeft <= 3 && (
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-red-600 text-white font-semibold shadow-lg">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Only {room.roomsLeft} left!
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Room Details */}
                          <div className="md:col-span-2 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-semibold text-gray-700">{room.rating}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">({room.reviews} reviews)</span>
                                </div>
                              </div>
                              {room.refundable && (
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Free Cancellation
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Bed className="h-4 w-4" />
                                <span>{room.bedType}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>Max {room.maxOccupancy} guests</span>
                              </div>
                            </div>

                            {room.facilities && room.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.facilities.map((facility, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-gray-300">
                                    {facility}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-end justify-between pt-4 border-t border-gray-200">
                              <div>
                                {room.savings && room.savings > 0 && room.originalPrice && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-green-600 text-white text-xs">
                                      Save NPR {room.savings.toLocaleString()}
                                    </Badge>
                                    <span className="text-sm text-gray-500 line-through">
                                      NPR {room.originalPrice.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-baseline gap-2">
                                  <div className="text-3xl font-bold text-blue-600">
                                    NPR {(room.discountedPrice ?? room.nightlyPrice).toLocaleString()}
                                  </div>
                                  <span className="text-sm font-normal text-gray-500">/ night</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Total: NPR {room.totalPrice.toLocaleString()} for {availabilityData.nights} {availabilityData.nights === 1 ? 'night' : 'nights'}
                                </div>
                              </div>
                              <div>
                                <PaymentOptionsDialog
                                  nightlyPrice={room.nightlyPrice}
                                  totalPrice={room.totalPrice}
                                  checkIn={format(new Date(availabilityData.checkInDate), "yyyy-MM-dd")}
                                  checkOut={format(new Date(availabilityData.checkOutDate), "yyyy-MM-dd")}
                                  guests={rooms.map((r) => `${r.adults}A${r.children}C`).join(",")}
                                  rooms={rooms.length.toString()}
                                  homestayName={homestay.name}
                                  homestayId={homestayId}
                                >
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    onClick={() => handleBookRoom(room, 0)}
                                  >
                                    Book Now
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </PaymentOptionsDialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {availabilityData.availableRooms.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms available</h3>
                      <p className="text-gray-600">
                        Unfortunately, there are no rooms available for your selected dates. Please try different dates.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Policies */}
              <motion.div
                id="policies"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Policies & Information</h2>
                <Policies refundable={true} />

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>Check-in: {homestay.checkInTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>Check-out: {homestay.checkOutTime}</span>
                    </div>
                    {homestay.phone && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span>{homestay.phone}</span>
                      </div>
                    )}
                    {homestay.email && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>{homestay.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar - Desktop */}
            <div id="booking-widget" className="lg:w-96 lg:sticky lg:top-32 lg:self-start hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Check Availability</h3>
                  <p className="text-sm text-gray-500">Select dates and guests to proceed</p>
                </div>

                {/* Date & Guest Selection */}
                <div className="p-6 space-y-4">
                  {/* Check-in */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Check-in
                    </label>
                    <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={(date) => {
                            setCheckInDate(date);
                            setIsCheckInOpen(false);
                            if (date && !checkOutDate) {
                              setTimeout(() => setIsCheckOutOpen(true), 100);
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Check-out
                    </label>
                    <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={(date) => {
                            setCheckOutDate(date);
                            setIsCheckOutOpen(false);
                          }}
                          disabled={(date) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                            if (checkInDate) {
                              return date <= checkInDate || date < today;
                            }
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Guests & Rooms */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Guests
                    </label>
                    <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Users className="mr-2 h-4 w-4" />
                          {guestSummary}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-4">
                          {rooms.map((room, index) => (
                            <div key={index} className="border-b pb-4 last:border-b-0">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-sm">Room {index + 1}</h4>
                                {rooms.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRoom(index)}
                                    className="h-8 text-destructive hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Adults</span>
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateRoom(index, "adults", room.adults - 1)}
                                      disabled={room.adults <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{room.adults}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateRoom(index, "adults", room.adults + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Children</span>
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateRoom(index, "children", room.children - 1)}
                                      disabled={room.children <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{room.children}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateRoom(index, "children", room.children + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" className="w-full" onClick={addRoom}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Room
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Booking Summary */}
                {checkInDate && checkOutDate && (
                  <div className="px-6 pb-4 border-t border-gray-100 pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>{numNights} night{numNights !== 1 ? 's' : ''}</span>
                        <span>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Check Availability Button */}
                <div className="p-6 border-t border-gray-100">
                  <Button
                    onClick={handleCheckAvailability}
                    disabled={!checkInDate || !checkOutDate || checkingAvailability}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {checkingAvailability ? (
                      <>
                        <span className="animate-pulse">Checking Availability...</span>
                      </>
                    ) : (
                      <>
                        Check Availability
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    View available rooms and book instantly
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Check Availability Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
        <Button
          onClick={() => setIsMobileBookingOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Check Availability
        </Button>
      </div>

      {/* Mobile Booking Dialog */}
      <Dialog open={isMobileBookingOpen} onOpenChange={setIsMobileBookingOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl">Check Availability</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {/* Check-in */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Check-in
              </label>
              <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => {
                      setCheckInDate(date);
                      setIsCheckInOpen(false);
                      if (date && !checkOutDate) {
                        setTimeout(() => setIsCheckOutOpen(true), 100);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Check-out
              </label>
              <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => {
                      setCheckOutDate(date);
                      setIsCheckOutOpen(false);
                    }}
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      if (checkInDate) {
                        return date <= checkInDate || date < today;
                      }
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests & Rooms */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Guests
              </label>
              <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Users className="mr-2 h-4 w-4" />
                    {guestSummary}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-4" align="start">
                  <div className="space-y-4">
                    {rooms.map((room, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-sm">Room {index + 1}</h4>
                          {rooms.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRoom(index)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Adults</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "adults", room.adults - 1)}
                                disabled={room.adults <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{room.adults}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "adults", room.adults + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Children</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "children", room.children - 1)}
                                disabled={room.children <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{room.children}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "children", room.children + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addRoom}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Summary */}
            {checkInDate && checkOutDate && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{numNights} night{numNights !== 1 ? 's' : ''}</span>
                  <span>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Check Availability Button */}
            <Button
              onClick={() => {
                handleCheckAvailability();
                setIsMobileBookingOpen(false);
              }}
              disabled={!checkInDate || !checkOutDate || checkingAvailability}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              size="lg"
            >
              {checkingAvailability ? (
                <span className="animate-pulse">Checking Availability...</span>
              ) : (
                <>
                  Check Availability
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
