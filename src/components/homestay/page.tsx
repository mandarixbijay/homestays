// src/components/homestay/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import HomestayImageGallery from "@/components/homestay/components/details/image-gallery";
import DetailNav from "@/components/navbar/detail-page-navbar/page";
import Policies from "@/components/homestay/components/details/policies";
import AboutProperty from "@/components/homestay/components/details/about-property";
import OverviewSection from "@/components/homestay/components/details/overview-section";
import SignInCard from "@/components/homestay/components/sign-in-card";
import PaymentOptionsDialog from "@/components/homestay/components/dialogs/payment-options-dialog";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../navbar/navbar";
import Footer from "../footer/footer";
import { Hero3Card } from "@/types/homestay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSwipeable } from "react-swipeable";
import { 
  ArrowUp, 
  Calendar, 
  Users, 
  Bed, 
  Edit, 
  Plus, 
  Minus,
  Star,
  MapPin,
  Shield,
  Wifi,
  Car,
  Coffee,
  ChevronDown,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { useHomestayStore } from "@/store/homestayStore";
import { useSearchParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorBoundary } from "./components/error-boundary";
import RoomsView from "./components/details/room-details/rooms-view";

interface HomestayDetailClientProps {
  homestay: Hero3Card & { id?: number };
  slug: string;
}

export default function HomestayDetailClient({ homestay, slug }: HomestayDetailClientProps) {
  const { selectedRooms, clearSelectedRooms, updateRoom } = useHomestayStore();
  const searchParams = useSearchParams();
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [reassignGuests, setReassignGuests] = useState<
    { roomId: number; adults: number; children: number; sleeps: number }[]
  >([]);

  const images = homestay.images.length > 0 ? homestay.images : ["/images/fallback-image.png"];
  const totalPhotos = images.length;
  const totalRoomsLeft = homestay.rooms.reduce((sum, room) => sum + (room.roomsLeft || 0), 0);

  const checkIn = searchParams.get("checkIn") || format(new Date(), "yyyy-MM-dd");
  const checkOut = searchParams.get("checkOut") || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const guests = searchParams.get("guests") || "2A0C";
  const rooms = searchParams.get("rooms") || "1";

  const numNights = differenceInDays(new Date(checkOut), new Date(checkIn)) || 1;
  const totalPrice = selectedRooms.reduce((sum, room) => sum + room.totalPrice, 0);

  const inputGuests = guests.split(",").reduce(
    (acc, guest) => {
      const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
      return { adults: acc.adults + adults, children: acc.children + children };
    },
    { adults: 0, children: 0 }
  );
  
  const selectedGuests = selectedRooms.reduce(
    (acc, room) => ({
      adults: acc.adults + room.adults,
      children: acc.children + room.children,
    }),
    { adults: 0, children: 0 }
  );
  
  const isValidSelection =
    selectedRooms.length === parseInt(rooms) &&
    inputGuests.adults === selectedGuests.adults &&
    inputGuests.children === selectedGuests.children;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => console.log("Next image"),
    onSwipedRight: () => console.log("Previous image"),
    trackMouse: true,
  });

  const handleReassignGuests = useCallback(() => {
    setReassignGuests(
      selectedRooms.map((room) => {
        if (!room.roomId) {
          throw new Error(`Room ID missing for selected room: ${room.roomTitle}`);
        }
        return {
          roomId: room.roomId,
          adults: room.adults,
          children: room.children,
          sleeps: room.sleeps,
        };
      })
    );
    setIsReassignOpen(true);
  }, [selectedRooms]);

  const handleSaveReassign = useCallback(() => {
    const totalAdults = reassignGuests.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = reassignGuests.reduce((sum, room) => sum + room.children, 0);
    if (totalAdults !== inputGuests.adults || totalChildren !== inputGuests.children) {
      alert("Total guests must match the original selection.");
      return;
    }
    reassignGuests.forEach((room) => {
      if (room.adults + room.children > room.sleeps) {
        alert(`Room ${room.roomId} cannot accommodate ${room.adults + room.children} guests.`);
        return;
      }
      updateRoom(room.roomId, { adults: room.adults, children: room.children });
    });
    setIsReassignOpen(false);
  }, [reassignGuests, inputGuests, updateRoom]);

  const amenityIcons = {
    "Free WiFi": <Wifi className="h-5 w-5" />,
    "Parking": <Car className="h-5 w-5" />,
    "Breakfast": <Coffee className="h-5 w-5" />,
  };

  const navigationSections = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "rooms", label: "Rooms" },
    { id: "policies", label: "Policies" },
  ];

  return (
    <ErrorBoundary>
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
              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-blue-600 fill-current" />
                <span className="text-sm font-semibold text-blue-700">{homestay.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({homestay.rooms[0]?.reviews || 0} reviews)</span>
              
              {homestay.vipAccess && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full font-semibold shadow-sm">
                  VIP Access
                </Badge>
              )}
              
              {totalRoomsLeft < 5 && (
                <Badge className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {totalRoomsLeft} {totalRoomsLeft === 1 ? "room" : "rooms"} left
                </Badge>
              )}

              <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Refundable</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">NPR {homestay.rooms[0]?.nightlyPrice.toLocaleString()}</div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{homestay.rooms.length}</div>
                <div className="text-sm text-gray-500">room types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.max(...homestay.rooms.map(r => r.sleeps))}</div>
                <div className="text-sm text-gray-500">max guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{homestay.features.length}</div>
                <div className="text-sm text-gray-500">amenities</div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div {...swipeHandlers} className="mb-12">
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
              onClick={() => setShowBookingSummary(true)}
              className="lg:hidden flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Bed className="h-4 w-4" />
              Book Now
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
                <OverviewSection homestay={homestay} slug={slug} />
                <div className="mt-8">
                  <AboutProperty homestay={homestay} />
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
                  {[...new Set([...homestay.features, ...homestay.rooms.flatMap((room) => room.facilities)])].map(
                    (feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {amenityIcons[feature as keyof typeof amenityIcons] || <Check className="h-5 w-5 text-blue-600" />}
                        </div>
                        <span className="font-medium text-gray-900">{feature}</span>
                      </div>
                    )
                  )}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
                <RoomsView
                  rooms={homestay.rooms}
                  homestayName={homestay.name}
                  address={homestay.address}
                  features={homestay.features}
                  homestayId={homestay.id || 1}
                />
              </motion.div>

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
                <Policies refundable={homestay.rooms.some((room) => room.refundable)} />
              </motion.div>

              {/* Sign In Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <SignInCard />
              </motion.div>
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="lg:w-96 lg:sticky lg:top-32 lg:self-start hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Book Your Stay</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        NPR {homestay.rooms[0]?.nightlyPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Check-in:</span>
                      <span className="text-gray-600">{format(new Date(checkIn), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Check-out:</span>
                      <span className="text-gray-600">{format(new Date(checkOut), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Guests:</span>
                      <span className="text-gray-600">
                        {inputGuests.adults} Adult{inputGuests.adults !== 1 ? "s" : ""}, {inputGuests.children} Child{inputGuests.children !== 1 ? "ren" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Bed className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Rooms:</span>
                      <span className="text-gray-600">{rooms}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Rooms */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4">Selected Rooms</h4>
                  {selectedRooms.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedRooms.map((room, index) => (
                        <div key={room.roomId} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">{room.roomTitle}</h5>
                            <span className="text-sm font-semibold text-blue-600">Room {index + 1}</span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>{room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children} Child{room.children !== 1 ? "ren" : ""}</p>
                            <p>NPR {room.nightlyPrice.toLocaleString()} × {numNights} night{numNights !== 1 ? "s" : ""}</p>
                            <p className="font-semibold text-gray-900">Total: NPR {room.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bed className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No rooms selected yet</p>
                      <p className="text-xs text-gray-400 mt-1">Choose from available rooms below</p>
                    </div>
                  )}
                </div>

                {/* Total and Actions */}
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-lg font-bold text-gray-900 mb-2">
                      <span>Grand Total</span>
                      <span>NPR {totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500">for {numNights} night{numNights !== 1 ? "s" : ""}</p>
                  </div>

                  {!isValidSelection && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          Please select {rooms} room{rooms !== "1" ? "s" : ""} with {inputGuests.adults} adult{inputGuests.adults !== 1 ? "s" : ""} and {inputGuests.children} child{inputGuests.children !== 1 ? "ren" : ""}.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-gray-50"
                        onClick={clearSelectedRooms}
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-gray-50"
                        onClick={handleReassignGuests}
                        disabled={selectedRooms.length === 0}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Reassign
                      </Button>
                    </div>
                    
                    <PaymentOptionsDialog
                      nightlyPrice={homestay.rooms[0]?.nightlyPrice || 0}
                      totalPrice={totalPrice}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      guests={guests}
                      rooms={rooms}
                      homestayName={homestay.name}
                      homestayId={homestay.id || 1}
                    >
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        disabled={!isValidSelection || selectedRooms.length === 0}
                      >
                        Reserve Now - NPR {totalPrice.toLocaleString()}
                      </Button>
                    </PaymentOptionsDialog>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-gray-900">NPR {totalPrice.toLocaleString()}</div>
            <div className="text-xs text-gray-500">for {numNights} night{numNights !== 1 ? "s" : ""}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBookingSummary(true)}
              className="px-3"
            >
              Details
            </Button>
            <PaymentOptionsDialog
              nightlyPrice={homestay.rooms[0]?.nightlyPrice || 0}
              totalPrice={totalPrice}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              rooms={rooms}
              homestayName={homestay.name}
              homestayId={homestay.id || 1}
            >
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                disabled={!isValidSelection || selectedRooms.length === 0}
              >
                Reserve
              </Button>
            </PaymentOptionsDialog>
          </div>
        </div>
      </div>

      {/* Mobile Booking Summary Dialog */}
      <Dialog open={showBookingSummary} onOpenChange={setShowBookingSummary}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Booking Summary</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBookingSummary(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Booking Details */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Check-in:</span>
                <span className="text-gray-600">{format(new Date(checkIn), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Check-out:</span>
                <span className="text-gray-600">{format(new Date(checkOut), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Guests:</span>
                <span className="text-gray-600">
                  {inputGuests.adults} Adult{inputGuests.adults !== 1 ? "s" : ""}, {inputGuests.children} Child{inputGuests.children !== 1 ? "ren" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Bed className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Rooms:</span>
                <span className="text-gray-600">{rooms}</span>
              </div>
            </div>

            {/* Selected Rooms */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Selected Rooms</h4>
              {selectedRooms.length > 0 ? (
                <div className="space-y-3">
                  {selectedRooms.map((room, index) => (
                    <div key={room.roomId} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{room.roomTitle}</h5>
                        <span className="text-xs font-semibold text-blue-600">Room {index + 1}</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>{room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children} Child{room.children !== 1 ? "ren" : ""}</p>
                        <p>NPR {room.nightlyPrice.toLocaleString()} × {numNights} night{numNights !== 1 ? "s" : ""}</p>
                        <p className="font-semibold text-gray-900">Total: NPR {room.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bed className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No rooms selected yet</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                <span>Grand Total</span>
                <span>NPR {totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">for {numNights} night{numNights !== 1 ? "s" : ""}</p>
            </div>

            {!isValidSelection && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Please select {rooms} room{rooms !== "1" ? "s" : ""} with {inputGuests.adults} adult{inputGuests.adults !== 1 ? "s" : ""} and {inputGuests.children} child{inputGuests.children !== 1 ? "ren" : ""}.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={clearSelectedRooms}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={handleReassignGuests}
                  disabled={selectedRooms.length === 0}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Reassign
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Guests Dialog */}
      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reassign Guests</DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              Redistribute guests among your selected rooms. Total guests must remain the same.
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current totals */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Total Guests to Assign</h4>
              <div className="flex items-center gap-4 text-sm text-blue-800">
                <span>{inputGuests.adults} Adult{inputGuests.adults !== 1 ? "s" : ""}</span>
                <span>{inputGuests.children} Child{inputGuests.children !== 1 ? "ren" : ""}</span>
              </div>
            </div>

            {/* Room assignments */}
            <div className="space-y-4">
              {reassignGuests.map((room, index) => (
                <motion.div
                  key={room.roomId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 border border-gray-200 rounded-xl bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Room {index + 1}: {selectedRooms.find((r) => r.roomId === room.roomId)?.roomTitle}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum capacity: {room.sleeps} guests
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {room.adults + room.children}/{room.sleeps} guests
                    </div>
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Adults</p>
                      <p className="text-xs text-gray-500">Ages 18+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReassignGuests((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, adults: Math.max(1, r.adults - 1) } : r
                            )
                          )
                        }
                        disabled={room.adults <= 1}
                        className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-gray-900">{room.adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReassignGuests((prev) =>
                            prev.map((r, i) =>
                              i === index && r.adults + r.children < r.sleeps
                                ? { ...r, adults: r.adults + 1 }
                                : r
                            )
                          )
                        }
                        disabled={room.adults + room.children >= room.sleeps}
                        className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Children</p>
                      <p className="text-xs text-gray-500">Ages 0–17</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReassignGuests((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, children: Math.max(0, r.children - 1) } : r
                            )
                          )
                        }
                        disabled={room.children <= 0}
                        className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-gray-900">{room.children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReassignGuests((prev) =>
                            prev.map((r, i) =>
                              i === index && r.adults + r.children < r.sleeps
                                ? { ...r, children: r.children + 1 }
                                : r
                            )
                          )
                        }
                        disabled={room.adults + room.children >= room.sleeps}
                        className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Capacity warning */}
                  {room.adults + room.children > room.sleeps && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700">
                          This room can only accommodate {room.sleeps} guests.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsReassignOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleSaveReassign}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      <Button
        className="fixed bottom-20 lg:bottom-6 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>

      <Footer />
    </ErrorBoundary>
  );
}