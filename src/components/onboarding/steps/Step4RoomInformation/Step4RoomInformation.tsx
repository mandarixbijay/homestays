"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoomInfo, Step4FormData } from "@/app/list-your-property/owner-registration/types";

interface Step4RoomInformationProps {
  onDeleteRoom: (index: number) => void;
}

export function Step4RoomInformation({ onDeleteRoom }: Step4RoomInformationProps) {
  const { setValue, watch, register, trigger, formState: { errors } } = useFormContext<Step4FormData>();
  const { toast } = useToast();

  const totalRooms = Number.isFinite(watch("totalRooms")) ? watch("totalRooms") : 1;
  const rooms = watch("rooms") || [];

  const defaultRoom: RoomInfo = {
    id: crypto.randomUUID(),
    name: "",
    maxOccupancy: { adults: 1, children: 0 },
    minOccupancy: { adults: 0, children: 0 },
    price: { value: 0, currency: "USD" },
  };

  useEffect(() => {
    if (totalRooms < 1) {
      setValue("totalRooms", 1, { shouldValidate: true });
      setValue("rooms", [defaultRoom], { shouldValidate: true });
      return;
    }

    const newRooms = Array.from({ length: totalRooms }, (_, i) => {
      const existingRoom = rooms[i];
      if (existingRoom && typeof existingRoom === "object") {
        return {
          ...defaultRoom,
          ...existingRoom,
          id: existingRoom.id || crypto.randomUUID(),
          maxOccupancy: {
            adults: Number.isFinite(existingRoom.maxOccupancy?.adults) ? Math.max(1, Math.floor(existingRoom.maxOccupancy.adults)) : 1,
            children: Number.isFinite(existingRoom.maxOccupancy?.children) ? Math.max(0, Math.floor(existingRoom.maxOccupancy.children)) : 0,
          },
          minOccupancy: {
            adults: Number.isFinite(existingRoom.minOccupancy?.adults) ? Math.max(0, Math.floor(existingRoom.minOccupancy.adults)) : 0,
            children: Number.isFinite(existingRoom.minOccupancy?.children) ? Math.max(0, Math.floor(existingRoom.minOccupancy.children)) : 0,
          },
          price: {
            value: Number.isFinite(existingRoom.price?.value) ? Math.max(0, existingRoom.price.value) : 0,
            currency: (existingRoom.price?.currency as "USD" | "NPR") ?? "USD",
          },
        };
      }
      return { ...defaultRoom, id: crypto.randomUUID() };
    });

    setValue("rooms", newRooms, { shouldValidate: true });
    trigger("rooms");
    console.log("Initialized rooms:", JSON.stringify(newRooms, null, 2));
  }, [totalRooms, setValue, trigger, rooms]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-2">
          <Label htmlFor="total-rooms" className="text-lg font-semibold text-gray-900">
            Total Rooms
          </Label>
          <p className="text-sm text-gray-500">Specify how many rooms are available in your property.</p>
          <Input
            id="total-rooms"
            type="number"
            {...register("totalRooms", {
              required: "Total rooms is required",
              min: { value: 1, message: "At least 1 room is required" },
              max: { value: 50, message: "Maximum 50 rooms allowed" },
              valueAsNumber: true,
            })}
            defaultValue={totalRooms}
            placeholder="e.g., 5"
            className="mt-2 rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10 text-base"
            min="1"
            max="50"
            aria-describedby="total-rooms-error"
          />
          {errors.totalRooms && (
            <p
              id="total-rooms-error"
              className="text-sm text-red-600 mt-1 flex items-center gap-1"
              role="alert"
            >
              <Info className="h-4 w-4" />
              {errors.totalRooms.message}
            </p>
          )}
        </div>
      </div>

      {totalRooms > 0 &&
        rooms.map((room: RoomInfo, index: number) => (
          <div
            key={room.id}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Room {index + 1} of {totalRooms}</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor={`name-${index}`} className="text-sm font-medium text-gray-900">
                  Room Name
                </Label>
                <Input
                  id={`name-${index}`}
                  {...register(`rooms.${index}.name`, {
                    required: "Room name is required",
                    minLength: { value: 2, message: "Room name must be at least 2 characters" },
                  })}
                  placeholder="e.g., Deluxe Suite"
                  defaultValue={room.name || ""}
                  className="mt-1 rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                  aria-describedby={`name-error-${index}`}
                />
                {errors.rooms?.[index]?.name && (
                  <p
                    id={`name-error-${index}`}
                    className="text-sm text-red-600 mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <Info className="h-4 w-4" />
                    {errors.rooms[index].name?.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Max Occupancy</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    {...register(`rooms.${index}.maxOccupancy.adults`, {
                      required: "Max adults is required",
                      min: { value: 1, message: "At least 1 adult is required" },
                      valueAsNumber: true,
                    })}
                    placeholder="Adults"
                    defaultValue={Number.isFinite(room.maxOccupancy.adults) ? room.maxOccupancy.adults : 1}
                    className="rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                    min="1"
                    aria-describedby={`max-occupancy-adults-error-${index}`}
                  />
                  <Input
                    type="number"
                    {...register(`rooms.${index}.maxOccupancy.children`, {
                      required: "Max children is required",
                      min: { value: 0, message: "Children cannot be negative" },
                      valueAsNumber: true,
                    })}
                    placeholder="Children"
                    defaultValue={Number.isFinite(room.maxOccupancy.children) ? room.maxOccupancy.children : 0}
                    className="rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                    min="0"
                    aria-describedby={`max-occupancy-children-error-${index}`}
                  />
                </div>
                {errors.rooms?.[index]?.maxOccupancy?.adults && (
                  <p
                    id={`max-occupancy-adults-error-${index}`}
                    className="text-sm text-red-600 mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <Info className="h-4 w-4" />
                    {errors.rooms[index].maxOccupancy.adults.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Min Occupancy</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    {...register(`rooms.${index}.minOccupancy.adults`, {
                      required: "Min adults is required",
                      min: { value: 0, message: "Adults cannot be negative" },
                      valueAsNumber: true,
                    })}
                    placeholder="Adults"
                    defaultValue={Number.isFinite(room.minOccupancy.adults) ? room.minOccupancy.adults : 0}
                    className="rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                    min="0"
                    aria-describedby={`min-occupancy-adults-error-${index}`}
                  />
                  <Input
                    type="number"
                    {...register(`rooms.${index}.minOccupancy.children`, {
                      required: "Min children is required",
                      min: { value: 0, message: "Children cannot be negative" },
                      valueAsNumber: true,
                    })}
                    placeholder="Children"
                    defaultValue={Number.isFinite(room.minOccupancy.children) ? room.minOccupancy.children : 0}
                    className="rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                    min="0"
                    aria-describedby={`min-occupancy-children-error-${index}`}
                  />
                </div>
                {errors.rooms?.[index]?.minOccupancy?.adults && (
                  <p
                    id={`min-occupancy-adults-error-${index}`}
                    className="text-sm text-red-600 mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <Info className="h-4 w-4" />
                    {errors.rooms[index].minOccupancy.adults.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Price</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    {...register(`rooms.${index}.price.value`, {
                      required: "Price is required",
                      min: { value: 1, message: "Price must be at least 1" },
                      valueAsNumber: true,
                    })}
                    placeholder="e.g., 100"
                    defaultValue={Number.isFinite(room.price.value) ? room.price.value : 0}
                    className="rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10"
                    min="1"
                    max="100000"
                    aria-describedby={`price-error-${index}`}
                  />
                  <Select
                    onValueChange={(value) =>
                      setValue(`rooms.${index}.price.currency`, value as "USD" | "NPR", {
                        shouldValidate: true,
                      })
                    }
                    defaultValue={room.price.currency || "USD"}
                  >
                    <SelectTrigger className="w-28 rounded-md h-10">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="NPR">NPR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.rooms?.[index]?.price?.value && (
                  <p
                    id={`price-error-${index}`}
                    className="text-sm text-red-600 mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <Info className="h-4 w-4" />
                    {errors.rooms[index].price.value.message}
                  </p>
                )}
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (totalRooms <= 1) {
                    toast({
                      variant: "destructive",
                      title: "Cannot Delete",
                      description: "At least one room is required.",
                    });
                    return;
                  }
                  onDeleteRoom(index);
                  toast({
                    title: "Room Deleted",
                    description: `Room ${index + 1} deleted successfully.`,
                  });
                }}
                disabled={totalRooms <= 1}
                className="rounded-md h-10"
                aria-label="Delete This Room"
              >
                Delete Room
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
}