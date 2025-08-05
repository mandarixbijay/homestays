"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, X, Plus, Minus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define locations array sorted alphabetically by label
const locations = [
  { value: "all", label: "All Locations" },
  { value: "bardiya", label: "Bardiya, Nepal" },
  { value: "bhaktapur", label: "Bhaktapur, Nepal" },
  { value: "biratnagar", label: "Biratnagar, Nepal" },
  { value: "chitwan", label: "Chitwan, Nepal" },
  { value: "dharan", label: "Dharan, Nepal" },
  { value: "ghandruk", label: "Ghandruk, Nepal" },
  { value: "kathmandu", label: "Kathmandu, Nepal" },
  { value: "lalitpur", label: "Lalitpur, Nepal" },
  { value: "lumbini", label: "Lumbini, Nepal" },
  { value: "pokhara", label: "Pokhara, Nepal" },
  { value: "syangja", label: "Syangja, Nepal" },
  { value: "thori", label: "Thori, Nepal" },
];

// Rest of the component remains unchanged
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
  // Separate states for check-in and check-out
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(initialDate?.from);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(initialDate?.to);
  const [rooms, setRooms] = useState<Room[]>(initialRooms || [{ adults: 2, children: 0 }]);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [location, setLocation] = useState<string>(initialLocation || "all");

  // Initialize state when props change
  useEffect(() => {
    if (initialLocation !== undefined) {
      setLocation(initialLocation || "all");
    }
    if (initialDate !== undefined) {
      setCheckInDate(initialDate?.from);
      setCheckOutDate(initialDate?.to);
    }
    if (initialRooms !== undefined) {
      setRooms(initialRooms);
    }
  }, [initialLocation, initialDate, initialRooms]);

  // Handle check-in date selection
  const handleCheckInSelect = useCallback((date: Date | undefined) => {
    setCheckInDate(date);
    setIsCheckInOpen(false);

    // Auto-adjust check-out if it's before or same as check-in
    if (date && checkOutDate && (isBefore(checkOutDate, date) || checkOutDate.toDateString() === date.toDateString())) {
      setCheckOutDate(addDays(date, 1));
    }

    // Auto-open check-out picker if check-in is selected but check-out isn't
    if (date && !checkOutDate) {
      setTimeout(() => setIsCheckOutOpen(true), 100);
    }
  }, [checkOutDate]);

  // Handle check-out date selection
  const handleCheckOutSelect = useCallback((date: Date | undefined) => {
    setCheckOutDate(date);
    setIsCheckOutOpen(false);
  }, []);

  // Room management functions
  const handleAdultsChange = useCallback((index: number, delta: number) => {
    setRooms(prevRooms =>
      prevRooms.map((room, i) =>
        i === index
          ? { ...room, adults: Math.max(1, Math.min(10, room.adults + delta)) }
          : room
      )
    );
  }, []);

  const handleChildrenChange = useCallback((index: number, delta: number) => {
    setRooms(prevRooms =>
      prevRooms.map((room, i) =>
        i === index
          ? { ...room, children: Math.max(0, Math.min(8, room.children + delta)) }
          : room
      )
    );
  }, []);

  const handleAddRoom = useCallback(() => {
    if (rooms.length < 8) {
      setRooms(prevRooms => [...prevRooms, { adults: 1, children: 0 }]);
    }
  }, [rooms.length]);

  const handleRemoveRoom = useCallback((index: number) => {
    if (rooms.length > 1) {
      setRooms(prevRooms => prevRooms.filter((_, i) => i !== index));
    }
  }, [rooms.length]);

  const handleLocationChange = useCallback((value: string) => {
    setLocation(value);
    onSelectLocation?.(value);
  }, [onSelectLocation]);

  // Search handler with validation
  const handleSearch = useCallback(() => {
    if (!checkInDate) {
      setIsCheckInOpen(true);
      return;
    }

    if (!checkOutDate) {
      setIsCheckOutOpen(true);
      return;
    }

    if (rooms.length === 0) {
      setIsGuestPopoverOpen(true);
      return;
    }

    // Create date range object
    const dateRange: DateRange = {
      from: checkInDate,
      to: checkOutDate
    };

    // Send location as null if "All Locations" is selected
    const searchLocation = location === "all" ? null : location;

    onSearch?.({
      location: searchLocation,
      date: dateRange,
      rooms
    });
  }, [checkInDate, checkOutDate, location, rooms, onSearch]);

  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
  const totalRooms = rooms.length;

  const today = new Date();

  return (
    <div className={cn("w-full flex flex-col sm:flex-row gap-1.5 sm:gap-2", className)}>
      {/* Location Picker */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-xs font-semibold text-muted-foreground mb-1 px-1">
          <MapPin className="inline h-3 w-3 mr-1 text-accent" />
          Location
        </label>
        <Select value={location} onValueChange={handleLocationChange} defaultValue="all">
          <SelectTrigger
            className="w-full h-10 sm:h-11 bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm"
            aria-label="Select a location"
          >
            <SelectValue placeholder="Where to?" className="text-muted-foreground" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-lg">
            {locations.map((locationOption) => (
              <SelectItem
                key={locationOption.value}
                value={locationOption.value}
                className="py-2 hover:bg-primary/10 focus:bg-primary/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    {locationOption.label}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Check-in Date */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-xs font-semibold text-muted-foreground mb-1 px-1">
          <CalendarIcon className="inline h-3 w-3 mr-1 text-accent" />
          Check-in
        </label>
        <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 sm:h-11 justify-start text-left bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm",
                !checkInDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
              <div className="flex-1 truncate">
                {checkInDate ? (
                  <span className="text-sm font-semibold text-foreground">
                    {format(checkInDate, "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Select date</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-xl" align="start">
            <Calendar
              mode="single"
              selected={checkInDate}
              onSelect={handleCheckInSelect}
              disabled={{ before: today }}
              initialFocus
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Check-out Date */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-xs font-semibold text-muted-foreground mb-1 px-1">
          <CalendarIcon className="inline h-3 w-3 mr-1 text-accent" />
          Check-out
        </label>
        <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 sm:h-11 justify-start text-left bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm",
                !checkOutDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
              <div className="flex-1 truncate">
                {checkOutDate ? (
                  <span className="text-sm font-semibold text-foreground">
                    {format(checkOutDate, "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Select date</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl border-border shadow-xl" align="start">
            <Calendar
              mode="single"
              selected={checkOutDate}
              onSelect={handleCheckOutSelect}
              disabled={{
                before: checkInDate ? addDays(checkInDate, 1) : addDays(today, 1)
              }}
              initialFocus
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
        transition={{ delay: 0.4 }}
      >
        <label className="block text-xs font-semibold text-muted-foreground mb-1 px-1">
          <Users className="inline h-3 w-3 mr-1 text-accent" />
          Guests
        </label>
        <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-10 sm:h-11 justify-start text-left bg-background border border-border rounded-xl hover:border-primary focus:border-accent focus:ring-2 focus:ring-accent/50 text-sm font-medium shadow-sm"
            >
              <Users className="mr-2 h-4 w-4 text-accent flex-shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-sm font-semibold text-foreground">
                  {totalAdults + totalChildren} guest{totalAdults + totalChildren !== 1 ? "s" : ""}, {totalRooms} room{totalRooms !== 1 ? "s" : ""}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-80 p-0 rounded-xl border-border shadow-xl" align="start" sideOffset={8}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-foreground">Guests & Rooms</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGuestPopoverOpen(false)}
                  className="h-7 w-7 p-0 hover:bg-primary/10 rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {rooms.map((room, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-primary/5 rounded-lg p-3 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-foreground">Room {index + 1}</h4>
                        {rooms.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRoom(index)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 text-xs h-6 px-2"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Adults */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">Adults</p>
                          <p className="text-xs text-muted-foreground">Ages 18+</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdultsChange(index, -1)}
                            disabled={room.adults <= 1}
                            className="h-7 w-7 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3 text-foreground" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold text-foreground">{room.adults}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdultsChange(index, 1)}
                            disabled={room.adults >= 10}
                            className="h-7 w-7 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3 text-foreground" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">Children</p>
                          <p className="text-xs text-muted-foreground">Ages 0–17</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChildrenChange(index, -1)}
                            disabled={room.children <= 0}
                            className="h-7 w-7 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3 text-foreground" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold text-foreground">{room.children}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChildrenChange(index, 1)}
                            disabled={room.children >= 8}
                            className="h-7 w-7 p-0 rounded-full border-border hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3 text-foreground" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Room Button */}
              {rooms.length < 8 && (
                <motion.div
                  className="mt-3 pt-3 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleAddRoom}
                    className="w-full h-9 border-dashed border-border hover:bg-primary/10 text-muted-foreground hover:text-primary text-sm rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add another room
                  </Button>
                </motion.div>
              )}

              {/* Done Button */}
              <motion.div
                className="mt-3 pt-3 border-t border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => setIsGuestPopoverOpen(false)}
                  className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all"
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
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="default"
          className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all mt-4 sm:mt-5"
          onClick={handleSearch}
        >
          Search Homestays
        </Button>
      </motion.div>
    </div>
  );
}