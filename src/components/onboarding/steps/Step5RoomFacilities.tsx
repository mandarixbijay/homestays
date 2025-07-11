// components/Step5RoomFacilities/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step5FormData {
  rooms: {
    selectedFacilities: string[];
    customFacilities: string[];
  }[];
}

interface RoomInfo {
  name: string;
}

interface Step5RoomFacilitiesProps {
  currentRoomIndex: number;
  setCurrentRoomIndex: (index: number) => void;
  totalRooms: number;
  roomInfo: RoomInfo[]; // Minimal info from Step 4
}

export function Step5RoomFacilities({
  currentRoomIndex,
  setCurrentRoomIndex,
  totalRooms,
  roomInfo,
}: Step5RoomFacilitiesProps) {
  const { register, formState: { errors }, setValue, watch, trigger } = useFormContext<Step5FormData>();
  const { toast } = useToast();
  const [customInput, setCustomInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const defaultFacilities = [
    "Private Bathroom",
    "Balcony",
    "TV",
    "Mini Fridge",
    "Desk",
    "Safe",
  ];

  const rooms = watch("rooms") || [];
  const selectedFacilities = watch(`rooms.${currentRoomIndex}.selectedFacilities`) || [];
  const customFacilities = watch(`rooms.${currentRoomIndex}.customFacilities`) || [];

  // Initialize rooms array if not set
  useEffect(() => {
    if (rooms.length < totalRooms) {
      const initialRooms = Array.from({ length: totalRooms }, (_, i) => ({
        selectedFacilities: rooms[i]?.selectedFacilities || [],
        customFacilities: rooms[i]?.customFacilities || [],
      }));
      setValue("rooms", initialRooms, { shouldValidate: true });
    }
  }, [rooms.length, totalRooms, setValue]);

  const handleAddCustomFacility = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !customInput.trim()) return;
    e.preventDefault();
    setErrorMessage("");

    const normalizedInput = customInput.trim().toLowerCase();
    const allFacilities = [...defaultFacilities, ...customFacilities].map(f => f.toLowerCase());

    if (allFacilities.includes(normalizedInput)) {
      setErrorMessage("This facility already exists.");
      toast({
        variant: "destructive",
        title: "Duplicate Facility",
        description: "This facility already exists.",
      });
      return;
    }
    if (customFacilities.length >= 10) {
      setErrorMessage("Maximum 10 custom facilities allowed.");
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "Maximum 10 custom facilities allowed.",
      });
      return;
    }

    const newCustomFacilities = [...customFacilities, customInput.trim()];
    setValue(`rooms.${currentRoomIndex}.customFacilities`, newCustomFacilities, { shouldValidate: true });
    setCustomInput("");
    trigger(`rooms.${currentRoomIndex}.selectedFacilities`);
    toast({
      title: "Facility Added",
      description: `${customInput.trim()} added successfully.`,
    });
  };

  const handleRemoveCustomFacility = (facility: string) => {
    setErrorMessage("");
    const newCustomFacilities = customFacilities.filter(f => f !== facility);
    const newSelectedFacilities = selectedFacilities.filter(f => f !== facility);
    setValue(`rooms.${currentRoomIndex}.customFacilities`, newCustomFacilities, { shouldValidate: true });
    setValue(`rooms.${currentRoomIndex}.selectedFacilities`, newSelectedFacilities, { shouldValidate: true });
    trigger(`rooms.${currentRoomIndex}.selectedFacilities`);
    toast({
      title: "Facility Removed",
      description: `${facility} removed successfully.`,
    });
  };

  const handleCheckboxChange = (facility: string, checked: boolean) => {
    const newSelectedFacilities = checked
      ? [...selectedFacilities, facility]
      : selectedFacilities.filter(f => f !== facility);
    setValue(`rooms.${currentRoomIndex}.selectedFacilities`, newSelectedFacilities, { shouldValidate: true });
    trigger(`rooms.${currentRoomIndex}.selectedFacilities`);
  };

  const handleRoomSwitch = (value: string) => {
    const index = parseInt(value);
    setCurrentRoomIndex(index);
    setErrorMessage("");
    setCustomInput("");
  };

  const currentRoom = roomInfo[currentRoomIndex] || { name: `Room ${currentRoomIndex + 1}` };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {totalRooms > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Configuring Facilities for {currentRoom.name} (Room {currentRoomIndex + 1} of {totalRooms})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select or add facilities available in this room.
            </p>
          </div>
          {totalRooms > 1 && (
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-900">Switch Room</Label>
              <Select
                value={currentRoomIndex.toString()}
                onValueChange={handleRoomSwitch}
              >
                <SelectTrigger className="mt-1 rounded-md h-10">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {roomInfo.map((room, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {room.name || `Room ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-8">
            <div>
              <Label className="text-base font-semibold text-foreground">Select Facilities</Label>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Select at least one facility. Add custom facilities below (max 10).
              </p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...defaultFacilities, ...customFacilities].map((facility) => (
                  <div key={facility} className="flex items-center gap-2 group animate-fade-in">
                    <Checkbox
                      id={`room-${currentRoomIndex}-${facility.toLowerCase().replace(/\s/g, "-")}`}
                      checked={selectedFacilities.includes(facility)}
                      onCheckedChange={(checked) => handleCheckboxChange(facility, !!checked)}
                      className="rounded-md border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex items-center">
                      <Label
                        htmlFor={`room-${currentRoomIndex}-${facility.toLowerCase().replace(/\s/g, "-")}`}
                        className="text-sm font-medium text-foreground cursor-pointer pr-1"
                      >
                        {facility}
                      </Label>
                      {customFacilities.includes(facility) && (
                        <button
                          onClick={() => handleRemoveCustomFacility(facility)}
                          className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-0.5 shadow-sm hover:bg-red-100 transition-all duration-200"
                          aria-label={`Remove ${facility}`}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.rooms?.[currentRoomIndex]?.selectedFacilities && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.rooms[currentRoomIndex].selectedFacilities.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`custom-facility-${currentRoomIndex}`} className="text-base font-semibold text-foreground">
                Add Custom Facility
              </Label>
              <Input
                id={`custom-facility-${currentRoomIndex}`}
                value={customInput}
                onChange={(e) => {
                  setErrorMessage("");
                  setCustomInput(e.target.value);
                }}
                onKeyDown={handleAddCustomFacility}
                placeholder="e.g., Coffee Maker, Wardrobe (press Enter to add)"
                className="mt-3 rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10 text-sm"
              />
              {errorMessage && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}