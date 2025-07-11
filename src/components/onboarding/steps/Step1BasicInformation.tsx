// src/components/onboarding/steps/Step1BasicInformation.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, MapPin, Phone, Upload, X, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Step1FormData } from "@/app/list-your-property/owner-registration/types";

interface Step1BasicInformationProps {
  user: { name: string; email: string } | null;
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  step1Data: Partial<Step1FormData> | null;
  isLoadingSession: boolean;
}

export function Step1BasicInformation({
  user,
  sessionId,
  setSessionId,
  step1Data,
  isLoadingSession,
}: Step1BasicInformationProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useFormContext<Step1FormData>();
  const { toast } = useToast();
  const memoizedToast = useMemo(() => toast, []); // Stabilize toast
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [citizenshipFrontPreview, setCitizenshipFrontPreview] = useState<string | null>(null);
  const [citizenshipBackPreview, setCitizenshipBackPreview] = useState<string | null>(null);
  const hasFetched = useRef(false); // Prevent multiple fetches

  const documentType = watch("documentType");
  const contactNumberValue = watch("contactNumber");

  // Load initial data only once or when sessionId changes
  useEffect(() => {
    console.log("Step1BasicInformation useEffect triggered with sessionId:", sessionId, "step1Data:", step1Data, "isLoadingSession:", isLoadingSession);
    if (hasFetched.current || !sessionId || isLoadingSession) {
      if (!sessionId || isLoadingSession) {
        reset({
          propertyName: "",
          propertyAddress: "",
          contactNumber: "",
          documentType: undefined,
          idScanFront: undefined,
          idScanBack: undefined,
        });
        hasFetched.current = true; // Prevent further runs if no sessionId
      }
      return;
    }
    hasFetched.current = true;

    const fetchStep1Data = async () => {
      try {
        const response = await fetch(`/api/onboarding/step1/${sessionId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          console.warn(`Failed to fetch Step 1 data: ${response.status}`);
          memoizedToast({
            title: "Session Invalid",
            description: "Starting with fresh data for Step 1.",
          });
          reset({
            propertyName: "",
            propertyAddress: "",
            contactNumber: "",
            documentType: undefined,
            idScanFront: undefined,
            idScanBack: undefined,
          });
        } else {
          const data = await response.json();
          console.log("Fetched Step 1 data:", JSON.stringify(data, null, 2));
          const sanitizedData: Partial<Step1FormData> = {
            propertyName: data.propertyName || "",
            propertyAddress: data.propertyAddress || "",
            contactNumber: data.contactNumber?.startsWith("+")
              ? data.contactNumber
              : `+${data.contactNumber || ""}`,
            documentType: data.documentType || undefined,
            idScanFront: data.idScanFront || undefined,
            idScanBack: data.idScanBack || undefined,
          };
          reset(sanitizedData);
          if (data.idScanFront && typeof data.idScanFront === "string") {
            setPassportPreview(data.idScanFront);
            setCitizenshipFrontPreview(data.idScanFront);
          }
          if (data.idScanBack && typeof data.idScanBack === "string") {
            setCitizenshipBackPreview(data.idScanBack);
          }
          if (Object.keys(data).length > 0) {
            memoizedToast({
              title: "Data Loaded",
              description: "Previous Step 1 data has been loaded.",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching Step 1 data:", error);
        memoizedToast({
          variant: "destructive",
          title: "Fetch Error",
          description: "Failed to load previous data. Starting fresh.",
        });
        reset({
          propertyName: "",
          propertyAddress: "",
          contactNumber: "",
          documentType: undefined,
          idScanFront: undefined,
          idScanBack: undefined,
        });
      }
    };

    if (step1Data && !isLoadingSession) {
      console.log("Loading step1Data:", JSON.stringify(step1Data, null, 2));
      const sanitizedData: Partial<Step1FormData> = {
        propertyName: step1Data.propertyName || "",
        propertyAddress: step1Data.propertyAddress || "",
        contactNumber: step1Data.contactNumber?.startsWith("+")
          ? step1Data.contactNumber
          : `+${step1Data.contactNumber || ""}`,
        documentType: step1Data.documentType || undefined,
        idScanFront: step1Data.idScanFront || undefined,
        idScanBack: step1Data.idScanBack || undefined,
      };
      reset(sanitizedData);
      if (step1Data.idScanFront && typeof step1Data.idScanFront === "string") {
        setPassportPreview(step1Data.idScanFront);
        setCitizenshipFrontPreview(step1Data.idScanFront);
      }
      if (step1Data.idScanBack && typeof step1Data.idScanBack === "string") {
        setCitizenshipBackPreview(step1Data.idScanBack);
      }
      if (Object.keys(step1Data).length > 0) {
        memoizedToast({
          title: "Data Loaded",
          description: "Previous Step 1 data has been loaded.",
        });
      }
    } else {
      fetchStep1Data();
    }
  }, [sessionId, step1Data, isLoadingSession, reset, memoizedToast]);

  const handleContactNumberChange = useCallback(
    (value: string) => {
      const sanitizedValue = value.replace(/[^+\d]/g, "").replace(/(?!^)\+/g, "");
      setValue("contactNumber", sanitizedValue, { shouldValidate: true });
      trigger("contactNumber");
    },
    [setValue, trigger]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, field: "passport" | "citizenshipFront" | "citizenshipBack") => {
      if (typeof window === "undefined") return; // SSR safety
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        memoizedToast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PNG or JPEG image.",
        });
        return;
      }
      if (file.size > maxSize) {
        memoizedToast({
          variant: "destructive",
          title: "File Too Large",
          description: "File size must be less than 5MB.",
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`/api/upload`, { method: "POST", body: formData }); // Hypothetical upload endpoint
        if (!response.ok) throw new Error("Upload failed");
        const { url } = await response.json();
        const previewUrl = URL.createObjectURL(file);
        if (field === "passport" || field === "citizenshipFront") {
          setValue("idScanFront", url, { shouldValidate: true }); // Store URL instead of file
          setPassportPreview(field === "passport" ? previewUrl : null);
          setCitizenshipFrontPreview(field === "citizenshipFront" ? previewUrl : null);
        } else {
          setValue("idScanBack", url, { shouldValidate: true });
          setCitizenshipBackPreview(previewUrl);
        }
        memoizedToast({ title: "File Uploaded", description: "File uploaded successfully." });
      } catch (error) {
        memoizedToast({
          variant: "destructive",
          title: "Upload Error",
          description: "Failed to upload file.",
        });
      }
      e.target.value = ""; // Clear input to allow re-uploading same file
    },
    [setValue, memoizedToast]
  );

  const handleRemoveFile = useCallback(
    (field: "passport" | "citizenshipFront" | "citizenshipBack") => {
      if (field === "passport" || field === "citizenshipFront") {
        setValue("idScanFront", undefined, { shouldValidate: true });
        setPassportPreview(field === "passport" ? null : passportPreview);
        setCitizenshipFrontPreview(field === "citizenshipFront" ? null : citizenshipFrontPreview);
      } else {
        setValue("idScanBack", undefined, { shouldValidate: true });
        setCitizenshipBackPreview(null);
      }
      memoizedToast({
        title: "File Removed",
        description: "Image removed successfully.",
      });
    },
    [setValue, passportPreview, citizenshipFrontPreview, memoizedToast]
  );

  const handleDocumentTypeChange = useCallback(
    (value: string) => {
      setValue("documentType", value as "passport" | "citizenship" | undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setPassportPreview(null);
      setCitizenshipFrontPreview(null);
      setCitizenshipBackPreview(null);
      setValue("idScanFront", undefined, { shouldValidate: true });
      setValue("idScanBack", undefined, { shouldValidate: true });
      trigger(["idScanFront", "idScanBack"]);
    },
    [setValue, trigger]
  );

  if (isLoadingSession) {
    return <div className="text-center">Loading session...</div>;
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      <div className="card">
        <Label
          htmlFor="property-name"
          className="text-base font-semibold text-foreground flex items-center gap-2"
        >
          <Home className="h-4 w-4 text-muted-foreground" />
          Property Name
        </Label>
        <Input
          id="property-name"
          {...register("propertyName")}
          placeholder="e.g., Cozy Homestay"
          className="input-field mt-3"
          onChange={(e) => {
            setValue("propertyName", e.target.value, { shouldValidate: true });
            trigger("propertyName");
          }}
        />
        {errors.propertyName && (
          <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
            <Info className="h-4 w-4" />
            {errors.propertyName.message}
          </p>
        )}
      </div>

      <div className="card">
        <Label
          htmlFor="address"
          className="text-base font-semibold text-foreground flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Address
        </Label>
        <Input
          id="address"
          {...register("propertyAddress")}
          placeholder="e.g., 123 Main St, Kathmandu, Nepal"
          className="input-field mt-3"
          onChange={(e) => {
            setValue("propertyAddress", e.target.value, { shouldValidate: true });
            trigger("propertyAddress");
          }}
        />
        {errors.propertyAddress && (
          <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
            <Info className="h-4 w-4" />
            {errors.propertyAddress.message}
          </p>
        )}
      </div>

      <div className="card">
        <Label
          htmlFor="contact-number"
          className="text-base font-semibold text-foreground flex items-center gap-2"
        >
          <Phone className="h-4 w-4 text-muted-foreground" />
          Contact Number
        </Label>
        <Input
          id="contact-number"
          type="tel"
          value={contactNumberValue || ""}
          onChange={(e) => handleContactNumberChange(e.target.value)}
          placeholder="e.g., +9779812345678"
          className="input-field mt-3"
        />
        {errors.contactNumber && (
          <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
            <Info className="h-4 w-4" />
            {errors.contactNumber.message}
          </p>
        )}
      </div>

      <div className="card">
        <Label
          htmlFor="document-type"
          className="text-base font-semibold text-foreground flex items-center gap-2"
        >
          <Upload className="h-4 w-4 text-muted-foreground" />
          Document Type
        </Label>
        <Select
          value={documentType || ""}
          onValueChange={handleDocumentTypeChange}
        >
          <SelectTrigger className="mt-3">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="citizenship">Citizenship</SelectItem>
          </SelectContent>
        </Select>
        {errors.documentType && (
          <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
            <Info className="h-4 w-4" />
            {errors.documentType.message}
          </p>
        )}
      </div>

      {documentType === "passport" && (
        <div className="card">
          <Label
            htmlFor="passport-file"
            className="text-base font-semibold text-foreground flex items-center gap-2"
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            Passport Image
          </Label>
          <Input
            id="passport-file"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="input-field mt-3"
            onChange={(e) => handleFileChange(e, "passport")}
          />
          {passportPreview && (
            <div className="mt-3 relative">
              <img
                src={passportPreview}
                alt="Passport preview"
                className="h-32 w-auto rounded border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile("passport")}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove passport image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {errors.idScanFront && (
            <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
              <Info className="h-4 w-4" />
              {errors.idScanFront.message}
            </p>
          )}
        </div>
      )}

      {documentType === "citizenship" && (
        <>
          <div className="card">
            <Label
              htmlFor="citizenship-front-file"
              className="text-base font-semibold text-foreground flex items-center gap-2"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              Citizenship Front Image
            </Label>
            <Input
              id="citizenship-front-file"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="input-field mt-3"
              onChange={(e) => handleFileChange(e, "citizenshipFront")}
            />
            {citizenshipFrontPreview && (
              <div className="mt-3 relative">
                <img
                  src={citizenshipFrontPreview}
                  alt="Citizenship front preview"
                  className="h-32 w-auto rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile("citizenshipFront")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove citizenship front image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.idScanFront && (
              <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
                <Info className="h-4 w-4" />
                {errors.idScanFront.message}
              </p>
            )}
          </div>
          <div className="card">
            <Label
              htmlFor="citizenship-back-file"
              className="text-base font-semibold text-foreground flex items-center gap-2"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              Citizenship Back Image
            </Label>
            <Input
              id="citizenship-back-file"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="input-field mt-3"
              onChange={(e) => handleFileChange(e, "citizenshipBack")}
            />
            {citizenshipBackPreview && (
              <div className="mt-3 relative">
                <img
                  src={citizenshipBackPreview}
                  alt="Citizenship back preview"
                  className="h-32 w-auto rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile("citizenshipBack")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove citizenship back image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.idScanBack && (
              <p className="error-message mt-2 flex items-center gap-1 text-red-500 text-sm">
                <Info className="h-4 w-4" />
                {errors.idScanBack.message}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}