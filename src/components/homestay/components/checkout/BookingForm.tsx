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
}: BookingFormProps) {
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [receiveTexts, setReceiveTexts] = React.useState(false);

  return (
    <div className="w-full max-w-full bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Who’s Checking In?</h2>
      <p className="text-sm text-red-600 mb-6">* Required fields</p>

      {/* Room Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Room 1: 2 Adults, {bedType}, Non-smoking
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <p className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Free Parking
          </p>
          <p className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Free WiFi
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1 block">
            First Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="e.g., John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.firstName ? "border-red-600 focus:ring-red-600 focus:border-red-600" : ""
            }`}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-red-600 text-xs mt-1">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1 block">
            Last Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="e.g., Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.lastName ? "border-red-600 focus:ring-red-600 focus:border-red-600" : ""
            }`}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-red-600 text-xs mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
          Email Address <span className="text-red-600">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., john.smith@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
            errors.email ? "border-red-600 focus:ring-red-600 focus:border-red-600" : ""
          }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-red-600 text-xs mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="countryRegion" className="text-sm font-medium text-gray-700 mb-1 block">
            Country/Region <span className="text-red-600">*</span>
          </Label>
          <Select
            value={countryRegion}
            onValueChange={setCountryRegion}
            aria-invalid={!!errors.countryRegion}
            aria-describedby={errors.countryRegion ? "countryRegion-error" : undefined}
          >
            <SelectTrigger
              id="countryRegion"
              className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.countryRegion ? "border-red-600 focus:ring-red-600 focus:border-red-600" : ""
              }`}
            >
              <SelectValue placeholder="Select country/region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA +1">USA +1</SelectItem>
              <SelectItem value="Nepal +977">Nepal +977</SelectItem>
              <SelectItem value="India +91">India +91</SelectItem>
              <SelectItem value="UK +44">UK +44</SelectItem>
              {/* Add more options as needed */}
            </SelectContent>
          </Select>
          {errors.countryRegion && (
            <p id="countryRegion-error" className="text-red-600 text-xs mt-1">
              {errors.countryRegion}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-1 block">
            Phone Number <span className="text-red-600">*</span>
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="e.g., +1 123 456 7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.phoneNumber ? "border-red-600 focus:ring-red-600 focus:border-red-600" : ""
            }`}
            aria-invalid={!!errors.phoneNumber}
            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="text-red-600 text-xs mt-1">
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
          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          aria-label="Receive text alerts"
        />
        <Label
          htmlFor="receiveTexts"
          className="ml-2 text-sm text-gray-700 cursor-pointer"
        >
          Receive text alerts about this trip. Message and data rates may apply.
        </Label>
      </div>

      <div className="mb-6">
        <Label
          htmlFor="specialRequests"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Special/Accessibility Requests (Optional)
        </Label>
        <Textarea
          id="specialRequests"
          rows={4}
          placeholder="e.g., Wheelchair-accessible room, early check-in"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}