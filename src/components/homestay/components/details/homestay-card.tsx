"use client";

import React from "react";
import RoomCard from "@/components/homestay/components/details/room-details/room-card";
import { Homestay, RoomCards } from "@/models/index";

export default function HomestayCard({ id, name, rooms }: Homestay) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: RoomCards, index: number) => (
          // <RoomCard key={index} {...room} homestayName={name} /> ??
                    <RoomCard key={index} {...room}  />

        ))}
      </div>
    </div>
  );
}
