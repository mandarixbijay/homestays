"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingFormProps {
  bedType: string;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  countryRegion: string;
  setCountryRegion: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  errors: { [key: string]: string };
  selectedRooms: any[];
  isAuthenticated: boolean;
}

const countries = [
  { name: "Nepal", code: "+977" },
  { name: "United States", code: "+1" },
  { name: "Canada", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "India", code: "+91" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Japan", code: "+81" },
  { name: "South Korea", code: "+82" },
  { name: "China", code: "+86" },
  { name: "Singapore", code: "+65" },
  { name: "Malaysia", code: "+60" },
  { name: "Thailand", code: "+66" },
  { name: "Philippines", code: "+63" },
  { name: "Indonesia", code: "+62" },
  { name: "Vietnam", code: "+84" },
  { name: "Bangladesh", code: "+880" },
  { name: "Pakistan", code: "+92" },
  { name: "Sri Lanka", code: "+94" },
  { name: "Maldives", code: "+960" },
  { name: "Bhutan", code: "+975" },
  { name: "Myanmar", code: "+95" },
  { name: "Italy", code: "+39" },
  { name: "Spain", code: "+34" },
  { name: "Netherlands", code: "+31" },
  { name: "Switzerland", code: "+41" },
  { name: "Austria", code: "+43" },
  { name: "Belgium", code: "+32" },
  { name: "Sweden", code: "+46" },
  { name: "Norway", code: "+47" },
  { name: "Denmark", code: "+45" },
  { name: "Finland", code: "+358" },
  { name: "Russia", code: "+7" },
  { name: "Brazil", code: "+55" },
  { name: "Argentina", code: "+54" },
  { name: "Mexico", code: "+52" },
  { name: "South Africa", code: "+27" },
  { name: "Egypt", code: "+20" },
  { name: "Nigeria", code: "+234" },
  { name: "Kenya", code: "+254" },
  { name: "Ghana", code: "+233" },
  { name: "UAE", code: "+971" },
  { name: "Saudi Arabia", code: "+966" },
  { name: "Qatar", code: "+974" },
  { name: "Kuwait", code: "+965" },
  { name: "Israel", code: "+972" },
  { name: "Turkey", code: "+90" },
  { name: "New Zealand", code: "+64" },
  { name: "Fiji", code: "+679" },
];

export default function BookingForm({
  bedType,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  countryRegion,
  setCountryRegion,
  phoneNumber,
  setPhoneNumber,
  errors,
  selectedRooms,
  isAuthenticated,
}: BookingFormProps) {
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [receiveTexts, setReceiveTexts] = React.useState(false);

  // Get selected country info
  const selectedCountry = countries.find(country =>
    countryRegion.includes(country.name) || countryRegion.includes(country.code)
  );

  // Handle phone number input - only allow digits and basic formatting
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any non-digit characters except spaces and dashes for formatting
    const cleanedValue = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(cleanedValue);
  };

  // Generate placeholder based on selected country
  const getPhoneNumberPlaceholder = () => {
    if (!selectedCountry) return "e.g., 123 456 7890";

    switch (selectedCountry.code) {
      case "+977": // Nepal
        return "e.g., 98 1234 5678";
      case "+1": // US/Canada
        return "e.g., 555 123 4567";
      case "+44": // UK
        return "e.g., 7700 123456";
      case "+91": // India
        return "e.g., 98765 43210";
      case "+61": // Australia
        return "e.g., 412 345 678";
      case "+81": // Japan
        return "e.g., 90 1234 5678";
      case "+86": // China
        return "e.g., 138 0013 8000";
      case "+65": // Singapore
        return "e.g., 9123 4567";
      default:
        return "e.g., 123 456 7890";
    }
  };

  return (
    <div className="w-full max-w-full bg-card rounded-lg border border-border p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-foreground mb-6 font-manrope">Who&rsquo;s Checking In?</h2>
      <p className="text-sm text-destructive mb-6">
        * Required fields {isAuthenticated ? "(pre-filled from your profile)" : ""}
      </p>

      {/* Room Details */}
      <div className="mb-8">
        {selectedRooms.length > 0 ? (
          selectedRooms.map((room, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-base font-medium text-foreground mb-3 font-manrope">
                Room {index + 1}: {room.roomTitle}, {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}, Non-smoking
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Free Parking
                </p>
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Free WiFi
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground font-manrope">No rooms selected.</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-1 block">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="e.g., John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${errors.firstName ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
              }`}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            disabled={isAuthenticated}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-destructive text-xs mt-1">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-1 block">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="e.g., Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${errors.lastName ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
              }`}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            disabled={isAuthenticated}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-destructive text-xs mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1 block">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., john.smith@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${errors.email ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
            }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isAuthenticated}
        />
        {errors.email && (
          <p id="email-error" className="text-destructive text-xs mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="countryRegion" className="text-sm font-medium text-foreground mb-1 block">
            Country/Region <span className="text-destructive">*</span>
          </Label>
          <Select
            value={countryRegion}
            onValueChange={setCountryRegion}
            aria-invalid={!!errors.countryRegion}
            aria-describedby={errors.countryRegion ? "countryRegion-error" : undefined}
            disabled={isAuthenticated}
          >
            <SelectTrigger
              id="countryRegion"
              className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${errors.countryRegion ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
                }`}
            >
              <SelectValue placeholder="Select country/region" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <SelectItem key={country.name} value={`${country.name} ${country.code}`}>
                  {country.name} {country.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryRegion && (
            <p id="countryRegion-error" className="text-destructive text-xs mt-1">
              {errors.countryRegion}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground mb-1 block">
            Phone Number <span className="text-destructive">*</span>
            {selectedCountry && (
              <span className="text-xs text-muted-foreground ml-1">
                ({selectedCountry.code})
              </span>
            )}
          </Label>
          <div className="relative">
            {selectedCountry && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {selectedCountry.code}
              </div>
            )}
            <Input
              id="phoneNumber"
              type="tel"
              placeholder={getPhoneNumberPlaceholder()}
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${selectedCountry ? "pl-16" : ""
                } ${errors.phoneNumber ? "border-destructive focus:ring-destructive focus:border-destructive" : ""}`}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
              disabled={isAuthenticated}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your phone number without the country code
          </p>
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="text-destructive text-xs mt-1">
              {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="receiveTexts"
          checked={receiveTexts}
          onChange={(e) => setReceiveTexts(e.target.checked)}
          className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
          aria-label="Receive text alerts"
        />
        <Label
          htmlFor="receiveTexts"
          className="ml-2 text-sm text-muted-foreground cursor-pointer"
        >
          Receive text alerts about this trip. Message and data rates may apply.
        </Label>
      </div>

      <div className="mb-6">
        <Label
          htmlFor="specialRequests"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          Special/Accessibility Requests (Optional)
        </Label>
        <Textarea
          id="specialRequests"
          rows={4}
          placeholder="e.g., Wheelchair-accessible room, early check-in, vegetarian meals"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}