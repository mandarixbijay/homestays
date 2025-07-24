"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Hero3Card } from "@/types/homestay";

interface SelectedRoom {
  roomId: number; // Add roomId to identify the room
  roomTitle: string;
  adults: number;
  children: number;
  nightlyPrice: number;
  totalPrice: number;
  sleeps: number;
}

interface HomestayContextType {
  homestays: Hero3Card[];
  setHomestays: (homestays: Hero3Card[]) => void;
  selectedRooms: SelectedRoom[];
  setSelectedRooms: (rooms: SelectedRoom[]) => void;
  clearSelectedRooms: () => void;
}

const HomestayContext = createContext<HomestayContextType | undefined>(undefined);

export const HomestayProvider = ({ children }: { children: ReactNode }) => {
  const [homestays, setHomestays] = useState<Hero3Card[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);

  const clearSelectedRooms = () => setSelectedRooms([]);

  return (
    <HomestayContext.Provider value={{ homestays, setHomestays, selectedRooms, setSelectedRooms, clearSelectedRooms }}>
      {children}
    </HomestayContext.Provider>
  );
};

export const useHomestayContext = () => {
  const context = useContext(HomestayContext);
  if (!context) {
    throw new Error("useHomestayContext must be used within a HomestayProvider");
  }
  return context;
};