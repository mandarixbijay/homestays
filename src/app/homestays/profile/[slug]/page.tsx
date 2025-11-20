// src/app/homestays/profile/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  MapPin, Star, Wifi, Car, Coffee, Users, Calendar as CalendarIcon,
  Plus, Minus, X, Search, Phone, Mail, Clock, Check
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { cn } from "@/lib/utils";

interface Room {
  adults: number;
  children: number;
}

interface Homestay {
  id: number;
  name: string;
  address: string;
  rating: number | null;
  reviews: number;
  imageSrc: string;
  facilities: string[];
  aboutDescription?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discount?: number;
  discountType?: string;
}

export default function HomestayProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Extract ID from slug (format: name-address-{id})
  const homestayId = slug ? parseInt(slug.split('-').pop() || '0') : 0;

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<any>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch homestay data (placeholder for now - will be replaced with API)
  useEffect(() => {
    const fetchHomestay = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when available
        // For now, show a placeholder message
        console.log(`Fetching homestay with ID: ${homestayId}`);

        // Simulated data for now
        setTimeout(() => {
          setHomestay({
            id: homestayId,
            name: "Loading Homestay Details...",
            address: "Nepal",
            rating: null,
            reviews: 0,
            imageSrc: "/images/placeholder-homestay.jpg",
            facilities: ["Wifi", "Parking", "Garden"],
            aboutDescription: "Homestay details will be loaded once the API is integrated.",
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching homestay:", error);
        setLoading(false);
      }
    };

    if (homestayId) {
      fetchHomestay();
    }
  }, [homestayId]);

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
    try {
      // TODO: Replace with actual API call when available
      console.log("Checking availability for homestay:", {
        homestayId,
        checkInDate: format(checkInDate, "yyyy-MM-dd"),
        checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
        rooms,
      });

      // Simulated response
      setTimeout(() => {
        setAvailabilityResults({
          available: true,
          message: "API integration pending. This will show real availability once the backend endpoint is ready.",
          rooms: [],
        });
        setCheckingAvailability(false);
      }, 1000);
    } catch (error) {
      console.error("Error checking availability:", error);
      setCheckingAvailability(false);
    }
  };

  // Guest summary
  const guestSummary = () => {
    const totalGuests = rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
    const totalRooms = rooms.length;
    return `${totalGuests} traveler${totalGuests !== 1 ? "s" : ""}, ${totalRooms} room${totalRooms !== 1 ? "s" : ""}`;
  };

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
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Homestay not found</h1>
            <p className="text-muted-foreground mb-6">The homestay you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/deals")}>Back to Deals</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-96 rounded-2xl overflow-hidden mb-8"
        >
          <Image
            src={homestay.imageSrc}
            alt={homestay.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title and Location */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">{homestay.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{homestay.address}</span>
                </div>
                {homestay.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{homestay.rating.toFixed(1)}</span>
                    <span>({homestay.reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">
                {homestay.aboutDescription || "No description available."}
              </p>
            </div>

            {/* Facilities */}
            {homestay.facilities && homestay.facilities.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {homestay.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">Property Information</h2>
              <div className="space-y-3">
                {homestay.checkInTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Check-in: {homestay.checkInTime}</span>
                  </div>
                )}
                {homestay.checkOutTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Check-out: {homestay.checkOutTime}</span>
                  </div>
                )}
                {homestay.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span>{homestay.phone}</span>
                  </div>
                )}
                {homestay.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span>{homestay.email}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar - Check Availability */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Check Availability</h3>

              {/* Pricing Info */}
              {homestay.discountedPrice && (
                <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    {homestay.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        NPR {homestay.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      NPR {homestay.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/ night</span>
                  </div>
                  {homestay.discount && (
                    <div className="mt-2 inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                      {homestay.discountType === 'PERCENTAGE'
                        ? `${homestay.discount}% OFF`
                        : `NPR ${homestay.discount} OFF`}
                    </div>
                  )}
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                {/* Check-in */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
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
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
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
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Guests
                  </label>
                  <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Users className="mr-2 h-4 w-4" />
                        {guestSummary()}
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

              {/* Check Availability Button */}
              <Button
                onClick={handleCheckAvailability}
                disabled={checkingAvailability || !checkInDate || !checkOutDate}
                className="w-full mb-4"
                size="lg"
              >
                {checkingAvailability ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check Availability
                  </>
                )}
              </Button>

              {/* Availability Results */}
              {availabilityResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-accent/10 rounded-lg border border-accent/20"
                >
                  <p className="text-sm text-muted-foreground">
                    {availabilityResults.message}
                  </p>
                </motion.div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                * API integration pending. Real-time availability will be shown once the backend is ready.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
