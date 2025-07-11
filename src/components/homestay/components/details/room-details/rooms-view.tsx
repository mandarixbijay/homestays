// src/components/homestay/components/details/room-details/rooms-view.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCard from "./room-card";

interface Room {
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
}

interface RoomsViewProps {
  rooms: Room[];
}

export default function RoomsView({ rooms }: RoomsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;

  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  // Get rooms for current page
  const startIndex = (currentPage - 1) * roomsPerPage;
  const currentRooms = rooms.slice(startIndex, startIndex + roomsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Room Count */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-text-secondary">
            Showing {currentRooms.length} of {totalRooms} rooms
          </span>
        </div>

        {/* Room Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {currentRooms.length > 0 ? (
              currentRooms.map((room, index) => (
                <motion.div
                  key={`${room.roomTitle}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-[350px] mx-auto"
                >
                  <RoomCard
                    {...room}
                    cityView={room.cityView ?? false}
                    freeParking={room.freeParking ?? false}
                    freeWifi={room.freeWifi ?? false}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-rooms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="col-span-full text-center py-12"
              >
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-text-secondary">
                  No rooms available.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalRooms > roomsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-full border-gray-300 hover:bg-gray-100"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border-gray-300 hover:bg-gray-100 text-primary"
                    }`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-full border-gray-300 hover:bg-gray-100"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}