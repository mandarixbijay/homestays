// src/app/host/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, ChevronLeft } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";
import { PropertyCard } from "@/components/dashboard/PropertyCard";
import Modals from "@/components/dashboard/Modals";
import { StepNavigation } from "@/components/dashboard/StepNavigation";
import { Step1BasicInformation } from "@/components/onboarding/steps/Step1BasicInformation";
import { Step2PropertyDetails } from "@/components/onboarding/steps/Step2PropertyDetails";
import { Facility, Step3Facilities } from "@/components/onboarding/steps/Step3Facilities";
import { Step4RoomInformation } from "@/components/onboarding/steps/Step4RoomInformation/Step4RoomInformation";
import { Step5RoomFacilities } from "@/components/onboarding/steps/Step5RoomFacilities";
import { Step6MealPlan } from "@/components/onboarding/steps/Step6MealPlan";
import { Step7Rules } from "@/components/onboarding/steps/Step7Rules";
import { useDashboardContext } from "@/contexts/DashboardContext";

// Schema (unchanged)
const formSchema = z.object({
  step1: z.object({
    propertyName: z.string().min(3, "Property name must be at least 3 characters"),
    address: z.string().min(1, "Address is required"),
    contactNumber: z.string().regex(/^\+?\d{8,15}$/, "Enter a valid phone number"),
  }),
  step2: z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    images: z.array(
      z.object({
        file: z.custom<File>().nullable(),
        tags: z.array(z.string()),
        url: z.string(),
        base64: z.string().optional(),
        isNew: z.boolean().optional(),
      })
    ).min(1, "At least one image is required"),
  }),
  step3: z.object({
    selectedFacilities: z.array(z.string()).min(1, "At least one facility is required"),
    customFacilities: z.array(z.string()),
  }),
  step4: z.object({
    totalRooms: z.number().min(1, "At least 1 room is required"),
    rooms: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Room name must be at least 2 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        numberOfBeds: z.number().min(1, "At least one bed is required"),
        maxOccupancy: z.object({
          adults: z.number().min(1, "At least one adult is required"),
          children: z.number().min(0, "Cannot be negative"),
        }),
        minOccupancy: z.object({
          adults: z.number().min(0, "Cannot be negative"),
          children: z.number().min(0, "Cannot be negative"),
        }),
        area: z.object({
          value: z.number().min(1, "Area must be positive"),
          unit: z.enum(["sqft", "sqm"]),
        }),
        price: z.object({
          value: z.number().min(1, "Price must be positive"),
          currency: z.enum(["USD", "NPR"]),
        }),
        includesMeals: z.boolean(),
        mainImage: z.string().nullable(),
        images: z.array(
          z.object({
            url: z.string(),
            tags: z.array(z.string()),
            base64: z.string().optional(),
            isNew: z.boolean().optional(),
          })
        ).min(1, "At least one image is required"),
        selectedFacilities: z.array(z.string()),
        customFacilities: z.array(z.string()),
      })
    ),
  }),
  step5: z.object({
    rooms: z.array(
      z.object({
        selectedFacilities: z.array(z.string()),
        customFacilities: z.array(z.string()),
      }).refine(
        (data) => data.selectedFacilities.length > 0 || data.customFacilities.length > 0,
        { message: "At least one facility is required per room" }
      )
    ),
  }),
  step6: z.object({
    mealPlans: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Meal plan name must be at least 3 characters"),
        isSelected: z.boolean(),
        price: z.object({
          value: z.number().min(0, "Price must be non-negative"),
          currency: z.enum(["USD", "NPR"]),
        }),
        pax: z.number().min(1, "At least one guest required").max(10, "Maximum 10 guests"),
        description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
        images: z
          .array(
            z.object({
              url: z.string(),
              base64: z.string().optional(),
              isMain: z.boolean(),
            })
          )
          .optional(),
        isCustom: z.boolean(),
      })
    ),
  }),
  step7: z.object({
    checkInTime: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i, "Invalid time format"),
    checkOutTime: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i, "Invalid time format"),
    cancellationPolicy: z
      .object({
        flexible: z.object({
          enabled: z.boolean(),
          hoursBeforeCheckIn: z.number().min(0, "Hours must be non-negative").optional(),
          description: z.string().max(500, "Description cannot exceed 500 characters"),
        }),
        standard: z.object({
          enabled: z.boolean(),
          hoursBeforeCheckIn: z.number().min(0, "Hours must be non-negative").optional(),
          description: z.string().max(500, "Description cannot exceed 500 characters"),
        }),
      })
      .refine(
        (data) => data.flexible.enabled || data.standard.enabled,
        { message: "At least one cancellation policy must be enabled", path: [] }
      )
      .refine(
        (data) =>
          !data.flexible.enabled ||
          (data.flexible.hoursBeforeCheckIn !== undefined && data.flexible.description.length >= 10),
        {
          message: "Hours and description (min 10 characters) are required for Flexible policy",
          path: ["flexible"],
        }
      )
      .refine(
        (data) =>
          !data.standard.enabled ||
          (data.standard.hoursBeforeCheckIn !== undefined && data.standard.description.length >= 10),
        {
          message: "Hours and description (min 10 characters) are required for Standard policy",
          path: ["standard"],
        }
      ),
    refundPolicy: z.object({
      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description cannot exceed 500 characters"),
      fullRefund: z
        .object({
          percentage: z.number().min(1, "Percentage must be at least 1").max(100, "Percentage cannot exceed 100"),
          hoursBeforeCancellation: z.number().min(0, "Hours must be non-negative"),
        })
        .optional(),
      noRefundHoursBeforeCancellation: z.number().min(0, "Hours must be non-negative").optional(),
    }),
    petPolicy: z.object({
      type: z.enum(["allowed", "not-allowed", "restricted"]),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description cannot exceed 500 characters"),
    }),
    smokingPolicy: z
      .object({
        enabled: z.literal(true),
        allowed: z.boolean(),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(500, "Description cannot exceed 500 characters"),
      })
      .or(z.object({ enabled: z.literal(false) }))
      .optional(),
    noisePolicy: z
      .object({
        enabled: z.literal(true),
        quietHoursStart: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i, "Invalid time format"),
        quietHoursEnd: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i, "Invalid time format"),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(500, "Description cannot exceed 500 characters"),
      })
      .or(z.object({ enabled: z.literal(false) }))
      .optional(),
    guestPolicy: z
      .object({
        enabled: z.literal(true),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(500, "Description cannot exceed 500 characters"),
      })
      .or(z.object({ enabled: z.literal(false) }))
      .optional(),
    safetyRules: z
      .object({
        enabled: z.literal(true),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(500, "Description cannot exceed 500 characters"),
      })
      .or(z.object({ enabled: z.literal(false) }))
      .optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

const defaultRoom = {
  id: crypto.randomUUID(),
  name: "Deluxe Suite",
  description: "Spacious room with mountain view",
  numberOfBeds: 2,
  maxOccupancy: { adults: 2, children: 1 },
  minOccupancy: { adults: 1, children: 0 },
  area: { value: 300, unit: "sqft" as "sqft" | "sqm" },
  price: { value: 100, currency: "USD" as "USD" | "NPR" },
  includesMeals: true,
  mainImage: null,
  images: [
    {
      url: "https://nepalhomestays.com/wp-content/uploads/2024/12/Why-Choose-a-Homestay-in-Nepal-Benefits-of-Staying-with-Local-Hosts.jpg",
      tags: [],
    },
  ],
  selectedFacilities: ["Private Bathroom", "Balcony"],
  customFacilities: ["Coffee Maker"],
};

const mockPropertyData: FormData = {
  step1: {
    propertyName: "Mountain View Homestay",
    address: "Lakeside, Pokhara",
    contactNumber: "+9779841234567",
  },
  step2: {
    description: "A cozy homestay with stunning mountain views and modern amenities.",
    images: [
      {
        file: null,
        tags: [],
        url: "https://nepalhomestays.com/wp-content/uploads/2024/12/Why-Choose-a-Homestay-in-Nepal-Benefits-of-Staying-with-Local-Hosts.jpg",
        base64: undefined,
        isNew: false,
      },
    ],
  },
  step3: {
    selectedFacilities: ["Wi-Fi", "Parking"],
    customFacilities: ["Garden View"],
  },
  step4: {
    totalRooms: 2,
    rooms: [defaultRoom, { ...defaultRoom, id: crypto.randomUUID(), name: "Standard Room" }],
  },
  step5: {
    rooms: [
      { selectedFacilities: ["Private Bathroom", "Balcony"], customFacilities: ["Coffee Maker"] },
      { selectedFacilities: ["TV", "Desk"], customFacilities: ["Wardrobe"] },
    ],
  },
  step6: {
    mealPlans: [
      {
        id: crypto.randomUUID(),
        name: "Breakfast Included",
        isSelected: true,
        price: { value: 10, currency: "USD" },
        pax: 2,
        description: "Continental breakfast",
        images: [],
        isCustom: false,
      },
      {
        id: crypto.randomUUID(),
        name: "No Meals",
        isSelected: true,
        price: { value: 0, currency: "USD" },
        pax: 1,
        description: "",
        images: [],
        isCustom: false,
      },
    ],
  },
  step7: {
    checkInTime: "02:00 PM",
    checkOutTime: "11:00 AM",
    cancellationPolicy: {
      flexible: { enabled: true, hoursBeforeCheckIn: 48, description: "Cancel up to 48 hours before check-in for a full refund." },
      standard: { enabled: false, hoursBeforeCheckIn: 24, description: "" },
    },
    refundPolicy: {
      description: "Refunds processed within 72 hours of cancellation.",
      fullRefund: { percentage: 100, hoursBeforeCancellation: 48 },
      noRefundHoursBeforeCancellation: 24,
    },
    petPolicy: { type: "restricted", description: "Small pets under 20 lbs allowed with $50 fee." },
    smokingPolicy: { enabled: true, allowed: false, description: "No smoking allowed indoors." },
    noisePolicy: { enabled: true, quietHoursStart: "10:00 PM", quietHoursEnd: "07:00 AM", description: "No loud music after 10 PM." },
    guestPolicy: { enabled: true, description: "Visitors must register at check-in." },
    safetyRules: { enabled: true, description: "No open flames; emergency exits marked." },
  },
};

export default function HostDashboard() {
  const { setSelectedMenuItem } = useDashboardContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false); // Start with PropertyCard
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const methods = useForm({ mode: "onChange", resolver: zodResolver(formSchema), defaultValues: mockPropertyData });
  const { handleSubmit, trigger, getValues, reset, setValue } = methods;

  // Initialize sessionId
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedSessionId = localStorage.getItem("onboardingSessionId");
        if (storedSessionId) {
          setSessionId(storedSessionId);
          return;
        }
        const response = await fetch("/api/onboarding/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to start onboarding session");
        const { sessionId: newSessionId } = await response.json();
        setSessionId(newSessionId);
        localStorage.setItem("onboardingSessionId", newSessionId);
        toast({
          title: "Session Started",
          description: "Your onboarding session has been created.",
          className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
        });
      } catch (error) {
        console.error("Error starting session:", error);
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Failed to start onboarding session. Please try again.",
          className: "bg-white text-red-500 border-red-200 border rounded-xl",
        });
      }
    };
    initializeSession();
  }, [toast]);

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem("editedProperty");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        reset({
          ...parsedData,
          step2: { ...parsedData.step2, images: parsedData.step2.images.map((img: any) => ({ ...img, file: null })) },
          step4: {
            ...parsedData.step4,
            rooms: parsedData.step4.rooms.map((room: any) => ({
              ...room,
              images: room.images.map((img: any) => ({ ...img, base64: undefined, isNew: false })),
              mainImage: null,
            })),
          },
          step6: {
            ...parsedData.step6,
            mealPlans: parsedData.step6.mealPlans.map((plan: any) => ({
              ...plan,
              images: plan.images?.map((img: any) => ({ ...img, base64: undefined })) || [],
            })),
          },
        });
        toast({
          title: "Progress Resumed",
          description: "Your previous edits have been loaded.",
          className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
        });
      } catch (error) {
        console.error("Failed to load saved data:", error);
        reset(mockPropertyData);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load previous edits. Starting with default data.",
          className: "bg-white text-red-500 border-red-200 border rounded-xl",
        });
      }
    }
  }, [reset, toast]);

  // Save form data to localStorage on change
  useEffect(() => {
    const subscription = methods.watch((value) => {
      try {
        localStorage.setItem("editedProperty", JSON.stringify({
          ...value,
          step2: { 
            ...value.step2, 
            images: value.step2?.images?.map((img) => ({ ...img, file: null, base64: undefined })) || [] 
          },
          step4: {
            ...value.step4,
            rooms: value.step4?.rooms?.map((room) => ({
              ...room,
              images: room?.images?.map((img) => ({ ...img, base64: undefined })) || [],
              mainImage: null,
            })) || [],
          },
          step6: {
            ...value.step6,
            mealPlans: value.step6?.mealPlans?.map((plan) => ({
              ...plan,
              images: plan?.images?.map((img) => ({ ...img, base64: undefined })) || [],
            })) || [],
          },
        }));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        toast({
          variant: "destructive",
          title: "Storage Error",
          description: "Failed to save progress.",
          className: "bg-white text-red-500 border-red-200 border rounded-xl",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, toast]);

  // Define submitForm callback
  const submitForm = async (fn: () => Promise<void>) => {
    try {
      await fn();
      if (!sessionId) throw new Error("No session ID available");
      const formData = new FormData();
      const values = getValues();
      
      // Append Step 1 data
      formData.append("propertyName", values.step1.propertyName);
      formData.append("propertyAddress", values.step1.address);
      formData.append("contactNumber", values.step1.contactNumber);

      // Submit to API
      const response = await fetch(`/api/onboarding/step1/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit Step 1");
      }

      toast({
        title: "Step 1 Submitted",
        description: "Basic information saved successfully.",
        className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
      });
    } catch (error) {
      console.error("Error submitting Step 1:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit Step 1.",
        className: "bg-white text-red-500 border-red-200 border rounded-xl",
      });
      throw error;
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).filter((file) => file.size <= 5 * 1024 * 1024);
    const currentImages = getValues("step2.images") || [];

    const uniqueFiles = newFiles.filter((file) => {
      const isDuplicate = currentImages.some(
        (img) => img.file && img.file.name === file.name && img.file.size === file.size
      );
      if (isDuplicate) {
        toast({
          variant: "destructive",
          title: "Duplicate Image",
          description: `Image "${file.name}" is already uploaded.`,
          className: "bg-white text-red-500 border-red-200 border rounded-xl",
        });
      }
      return !isDuplicate;
    });

    const imagesToAdd = uniqueFiles.slice(0, 10 - currentImages.length);
    if (uniqueFiles.length > imagesToAdd.length) {
      toast({
        variant: "destructive",
        title: "Upload Limit",
        description: `Maximum 10 images allowed. Only ${imagesToAdd.length} image(s) added.`,
        className: "bg-white text-red-500 border-red-200 border rounded-xl",
      });
    }

    if (imagesToAdd.length > 0) {
      const newImages = await Promise.all(
        imagesToAdd.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            file,
            tags: [],
            url: base64,
            base64,
            isNew: true,
          };
        })
      );

      setValue("step2.images", [...currentImages, ...newImages], { shouldValidate: true });
      toast({
        title: "Images Added",
        description: `${imagesToAdd.length} image(s) added successfully.`,
        className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setValue(
      "step2.images",
      getValues("step2.images").filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    toast({
      title: "Image Removed",
      description: `Image ${index + 1} removed.`,
      className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
    });
  };

  const handleSectionJump = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsEditing(true);
    toast({
      title: "Navigated",
      description: `Moved to ${steps[stepIndex].title}.`,
      className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
    });
  };

  const handleStepComplete = async () => {
    const stepFields: (keyof FormData | string)[][] = [
      ["step1.propertyName", "step1.address", "step1.contactNumber"],
      ["step2.description", "step2.images"],
      ["step3.selectedFacilities"],
      ["step4.totalRooms", `step4.rooms.${currentRoomIndex}.name`, `step4.rooms.${currentRoomIndex}.description`, `step4.rooms.${currentRoomIndex}.images`],
      [`step5.rooms.${currentRoomIndex}.selectedFacilities`],
      ["step6.mealPlans"],
      ["step7.checkInTime", "step7.checkOutTime", "step7.cancellationPolicy", "step7.refundPolicy", "step7.petPolicy"],
    ];

    const isValid = await trigger(
      stepFields[currentStep] as Parameters<typeof trigger>[0],
      { shouldFocus: true }
    );
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        toast({
          title: "Step Saved",
          description: `Proceeding to ${steps[currentStep + 1].title}.`,
          className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
        });
      } else {
        setSaveModalOpen(true);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please complete all required fields.",
        className: "bg-white text-red-500 border-red-200 border rounded-xl",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!sessionId) throw new Error("No session ID available");
      
      // Example: Submit Step 2 data
      const formData = new FormData();
      formData.append("description", data.step2.description);
      data.step2.images.forEach((image, index) => {
        if (image.file && image.isNew) {
          formData.append(`images[${index}]`, image.file);
        }
        formData.append(`imageUrls[${index}]`, image.url);
        image.tags.forEach((tag, tagIndex) => {
          formData.append(`imageTags[${index}][${tagIndex}]`, tag);
        });
      });

      const response = await fetch(`/api/onboarding/step2/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit Step 2");
      }

      localStorage.setItem("editedProperty", JSON.stringify({
        ...data,
        step2: { ...data.step2, images: data.step2.images.map((img) => ({ ...img, file: null, base64: undefined })) },
        step4: {
          ...data.step4,
          rooms: data.step4.rooms.map((room) => ({
            ...room,
            images: room.images.map((img) => ({ ...img, base64: undefined })),
            mainImage: null,
          })),
        },
        step6: {
          ...data.step6,
          mealPlans: data.step6.mealPlans.map((plan) => ({
            ...plan,
            images: plan.images?.map((img) => ({ ...img, base64: undefined })) || [],
          })),
        },
      }));
      setSuccessMessage("Property updated successfully!");
      setSaveModalOpen(false);
      setIsEditing(false); // Return to PropertyCard
      setTimeout(() => setSuccessMessage(""), 3000);
      toast({
        title: "Success",
        description: "Property changes have been saved.",
        className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
      });
    } catch (error) {
      console.error("Failed to save changes:", error);
      setErrorMessage("Failed to save changes. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes. Please try again.",
        className: "bg-white text-red-500 border-red-200 border rounded-xl",
      });
    }
  };

  const handleDiscardChanges = () => {
    reset(mockPropertyData);
    setCurrentStep(0);
    setCurrentRoomIndex(0);
    setDiscardModalOpen(false);
    setIsEditing(false); // Return to PropertyCard
    setSelectedMenuItem("Property");
    localStorage.removeItem("editedProperty");
    localStorage.removeItem("onboardingSessionId");
    setSessionId(null);
    toast({
      title: "Changes Discarded",
      description: "All changes have been reset to original values.",
      className: "bg-white text-teal-500 border-teal-200 border rounded-xl",
    });
  };

  const steps = [
    {
      title: "Basic Information",
      description: "Edit core property details.",
      component: (
        <Step1BasicInformation
          user={null}
          sessionId={sessionId}
          setSessionId={setSessionId}
          step1Data={getValues("step1")}
          isLoadingSession={sessionId === null}
        />
      ),
    },
    {
      title: "Property Details",
      description: "Update images and description.",
      component: (
        <Step2PropertyDetails
          handleImageChange={handleImageChange}
          removeImage={handleRemoveImage}
          sessionId={sessionId}
        />
      ),
    },
    { title: "Facilities", description: "Modify available facilities.", component: <Step3Facilities
      sessionId={sessionId ?? ""}
      onDefaultFacilitiesLoaded={function (facilities: Facility[]): void {
        throw new Error("Function not implemented.");
      }}
      setHasExistingData={() => {}}
    /> },
    {
      title: "Room Information",
      description: "Edit room details.",
      component: (
        <Step4RoomInformation
          onDeleteRoom={(index) => {
            if (getValues("step4.totalRooms") <= 1) {
              setErrorMessage("At least one room is required.");
              setTimeout(() => setErrorMessage(""), 3000);
              return;
            }
            const rooms = getValues("step4.rooms").filter((_, i) => i !== index);
            setValue("step4.totalRooms", rooms.length, { shouldValidate: true });
            setValue(
              "step4.rooms",
              rooms.length > 0 ? rooms : [defaultRoom],
              { shouldValidate: true }
            );
            setValue(
              "step5.rooms",
              rooms.length > 0
                ? rooms.map((room) => ({
                    selectedFacilities: room.selectedFacilities || [],
                    customFacilities: room.customFacilities || [],
                  }))
                : [{ selectedFacilities: [], customFacilities: [] }],
              { shouldValidate: true }
            );
            setCurrentRoomIndex(currentRoomIndex >= rooms.length ? rooms.length - 1 : currentRoomIndex);
            setSuccessMessage(`Room ${index + 1} deleted successfully`);
            setTimeout(() => setSuccessMessage(""), 3000);
          }}
        />
      ),
    },
    {
      title: "Room Facilities",
      description: "Update room-specific facilities.",
      component: (
        <Step5RoomFacilities
          currentRoomIndex={currentRoomIndex}
          setCurrentRoomIndex={setCurrentRoomIndex}
          totalRooms={getValues("step4.totalRooms") || 0}
          roomInfo={getValues("step4.rooms") || []}
        />
      ),
    },
    { title: "Meal Plan", description: "Modify meal plan options.", component: <Step6MealPlan /> },
    { title: "Rules", description: "Update property rules and policies.", component: <Step7Rules /> },
  ];

  const homestayData = {
    images: getValues("step2.images")?.map((img) => img.url) || [
      "https://nepalhomestays.com/wp-content/uploads/2024/12/Why-Choose-a-Homestay-in-Nepal-Benefits-of-Staying-with-Local-Hosts.jpg",
    ],
    name: getValues("step1.propertyName") || "Mountain View Homestay",
    location: getValues("step1.address") || "Lakeside, Pokhara",
    rating: 8.0,
    reviews: 0,
    refundable: getValues("step7.cancellationPolicy.flexible.enabled") || getValues("step7.cancellationPolicy.standard.enabled") || false,
    discount: getValues("step7.cancellationPolicy.flexible.enabled") ? "20% Off" : undefined,
    left: 5,
    vipAccess: false,
    rooms: getValues("step4.rooms")?.map((room) => ({ name: room.name })) || [],
    facilities: [...(getValues("step3.selectedFacilities") || []), ...(getValues("step3.customFacilities") || [])],
    policies: [
      `Check-in: ${getValues("step7.checkInTime") || "N/A"}`,
      `Check-out: ${getValues("step7.checkOutTime") || "N/A"}`,
      getValues("step7.cancellationPolicy.flexible.enabled")
        ? getValues("step7.cancellationPolicy.flexible.description")
        : getValues("step7.cancellationPolicy.standard.description") || "",
      getValues("step7.refundPolicy.description") || "",
      getValues("step7.petPolicy.description") || "",
    ].filter(Boolean),
    description: getValues("step2.description") || "No description available",
    onEdit: () => {
      setIsEditing(true);
      setCurrentStep(0);
      setSelectedMenuItem("Property");
    },
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-20 right-4 bg-white text-teal-500 border-teal-200 border px-4 py-2 rounded-xl z-50 flex items-center gap-2">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 bg-white text-red-500 border-red-200 border px-4 py-2 rounded-xl z-50 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}
      {!isEditing ? (
        <PropertyCard {...homestayData} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSelectedMenuItem("Property");
              }}
              className="rounded-xl h-10 px-4 border-teal-500 text-teal-500 font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Property
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Edit Property: {getValues("step1.propertyName") || "Your Property"}
            </h1>
          </div>
          <p className="text-base text-gray-600">Update your property details below. Navigate through the steps to customize all settings.</p>
          <StepNavigation steps={steps} currentStep={currentStep} handleSectionJump={handleSectionJump} />
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
            <p className="text-sm text-gray-600 mb-6">{steps[currentStep].description}</p>
            <FormProvider {...methods}>
              {steps[currentStep].component}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="rounded-xl h-10 px-4 border-primary text-primary font-semibold"
                >
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDiscardModalOpen(true)}
                    className="rounded-xl h-10 px-4 bg-red-100 text-red-500 font-semibold"
                  >
                    Discard Changes
                  </Button>
                  <Button
                    onClick={handleStepComplete}
                    className="rounded-xl h-10 px-4 bg-teal-500 text-white font-semibold"
                  >
                    {currentStep === steps.length - 1 ? "Save Changes" : "Next"}
                  </Button>
                </div>
              </div>
            </FormProvider>
          </div>
          <Modals
            saveModalOpen={saveModalOpen}
            setSaveModalOpen={setSaveModalOpen}
            discardModalOpen={discardModalOpen}
            setDiscardModalOpen={setDiscardModalOpen}
            onSubmit={handleSubmit(onSubmit)}
            onDiscard={handleDiscardChanges}
          />
        </>
      )}
    </div>
  );
}