// src/components/homestay/components/details/date-guest-location-picker.tsx
"use client";

import React, { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, X, Plus, Minus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const locations = [
  { value: "pokhara", label: "Pokhara, Nepal" },
  { value: "biratnagar", label: "Biratnagar, Nepal" },
  { value: "kathmandu", label: "Kathmandu, Nepal" },
  { value: "lumbini", label: "Lumbini, Nepal" },
  { value: "chitwan", label: "Chitwan, Nepal" },
  { value: "dharan", label: "Dharan, Nepal" },
  { value: "thori", label: "Thori, Nepal" }, // Added to match dealCardsData
  { value: "bardiya", label: "Bardiya, Nepal" }, // Added to match dealCardsData
];

interface Room {
  adults: number;
  children: number;
}

interface DateGuestLocationPickerProps {
  onSelectLocation?: (value: string) => void;
  onSearch?: (searchData: {
    location: string | null;
    date: DateRange | undefined;
    rooms: Room[];
  }) => void;
  className?: string;
  initialLocation?: string;
  initialDate?: DateRange;
  initialRooms?: Room[];
}

export function DateGuestLocationPicker({
  onSelectLocation,
  onSearch,
  className,
  initialLocation,
  initialDate,
  initialRooms,
}: DateGuestLocationPickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialDate || {
    from: new Date(2025, 6, 10),
    to: addDays(new Date(2025, 6, 10), 2),
  });
  const [rooms, setRooms] = useState<Room[]>(initialRooms || [{ adults: 2, children: 0 }]);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(initialLocation || null);

  useEffect(() => {
    setLocation(initialLocation || null);
    setDate(initialDate || { from: new Date(2025, 6, 10), to: addDays(new Date(2025, 6, 10), 2) });
    setRooms(initialRooms || [{ adults: 2, children: 0 }]);
  }, [initialLocation, initialDate, initialRooms]);

  const handleAdultsChange = (index: number, delta: number) => {
    setRooms(rooms.map((room, i) => (i === index ? { ...room, adults: Math.max(1, room.adults + delta) } : room)));
  };

  const handleChildrenChange = (index: number, delta: number) => {
    setRooms(rooms.map((room, i) => (i === index ? { ...room, children: Math.max(0, room.children + delta) } : room)));
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 1, children: 0 }]);
  };

  const handleRemoveRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleDoneClick = () => {
    setIsGuestPopoverOpen(false);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    onSelectLocation?.(value);
  };

  const handleSearch = () => {
    onSearch?.({ location, date, rooms });
  };

  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
  const totalRooms = rooms.length;

  return (
    <div className={cn("w-full flex flex-col sm:flex-row gap-2 sm:gap-3", className)}>
      {/* Location Picker */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-xs font-semibold text-text-secondary mb-1 px-1">
          <MapPin className="inline h-3 w-3 mr-1 text-accent" />
          Location
        </label>
        <Select onValueChange={handleLocationChange} defaultValue={initialLocation}>
          <SelectTrigger
            className="w-full h-12 bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm"
            aria-label="Select a location"
          >
            <SelectValue placeholder="Where to?" className="text-text-secondary" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-lg">
            {locations.map((location) => (
              <SelectItem
                key={location.value}
                value={location.value}
                className="py-2 hover:bg-primary/10 focus:bg-primary/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-text-primary">{location.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Date Picker */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-xs font-semibold text-text-secondary mb-1 px-1">
          <CalendarIcon className="inline h-3 w-3 mr-1 text-accent" />
          Dates
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 justify-start text-left bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm",
                !date && "text-text-secondary"
              )}
              aria-label="Select travel dates"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
              <div className="flex-1 truncate">
                {date?.from ? (
                  date.to ? (
                    <span className="text-sm font-semibold text-text-primary">
                      {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-text-primary">
                      {format(date.from, "MMM dd, yyyy")}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-text-secondary">Add dates</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-xl" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Guest Picker */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-xs font-semibold text-text-secondary mb-1 px-1">
          <Users className="inline h-3 w-3 mr-1 text-accent" />
          Guests
        </label>
        <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 justify-start text-left bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm"
              aria-label="Select number of guests and rooms"
            >
              <Users className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-sm font-semibold text-text-primary">
                  {totalAdults + totalChildren} guest{totalAdults + totalChildren !== 1 ? "s" : ""}, {totalRooms} room{totalRooms !== 1 ? "s" : ""}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full sm:w-96 p-0 rounded-xl border-border shadow-xl"
            align="start"
            sideOffset={8}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Guests & Rooms</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGuestPopoverOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full"
                  aria-label="Close guest picker"
                >
                  <X className="h-4 w-4 text-text-secondary" />
                </Button>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {rooms.map((room, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-primary/5 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-text-primary">Room {index + 1}</h4>
                        {rooms.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRoom(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                            aria-label={`Remove room ${index + 1}`}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-text-primary">Adults</p>
                          <p className="text-xs text-text-secondary">Ages 18+</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdultsChange(index, -1)}
                            disabled={room.adults <= 1}
                            className="h-8 w-8 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                            aria-label={`Decrease adults for room ${index + 1}`}
                          >
                            <Minus className="h-3 w-3 text-text-primary" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold text-text-primary">{room.adults}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdultsChange(index, 1)}
                            className="h-8 w-8 p-0 rounded-full border-border hover:bg-primary/10"
                            aria-label={`Increase adults for room ${index + 1}`}
                          >
                            <Plus className="h-3 w-3 text-text-primary" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-text-primary">Children</p>
                          <p className="text-xs text-text-secondary">Ages 0–17</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChildrenChange(index, -1)}
                            disabled={room.children <= 0}
                            className="h-8 w-8 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                            aria-label={`Decrease children for room ${index + 1}`}
                          >
                            <Minus className="h-3 w-3 text-text-primary" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold text-text-primary">{room.children}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChildrenChange(index, 1)}
                            className="h-8 w-8 p-0 rounded-full border-border hover:bg-primary/10"
                            aria-label={`Increase children for room ${index + 1}`}
                          >
                            <Plus className="h-3 w-3 text-text-primary" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {rooms.length < 8 && (
                <motion.div
                  className="mt-4 pt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleAddRoom}
                    className="w-full h-10 border-dashed border-border hover:bg-primary/10 text-text-secondary hover:text-primary text-sm rounded-lg"
                    aria-label="Add another room"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add another room
                  </Button>
                </motion.div>
              )}
              <motion.div
                className="mt-4 pt-4 border-t border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  onClick={handleDoneClick}
                  className="w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all"
                  aria-label="Confirm guest selection"
                >
                  Done
                </Button>
              </motion.div>
            </motion.div>
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Search Button */}
      <motion.div
        className="flex-1 min-w-0 sm:w-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="default"
          className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mt-5"
          onClick={handleSearch}
          aria-label="Search homestays"
        >
          Search Homestays
        </Button>
      </motion.div>
    </div>
  );
}