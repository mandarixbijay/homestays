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
  isAuthenticated: boolean; // Added isAuthenticated prop
}

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

  return (
    <div className="w-full max-w-full bg-card rounded-lg border border-border p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-foreground mb-6 font-manrope">Who’s Checking In?</h2>
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
            className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.firstName ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
            }`}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            disabled={isAuthenticated} // Disable if authenticated
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
            className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.lastName ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
            }`}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            disabled={isAuthenticated} // Disable if authenticated
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
          className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${
            errors.email ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
          }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isAuthenticated} // Disable if authenticated
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
            disabled={isAuthenticated} // Disable if authenticated
          >
            <SelectTrigger
              id="countryRegion"
              className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.countryRegion ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
              }`}
            >
              <SelectValue placeholder="Select country/region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nepal +977">Nepal +977</SelectItem>
              <SelectItem value="USA +1">USA +1</SelectItem>
              <SelectItem value="India +91">India +91</SelectItem>
              <SelectItem value="UK +44">UK +44</SelectItem>
              {/* Add more options as needed */}
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
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="e.g., +977 123 456 7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={`w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.phoneNumber ? "border-destructive focus:ring-destructive focus:border-destructive" : ""
            }`}
            aria-invalid={!!errors.phoneNumber}
            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
            disabled={isAuthenticated} // Disable if authenticated
          />
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
          placeholder="e.g., Wheelchair-accessible room, early check-in"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full rounded-md border-border text-base focus:ring-2 focus:ring-primary focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}