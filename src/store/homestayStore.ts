// src/store/homestayStore.ts
import { create } from "zustand";
import { Hero3Card } from "@/types/homestay";

interface SelectedRoom {
  roomId: number;
  roomTitle: string;
  adults: number;
  children: number;
  nightlyPrice: number;
  totalPrice: number;
  sleeps: number;
  numRooms: number; // Added to track number of rooms selected
}

interface HomestayState {
  selectedRooms: SelectedRoom[];
  addRoom: (room: SelectedRoom) => void;
  updateRoom: (roomId: number, updates: Partial<SelectedRoom>) => void;
  removeRoom: (roomId: number) => void;
  clearSelectedRooms: () => void;
  getTotalSelectedRooms: () => number; // Added to sum numRooms across selectedRooms
}

export const useHomestayStore = create<HomestayState>((set, get) => ({
  selectedRooms: [],
  addRoom: (room) =>
    set((state) => {
      // Prevent adding a room with numRooms <= 0
      if (room.numRooms <= 0) {
        console.warn("Cannot add room with numRooms <= 0:", room.roomTitle);
        return state;
      }
      return {
        selectedRooms: [...state.selectedRooms, room],
      };
    }),
  updateRoom: (roomId, updates) =>
    set((state) => ({
      selectedRooms: state.selectedRooms.map((room) =>
        room.roomId === roomId
          ? {
              ...room,
              ...updates,
              // Ensure numRooms is not negative and remove room if numRooms becomes 0
              numRooms: updates.numRooms !== undefined ? Math.max(0, updates.numRooms) : room.numRooms,
            }
          : room
      ).filter((room) => room.numRooms > 0), // Remove room if numRooms becomes 0
    })),
  removeRoom: (roomId) =>
    set((state) => ({
      selectedRooms: state.selectedRooms.filter((room) => room.roomId !== roomId),
    })),
  clearSelectedRooms: () => set({ selectedRooms: [] }),
  getTotalSelectedRooms: () =>
    get().selectedRooms.reduce((sum, room) => sum + (room.numRooms || 1), 0),
}));