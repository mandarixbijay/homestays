// src/components/homestay/components/details/rooms-view.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hero3Card } from "@/types/homestay";
import RoomCard from "./room-card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind, 
  Users, 
  Home,
  Filter,
  SortAsc,
  SortDesc,
  Grid3x3,
  List
} from "lucide-react";

interface RoomsViewProps {
  rooms: Hero3Card["rooms"];
  homestayName: string;
  address: string;
  features: string[];
  homestayId: number;
}

// Icon mapping for common features
const getFeatureIcon = (feature: string) => {
  const lowerFeature = feature.toLowerCase();
  if (lowerFeature.includes('wifi') || lowerFeature.includes('internet')) return Wifi;
  if (lowerFeature.includes('parking') || lowerFeature.includes('car')) return Car;
  if (lowerFeature.includes('coffee') || lowerFeature.includes('breakfast')) return Coffee;
  if (lowerFeature.includes('tv') || lowerFeature.includes('television')) return Tv;
  if (lowerFeature.includes('ac') || lowerFeature.includes('air')) return Wind;
  return Home;
};

export default function RoomsView({ rooms, homestayName, address, features, homestayId }: RoomsViewProps) {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<'price' | 'availability' | 'rating'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const totalRooms = rooms.length;
  const totalRoomsLeft = rooms.reduce((sum, room) => sum + (room.roomsLeft || 0), 0);
  const guests = searchParams.get("guests") || "2A0C";
  const roomsRequired = parseInt(searchParams.get("rooms") || "1");

  // Validate room pricing
  const processedRooms = [...rooms].map((room) => ({
    ...room,
    nightlyPrice: room.nightlyPrice && room.nightlyPrice > 0 ? room.nightlyPrice : 1000,
    totalPrice: room.totalPrice && room.totalPrice > 0 ? room.totalPrice : room.nightlyPrice || 1000,
  }));

  // Sort rooms based on selected criteria
  const sortedRooms = processedRooms.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.nightlyPrice - b.nightlyPrice;
        break;
      case 'availability':
        comparison = (b.roomsLeft || 0) - (a.roomsLeft || 0);
        break;
      case 'rating':
        comparison = (b.rating || 0) - (a.rating || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const guestDistribution = guests.split(",").map((guest) => {
    const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
    return { adults, children, total: adults + children };
  });

  const roomAssignments: { roomId: number; assignedGuests?: { adults: number; children: number } }[] = sortedRooms.map(
    (room) => {
      if (!room.roomId) {
        throw new Error(`Room ID missing for room: ${room.roomTitle}`);
      }
      return {
        roomId: room.roomId,
        assignedGuests: undefined,
      };
    }
  );

  let assignedRoomCount = 0;
  for (const guest of guestDistribution) {
    if (assignedRoomCount >= roomsRequired) break;
    const suitableRoom = sortedRooms.find(
      (room, index) =>
        !roomAssignments[index].assignedGuests && room.sleeps >= guest.total && (room.roomsLeft || Infinity) > 0
    );
    if (suitableRoom) {
      const index = sortedRooms.indexOf(suitableRoom);
      roomAssignments[index].assignedGuests = { adults: guest.adults, children: guest.children };
      assignedRoomCount++;
    }
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <section className="min-h-screen bg-gray-50/30" aria-label="Available rooms section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 lg:mb-12"
        >
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Available Rooms
            </h1>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-2">
              {homestayName}
            </h2>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-4">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm lg:text-base">{address}</p>
            </div>
          </div>

          {/* Stats and Availability */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              {totalRoomsLeft} room{totalRoomsLeft !== 1 ? 's' : ''} available
            </Badge>
            <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              {totalRooms} total room{totalRooms !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Property Features */}
          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center lg:text-left">
                Property Amenities
              </h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {features.map((feature, index) => {
                  const IconComponent = getFeatureIcon(feature);
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-default"
                          >
                            <IconComponent className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{feature}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'price', label: 'Price' },
                { key: 'availability', label: 'Availability' },
                { key: 'rating', label: 'Rating' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key as typeof sortBy)}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${sortBy === key 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  {label}
                  {sortBy === key && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'}
                `}
              >
                <Grid3x3 className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'}
                `}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Rooms Grid/List */}
        <AnimatePresence mode="wait">
          {totalRooms > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8' 
                  : 'flex flex-col gap-6'}
              `}
              role="grid"
              aria-label="Room cards"
            >
              {sortedRooms.map((room, index) => {
                const assignment = roomAssignments.find((a) => a.roomId === room.roomId);
                const isSuitable =
                  room.sleeps >=
                    ((assignment?.assignedGuests
                      ? assignment.assignedGuests.adults + assignment.assignedGuests.children
                      : 0)) &&
                  (room.roomsLeft || Infinity) > 0;

                return (
                  <motion.div
                    key={room.roomId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className={viewMode === 'list' ? 'max-w-none' : ''}
                  >
                    <RoomCard
                      {...room}
                      homestayName={homestayName}
                      homestayId={homestayId}
                      roomId={room.roomId!}
                      cityView={room.cityView ?? false}
                      freeParking={room.freeParking ?? false}
                      freeWifi={room.freeWifi ?? false}
                      isSuitable={isSuitable}
                      assignedGuests={assignment?.assignedGuests}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Rooms Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Unfortunately, no rooms match your current selection criteria. 
                  Try adjusting your dates or guest count.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                  onClick={() => window.location.href = "/"}
                  aria-label="Back to search"
                >
                  Back to Search
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Footer */}
        {totalRooms > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
              <span className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{sortedRooms.length}</span> room{sortedRooms.length !== 1 ? 's' : ''}
              </span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalRoomsLeft}</span> available
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}