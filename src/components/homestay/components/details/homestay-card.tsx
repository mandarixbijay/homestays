"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoomCard from "@/components/homestay/components/details/room-details/room-card";
import { Hero3Card } from "@/types/homestay";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

interface HomestayCardProps {
  homestay: Hero3Card & { id?: number };
}

interface GuestDistribution {
  adults: number;
  children: number;
  total: number;
}

interface RoomAssignment {
  roomId: number;
  assignedGuests?: { adults: number; children: number }; // Fixed: Allow object or undefined
}

export default function HomestayCard({ homestay }: HomestayCardProps) {
  const searchParams = useSearchParams();
  const guests = searchParams.get("guests") || "2A0C";
  const roomsRequired = parseInt(searchParams.get("rooms") || "1");
  const totalRoomsLeft = homestay.rooms.reduce((sum, room) => sum + (room.roomsLeft || 0), 0);

  // Parse guest distribution
  const guestDistribution: GuestDistribution[] = useMemo(() => {
    try {
      return guests.split(",").map((guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        if (isNaN(adults) || isNaN(children)) {
          throw new Error(`Invalid guest format: ${guest}`);
        }
        return { adults, children, total: adults + children };
      });
    } catch (error) {
      const errorMsg = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error);
      console.warn(`Error parsing guests: ${errorMsg}. Defaulting to 2A0C.`);
      return [{ adults: 2, children: 0, total: 2 }];
    }
  }, [guests]);

  // Optimize room assignments: prioritize lower cost and sufficient sleeps
  const sortedRooms = useMemo(() => {
    return [...homestay.rooms].sort((a, b) => {
      if ((a.roomsLeft || 0) === (b.roomsLeft || 0)) {
        return a.nightlyPrice - b.nightlyPrice; // Prefer cheaper rooms
      }
      return (b.roomsLeft || 0) - (a.roomsLeft || 0); // Then more available rooms
    });
  }, [homestay.rooms]);

  // Assign guests to rooms
  const roomAssignments: RoomAssignment[] = useMemo(() => {
    const assignments: RoomAssignment[] = sortedRooms.map((room, index) => ({
      roomId: room.roomId || index + 1,
      assignedGuests: undefined,
    }));

    let assignedRoomCount = 0;
    for (const guest of guestDistribution) {
      if (assignedRoomCount >= roomsRequired) break;
      const suitableRoom = sortedRooms.find(
        (room, index) =>
          !assignments[index].assignedGuests &&
          room.sleeps >= guest.total &&
          (room.roomsLeft || Infinity) > 0
      );
      if (suitableRoom) {
        const index = sortedRooms.indexOf(suitableRoom);
        assignments[index].assignedGuests = { adults: guest.adults, children: guest.children };
        assignedRoomCount++;
      }
    }

    return assignments;
  }, [sortedRooms, guestDistribution, roomsRequired]);

  return (
    <section className="py-8" aria-label={`Rooms at ${homestay.name}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 font-manrope">
            Rooms at {homestay.name}
          </h2>
          <Badge className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {totalRoomsLeft} {totalRoomsLeft === 1 ? "room" : "rooms"} available
          </Badge>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {sortedRooms.length > 0 ? (
              sortedRooms.map((room, index) => {
                const assignment = roomAssignments.find((a) => a.roomId === (room.roomId || index + 1));
                const isSuitable =
                  room.sleeps >= ((assignment?.assignedGuests ? assignment.assignedGuests.adults + assignment.assignedGuests.children : 0)) &&
                  (room.roomsLeft || Infinity) > 0;
                return (
                  <motion.div
                    key={`${room.roomTitle}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <RoomCard
                      {...room}
                      homestayName={homestay.name}
                      homestayId={homestay.id || 1}
                      roomId={room.roomId || index + 1}
                      cityView={room.cityView ?? false}
                      freeParking={room.freeParking ?? false}
                      freeWifi={room.freeWifi ?? false}
                      isSuitable={isSuitable}
                      assignedGuests={assignment?.assignedGuests}
                    />
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                key="no-rooms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-lg text-gray-600 font-manrope" role="alert">
                  No rooms available.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}