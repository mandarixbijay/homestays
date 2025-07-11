import { z } from "zod";

export const step4Schema = z.object({
  totalRooms: z.number().min(1, "At least 1 room is required").max(50, "Maximum 50 rooms allowed"),
  rooms: z
    .array(
      z.object({
        id: z.string().min(1, "Room ID is required"),
        name: z.string().min(3, "Room name must be at least 3 characters"),
        maxOccupancy: z.object({
          adults: z.number().min(1, "At least 1 adult is required").int("Must be an integer"),
          children: z.number().min(0, "Cannot be negative").int("Must be an integer"),
        }),
        minOccupancy: z.object({
          adults: z.number().min(0, "Cannot be negative").int("Must be an integer"),
          children: z.number().min(0, "Cannot be negative").int("Must be an integer"),
        }),
        price: z.object({
          value: z.number().min(1, "Price must be positive").max(100000, "Price cannot exceed 100,000"),
          currency: z.enum(["USD", "NPR"]),
        }),
      })
    )
    .min(1, "At least one room is required")
    .refine(
      (data) => {
        return data.every(
          (room) =>
            room.minOccupancy.adults <= room.maxOccupancy.adults &&
            room.minOccupancy.children <= room.maxOccupancy.children
        );
      },
      {
        message: "Min occupancy cannot exceed max occupancy",
        path: ["rooms"],
      }
    ),
}).refine((data) => data.rooms.length === data.totalRooms, {
  message: "Number of rooms must match totalRooms",
  path: ["rooms"],
});