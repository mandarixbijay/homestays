"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

interface LocationSuggestion {
  location: string;
  homestayCount: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search location...",
  className,
}: LocationAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch location suggestions from the new search API
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      // Only search when we have at least 2 characters
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/bookings/locations/search?query=${encodeURIComponent(debouncedQuery)}&limit=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {value || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>No location found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((item, index) => (
                  <CommandItem
                    key={`${item.location}-${index}`}
                    value={item.location}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setSearchQuery(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.location ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <MapPin className="mr-2 h-4 w-4 opacity-50" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{item.location}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.homestayCount} homestay{item.homestayCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
