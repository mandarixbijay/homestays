"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Clock, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Step7FormData {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: {
    flexible: {
      enabled: boolean;
      hoursBeforeCheckIn?: number;
      description: string;
    };
    standard: {
      enabled: boolean;
      hoursBeforeCheckIn?: number;
      description: string;
    };
  };
  refundPolicy: {
    description: string;
    fullRefund?: {
      percentage: number;
      hoursBeforeCancellation: number;
    };
    noRefundHoursBeforeCancellation?: number;
  };
  petPolicy: {
    type: "allowed" | "not-allowed" | "restricted";
    description: string;
  };
  smokingPolicy?: {
    enabled: boolean;
    allowed?: boolean;
    description?: string;
  };
  noisePolicy?: {
    enabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    description?: string;
  };
  guestPolicy?: {
    enabled: boolean;
    description?: string;
  };
  safetyRules?: {
    enabled: boolean;
    description?: string;
  };
}

export function Step7Rules() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<Step7FormData>();
  const { toast } = useToast();

  // Watch form fields
  const checkInTime = watch("checkInTime");
  const checkOutTime = watch("checkOutTime");
  const cancellationFlexibleEnabled = watch("cancellationPolicy.flexible.enabled");
  const cancellationStandardEnabled = watch("cancellationPolicy.standard.enabled");
  const refundPolicy = watch("refundPolicy");
  const petPolicyType = watch("petPolicy.type");
  const smokingPolicyEnabled = watch("smokingPolicy.enabled");
  const noisePolicyEnabled = watch("noisePolicy.enabled");
  const guestPolicyEnabled = watch("guestPolicy.enabled");
  const safetyRulesEnabled = watch("safetyRules.enabled");

  // Initialize form defaults
  useEffect(() => {
    if (!watch("checkInTime")) setValue("checkInTime", "02:00 PM");
    if (!watch("checkOutTime")) setValue("checkOutTime", "11:00 AM");
    if (!watch("cancellationPolicy.flexible.enabled"))
      setValue("cancellationPolicy.flexible", { enabled: false, description: "" });
    if (!watch("cancellationPolicy.standard.enabled"))
      setValue("cancellationPolicy.standard", {
        enabled: false,
        hoursBeforeCheckIn: 24,
        description: "",
      });
    if (!watch("petPolicy.type")) setValue("petPolicy.type", "not-allowed");
    if (watch("smokingPolicy") === undefined)
      setValue("smokingPolicy", { enabled: false });
    if (watch("noisePolicy") === undefined)
      setValue("noisePolicy", { enabled: false });
    if (watch("guestPolicy") === undefined)
      setValue("guestPolicy", { enabled: false });
    if (watch("safetyRules") === undefined)
      setValue("safetyRules", { enabled: false });
  }, [setValue, watch]);

  // Validate time format (HH:MM AM/PM)
  const validateTime = (value: string | undefined) => {
    if (!value) return "Invalid time format (e.g., 01:00 PM)";
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    return timeRegex.test(value) || "Invalid time format (e.g., 01:00 PM)";
  };

  // Handle time input change with formatting
  const handleTimeChange = (
    field: "checkInTime" | "checkOutTime" | "noisePolicy.quietHoursStart" | "noisePolicy.quietHoursEnd",
    value: string
  ) => {
    setValue(field, value.toUpperCase(), { shouldValidate: true });
    trigger(field);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Property Rules
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Define rules and policies for your homestay to ensure a smooth guest
          experience.
        </p>
        <div className="space-y-8">
          {/* Check-In and Check-Out Times */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Check-In and Check-Out
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Check-In Time
                </Label>
                <Input
                  id="checkInTime"
                  value={checkInTime || ""}
                  placeholder="e.g., 02:00 PM"
                  className="mt-1 rounded-md h-10 text-sm"
                  {...register("checkInTime", {
                    required: "Check-in time is required",
                    validate: validateTime,
                    onChange: (e) => handleTimeChange("checkInTime", e.target.value),
                  })}
                />
                {errors.checkInTime && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                    <Info className="h-4 w-4" />
                    {errors.checkInTime.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="checkOutTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Check-Out Time
                </Label>
                <Input
                  id="checkOutTime"
                  value={checkOutTime || ""}
                  placeholder="e.g., 11:00 AM"
                  className="mt-1 rounded-md h-10 text-sm"
                  {...register("checkOutTime", {
                    required: "Check-out time is required",
                    validate: validateTime,
                    onChange: (e) => handleTimeChange("checkOutTime", e.target.value),
                  })}
                />
                {errors.checkOutTime && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                    <Info className="h-4 w-4" />
                    {errors.checkOutTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancellation Policy
            </h3>
            <p className="text-sm text-gray-500">
              Specify when guests can cancel their booking before check-in.
              Select at least one policy.
            </p>
            <div className="space-y-4">
              {/* Flexible Policy */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="flexiblePolicy"
                    checked={cancellationFlexibleEnabled}
                    onCheckedChange={(checked) => {
                      setValue(
                        "cancellationPolicy.flexible",
                        {
                          enabled: !!checked,
                          hoursBeforeCheckIn: checked ? 48 : undefined,
                          description: "",
                        },
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <Label htmlFor="flexiblePolicy" className="text-sm font-medium flex items-center gap-1">
                    Flexible Policy
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Allows cancellations closer to check-in, e.g., up to 48 hours before.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                {cancellationFlexibleEnabled && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="flexibleHours" className="text-sm whitespace-nowrap">
                        Can cancel up to
                      </Label>
                      <Input
                        id="flexibleHours"
                        type="number"
                        min="0"
                        placeholder="e.g., 48"
                        className="w-20 h-10 text-sm"
                        {...register("cancellationPolicy.flexible.hoursBeforeCheckIn", {
                          required: cancellationFlexibleEnabled ? "Hours are required" : false,
                          valueAsNumber: true,
                        })}
                      />
                      <span className="text-sm">hours before check-in</span>
                    </div>
                    {errors.cancellationPolicy?.flexible?.hoursBeforeCheckIn && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                        <Info className="h-4 w-4" />
                        {errors.cancellationPolicy.flexible.hoursBeforeCheckIn.message}
                      </p>
                    )}
                    <div>
                      <Label htmlFor="flexibleDescription">Description</Label>
                      <Textarea
                        id="flexibleDescription"
                        placeholder="e.g., Guests can cancel up to 48 hours before check-in for a full refund."
                        className="mt-1 rounded-md min-h-[80px] text-sm"
                        {...register("cancellationPolicy.flexible.description", {
                          required: cancellationFlexibleEnabled ? "Description is required" : false,
                          minLength: cancellationFlexibleEnabled ? {
                            value: 10,
                            message: "Description must be at least 10 characters",
                          } : undefined,
                          maxLength: {
                            value: 500,
                            message: "Description cannot exceed 500 characters",
                          },
                        })}
                      />
                      {errors.cancellationPolicy?.flexible?.description && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <Info className="h-4 w-4" />
                          {errors.cancellationPolicy.flexible.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Standard Policy */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="standardPolicy"
                    checked={cancellationStandardEnabled}
                    onCheckedChange={(checked) => {
                      setValue(
                        "cancellationPolicy.standard",
                        {
                          enabled: !!checked,
                          hoursBeforeCheckIn: checked ? 24 : undefined,
                          description: "",
                        },
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <Label htmlFor="standardPolicy" className="text-sm font-medium flex items-center gap-1">
                    Standard Policy
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Requires cancellations further in advance, e.g., at least 24 hours before check-in.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                {cancellationStandardEnabled && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="standardHours" className="text-sm whitespace-nowrap">
                        Can cancel up to
                      </Label>
                      <Input
                        id="standardHours"
                        type="number"
                        min="0"
                        defaultValue={24}
                        className="w-20 h-10 text-sm"
                        {...register("cancellationPolicy.standard.hoursBeforeCheckIn", {
                          required: cancellationStandardEnabled ? "Hours are required" : false,
                          valueAsNumber: true,
                        })}
                      />
                      <span className="text-sm">hours before check-in</span>
                    </div>
                    {errors.cancellationPolicy?.standard?.hoursBeforeCheckIn && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                        <Info className="h-4 w-4" />
                        {errors.cancellationPolicy.standard.hoursBeforeCheckIn.message}
                      </p>
                    )}
                    <div>
                      <Label htmlFor="standardDescription">Description</Label>
                      <Textarea
                        id="standardDescription"
                        placeholder="e.g., Guests can cancel up to 24 hours before check-in for a full refund, subject to a service fee."
                        className="mt-1 rounded-md min-h-[80px] text-sm"
                        {...register("cancellationPolicy.standard.description", {
                          required: cancellationStandardEnabled ? "Description is required" : false,
                          minLength: cancellationStandardEnabled ? {
                            value: 10,
                            message: "Description must be at least 10 characters",
                          } : undefined,
                          maxLength: {
                            value: 500,
                            message: "Description cannot exceed 500 characters",
                          },
                        })}
                      />
                      {errors.cancellationPolicy?.standard?.description && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <Info className="h-4 w-4" />
                          {errors.cancellationPolicy.standard.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.cancellationPolicy && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
                <Info className="h-4 w-4" />
                At least one cancellation policy must be enabled and fully completed.
              </p>
            )}
          </div>

          {/* Refund Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Refund Policy</h3>
            <p className="text-sm text-gray-500">
              Define refund conditions for cancellations. Provide a general description and optional specific rules.
            </p>
            <div>
              <Label htmlFor="refundDescription">General Description</Label>
              <Textarea
                id="refundDescription"
                placeholder="e.g., Refunds are processed within 72 hours of cancellation..."
                className="mt-1 rounded-md min-h-[80px] text-sm"
                {...register("refundPolicy.description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description cannot exceed 500 characters",
                  },
                })}
              />
              {errors.refundPolicy?.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.refundPolicy.description.message}
                </p>
              )}
            </div>
            <div className="space-y-4">
              {/* Percentage Refund Option */}
              <div className="flex items-center gap-2 flex-wrap">
                <Checkbox
                  id="fullRefund"
                  checked={!!refundPolicy.fullRefund}
                  onCheckedChange={(checked) =>
                    setValue(
                      "refundPolicy.fullRefund",
                      checked ? { percentage: 100, hoursBeforeCancellation: 48 } : undefined,
                      { shouldValidate: true }
                    )
                  }
                />
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="100"
                  className="w-16 h-8 text-sm"
                  disabled={!refundPolicy.fullRefund}
                  {...register("refundPolicy.fullRefund.percentage", {
                    required: refundPolicy.fullRefund ? "Percentage is required" : false,
                    valueAsNumber: true,
                  })}
                />
                <span className="text-sm">% Refund</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="48"
                  className="w-16 h-8 text-sm"
                  disabled={!refundPolicy.fullRefund}
                  {...register("refundPolicy.fullRefund.hoursBeforeCancellation", {
                    required: refundPolicy.fullRefund ? "Hours are required" : false,
                    valueAsNumber: true,
                  })}
                />
                <span className="text-sm">hours before cancellation</span>
              </div>
              {errors.refundPolicy?.fullRefund?.percentage && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.refundPolicy.fullRefund.percentage.message}
                </p>
              )}
              {errors.refundPolicy?.fullRefund?.hoursBeforeCancellation && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.refundPolicy.fullRefund.hoursBeforeCancellation.message}
                </p>
              )}
              {/* No Refund Option */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="noRefund"
                  checked={!!refundPolicy.noRefundHoursBeforeCancellation}
                  onCheckedChange={(checked) =>
                    setValue(
                      "refundPolicy.noRefundHoursBeforeCancellation",
                      checked ? 24 : undefined,
                      { shouldValidate: true }
                    )
                  }
                />
                <Label htmlFor="noRefund" className="text-sm">
                  No Refund
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="24"
                  className="w-16 h-8 text-sm"
                  disabled={!refundPolicy.noRefundHoursBeforeCancellation}
                  {...register("refundPolicy.noRefundHoursBeforeCancellation", {
                    required: refundPolicy.noRefundHoursBeforeCancellation ? "Hours are required" : false,
                    valueAsNumber: true,
                  })}
                />
                <span className="text-sm">hours before cancellation</span>
              </div>
              {errors.refundPolicy?.noRefundHoursBeforeCancellation && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.refundPolicy.noRefundHoursBeforeCancellation.message}
                </p>
              )}
            </div>
          </div>

          {/* Pet Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pet Policy</h3>
            <RadioGroup
              value={petPolicyType}
              onValueChange={(value: "allowed" | "not-allowed" | "restricted") =>
                setValue("petPolicy.type", value, { shouldValidate: true })
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="allowed" id="pet-allowed" />
                <Label htmlFor="pet-allowed">Allowed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-allowed" id="pet-not-allowed" />
                <Label htmlFor="pet-not-allowed">Not Allowed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="restricted" id="pet-restricted" />
                <Label htmlFor="pet-restricted">Allowed with Restrictions</Label>
              </div>
            </RadioGroup>
            {errors.petPolicy?.type && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                <Info className="h-4 w-4" />
                {typeof errors.petPolicy.type === "object" && errors.petPolicy.type !== null
                  ? errors.petPolicy.type.message
                  : String(errors.petPolicy.type)}
              </p>
            )}
            <div>
              <Label htmlFor="petDescription">Description</Label>
              <Textarea
                id="petDescription"
                placeholder="e.g., Small pets under 20 lbs allowed with $50 fee..."
                className="mt-1 rounded-md min-h-[80px] text-sm"
                {...register("petPolicy.description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description cannot exceed 500 characters",
                  },
                })}
              />
              {errors.petPolicy?.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                  <Info className="h-4 w-4" />
                  {errors.petPolicy.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Smoking Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Checkbox
                id="smokingPolicyEnabled"
                checked={smokingPolicyEnabled}
                onCheckedChange={(checked) =>
                  setValue("smokingPolicy", {
                    enabled: !!checked,
                    allowed: checked ? false : undefined,
                    description: checked ? "" : undefined,
                  }, { shouldValidate: true })
                }
              />
              <Label htmlFor="smokingPolicyEnabled">Smoking Policy</Label>
            </h3>
            {smokingPolicyEnabled && (
              <div className="space-y-4 animate-fade-in">
                <RadioGroup
                  value={watch("smokingPolicy.allowed") ? "allowed" : "not-allowed"}
                  onValueChange={(value: string) =>
                    setValue("smokingPolicy.allowed", value === "allowed", { shouldValidate: true })
                  }
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="allowed" id="smoking-allowed" />
                    <Label htmlFor="smoking-allowed">Allowed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-allowed" id="smoking-not-allowed" />
                    <Label htmlFor="smoking-not-allowed">Not Allowed</Label>
                  </div>
                </RadioGroup>
                <div>
                  <Label htmlFor="smokingDescription">Description</Label>
                  <Textarea
                    id="smokingDescription"
                    placeholder="e.g., Smoking allowed in designated outdoor areas only..."
                    className="mt-1 rounded-md min-h-[80px] text-sm"
                    {...register("smokingPolicy.description", {
                      required: smokingPolicyEnabled ? "Description is required" : false,
                      minLength: smokingPolicyEnabled ? {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      } : undefined,
                      maxLength: {
                        value: 500,
                        message: "Description cannot exceed 500 characters",
                      },
                    })}
                  />
                  {errors.smokingPolicy?.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <Info className="h-4 w-4" />
                      {errors.smokingPolicy.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Noise Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Checkbox
                id="noisePolicyEnabled"
                checked={noisePolicyEnabled}
                onCheckedChange={(checked) =>
                  setValue("noisePolicy", {
                    enabled: !!checked,
                    quietHoursStart: checked ? "10:00 PM" : undefined,
                    quietHoursEnd: checked ? "07:00 AM" : undefined,
                    description: checked ? "" : undefined,
                  }, { shouldValidate: true })
                }
              />
              <Label htmlFor="noisePolicyEnabled">Noise Policy</Label>
            </h3>
            {noisePolicyEnabled && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
                    <Input
                      id="quietHoursStart"
                      placeholder="e.g., 10:00 PM"
                      className="mt-1 rounded-md h-10 text-sm"
                      {...register("noisePolicy.quietHoursStart", {
                        required: noisePolicyEnabled ? "Start time is required" : false,
                        validate: noisePolicyEnabled ? validateTime : undefined,
                        onChange: (e) => handleTimeChange("noisePolicy.quietHoursStart", e.target.value),
                      })}
                    />
                    {errors.noisePolicy?.quietHoursStart && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                        <Info className="h-4 w-4" />
                        {errors.noisePolicy.quietHoursStart.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
                    <Input
                      id="quietHoursEnd"
                      placeholder="e.g., 07:00 AM"
                      className="mt-1 rounded-md h-10 text-sm"
                      {...register("noisePolicy.quietHoursEnd", {
                        required: noisePolicyEnabled ? "End time is required" : false,
                        validate: noisePolicyEnabled ? validateTime : undefined,
                        onChange: (e) => handleTimeChange("noisePolicy.quietHoursEnd", e.target.value),
                      })}
                    />
                    {errors.noisePolicy?.quietHoursEnd && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                        <Info className="h-4 w-4" />
                        {errors.noisePolicy.quietHoursEnd.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="noiseDescription">Description</Label>
                  <Textarea
                    id="noiseDescription"
                    placeholder="e.g., No loud music after 10 PM..."
                    className="mt-1 rounded-md min-h-[80px] text-sm"
                    {...register("noisePolicy.description", {
                      required: noisePolicyEnabled ? "Description is required" : false,
                      minLength: noisePolicyEnabled ? {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      } : undefined,
                      maxLength: {
                        value: 500,
                        message: "Description cannot exceed 500 characters",
                      },
                    })}
                  />
                  {errors.noisePolicy?.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <Info className="h-4 w-4" />
                      {errors.noisePolicy.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guest Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Checkbox
                id="guestPolicyEnabled"
                checked={guestPolicyEnabled}
                onCheckedChange={(checked) =>
                  setValue("guestPolicy", {
                    enabled: !!checked,
                    description: checked ? "" : undefined,
                  }, { shouldValidate: true })
                }
              />
              <Label htmlFor="guestPolicyEnabled">Guest Policy</Label>
            </h3>
            {guestPolicyEnabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="guestDescription">Description</Label>
                  <Textarea
                    id="guestDescription"
                    placeholder="e.g., Visitors must register at check-in..."
                    className="mt-1 rounded-md min-h-[80px] text-sm"
                    {...register("guestPolicy.description", {
                      required: guestPolicyEnabled ? "Description is required" : false,
                      minLength: guestPolicyEnabled ? {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      } : undefined,
                      maxLength: {
                        value: 500,
                        message: "Description cannot exceed 500 characters",
                      },
                    })}
                  />
                  {errors.guestPolicy?.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <Info className="h-4 w-4" />
                      {errors.guestPolicy.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Safety Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Checkbox
                id="safetyRulesEnabled"
                checked={safetyRulesEnabled}
                onCheckedChange={(checked) =>
                  setValue("safetyRules", {
                    enabled: !!checked,
                    description: checked ? "" : undefined,
                  }, { shouldValidate: true })
                }
              />
              <Label htmlFor="safetyRulesEnabled">Safety Rules</Label>
            </h3>
            {safetyRulesEnabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="safetyDescription">Description</Label>
                  <Textarea
                    id="safetyDescription"
                    placeholder="e.g., No open flames; emergency exits clearly marked..."
                    className="mt-1 rounded-md min-h-[80px] text-sm"
                    {...register("safetyRules.description", {
                      required: safetyRulesEnabled ? "Description is required" : false,
                      minLength: safetyRulesEnabled ? {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      } : undefined,
                      maxLength: {
                        value: 500,
                        message: "Description cannot exceed 500 characters",
                      },
                    })}
                  />
                  {errors.safetyRules?.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <Info className="h-4 w-4" />
                      {errors.safetyRules.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}