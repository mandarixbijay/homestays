// src/components/onboarding/steps/Step2PropertyDetails.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, Info, Tag, Star } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface Step2FormData {
  description: string;
  images: {
    file: File | null;
    tags?: string[];
    url: string;
    base64?: string;
    isNew: boolean;
    isMain: boolean;
  }[];
}

interface Step2PropertyDetailsProps {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeImage: (index: number) => void;
  sessionId: string | null;
}

export function Step2PropertyDetails({
  handleImageChange,
  removeImage,
  sessionId,
}: Step2PropertyDetailsProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useFormContext<Step2FormData>();
  const { toast } = useToast();
  const memoizedToast = useMemo(() => toast, []); // Stabilize toast
  const images = watch("images") || [];
  const [tagInput, setTagInput] = useState<string[]>(images.map(() => ""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasFetched = useRef(false); // Prevent multiple fetches

  useEffect(() => {
    console.log("Step2PropertyDetails useEffect triggered with sessionId:", sessionId);
    if (hasFetched.current || !sessionId) {
      setIsLoading(false);
      reset({ description: "", images: [] });
      hasFetched.current = true; // Prevent further runs if no sessionId
      return;
    }
    hasFetched.current = true;

    const fetchStep2Data = async () => {
      try {
        const response = await fetch(`/api/onboarding/step2/${sessionId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          console.warn(`Failed to fetch Step 2 data: ${response.status}`);
          memoizedToast({
            title: "Session Invalid",
            description: "Starting with fresh data for Step 2.",
          });
          reset({ description: "", images: [] });
        } else {
          const data = await response.json();
          console.log("Fetched Step 2 data:", JSON.stringify(data, null, 2));
          const fetchedImages = data.images?.map((img: any) => ({
            file: null,
            tags: img.tags || [],
            url: img.url,
            base64: undefined,
            isNew: false,
            isMain: img.isMain || false,
          })) || [];
          reset({ description: data.description || "", images: fetchedImages });
          setTagInput(fetchedImages.map(() => ""));
          memoizedToast({
            title: "Data Loaded",
            description: "Previous Step 2 data has been loaded.",
          });
        }
      } catch (error) {
        console.error("Error fetching Step 2 data:", error);
        memoizedToast({
          variant: "destructive",
          title: "Fetch Error",
          description: "Failed to load previous data. Starting fresh.",
        });
        reset({ description: "", images: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStep2Data();
  }, [sessionId, reset, memoizedToast]);

  useEffect(() => {
    setTagInput((prev) => {
      const newInputs = new Array(images.length).fill("");
      prev.forEach((input, i) => {
        if (i < newInputs.length) newInputs[i] = input;
      });
      return newInputs;
    });
  }, [images.length]);

  const handleSetMainImage = (imageIndex: number) => {
    setErrorMessage("");
    const updatedImages = images.map((img, idx) => ({
      ...img,
      isMain: idx === imageIndex,
    }));
    setValue("images", updatedImages, { shouldValidate: true });
    trigger("images");
    memoizedToast({
      title: "Main Image Set",
      description: `Image ${imageIndex + 1} set as main image.`,
    });
  };

  const handleTagInputChange = (imageIndex: number, value: string) => {
    setErrorMessage("");
    const newInputs = [...tagInput];
    newInputs[imageIndex] = value;
    setTagInput(newInputs);
  };

  const handleAddTags = (imageIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !tagInput[imageIndex].trim()) {
      if (e.key === "Enter" && !tagInput[imageIndex].trim()) {
        setErrorMessage("Tag cannot be empty.");
        memoizedToast({
          variant: "destructive",
          title: "Invalid Tag",
          description: "Please enter a non-empty tag.",
        });
      }
      return;
    }
    e.preventDefault();
    setErrorMessage("");

    const currentTags = images[imageIndex]?.tags || [];
    if (currentTags.length >= 6) {
      setErrorMessage("Maximum 6 tags allowed per image.");
      memoizedToast({
        variant: "destructive",
        title: "Tag Limit Reached",
        description: "Maximum 6 tags allowed per image.",
      });
      return;
    }

    const newTags = tagInput[imageIndex]
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag && !currentTags.includes(tag))
      .slice(0, 6 - currentTags.length);

    if (newTags.length === 0) {
      setErrorMessage("No new or valid tags provided.");
      return;
    }

    const updatedImages = [...images];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      tags: [...currentTags, ...newTags],
    };

    setValue("images", updatedImages, { shouldValidate: true });
    setTagInput((prev) => {
      const newInputs = [...prev];
      newInputs[imageIndex] = "";
      return newInputs;
    });
    trigger("images");
    memoizedToast({
      title: "Tags Added",
      description: `${newTags.length} tag(s) added to image ${imageIndex + 1}.`,
    });
  };

  const handleRemoveTag = (imageIndex: number, tagIndex: number) => {
    setErrorMessage("");
    const updatedImages = [...images];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      tags: updatedImages[imageIndex].tags?.filter((_, i) => i !== tagIndex) || [],
    };
    setValue("images", updatedImages, { shouldValidate: true });
    trigger("images");
    memoizedToast({
      title: "Tag Removed",
      description: `Tag removed from image ${imageIndex + 1}.`,
    });
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleImageChange(e);
    } catch (error) {
      memoizedToast({
        variant: "destructive",
        title: "Image Selection Error",
        description: error instanceof Error ? error.message : "Failed to select images.",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading session...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <Label htmlFor="description" className="text-lg font-semibold text-gray-900">
          Property Description
        </Label>
        <p className="text-sm text-gray-500 mt-1">Provide a detailed description of your property.</p>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe your property (e.g., cozy, scenic views)..."
          className="mt-3 rounded-md border-gray-200 focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm"
          onBlur={() => trigger("description")}
          aria-describedby="description-error"
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
            <Info className="h-4 w-4" />
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900">Upload Images</Label>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="h-4 w-4" />
            At least 1 image, up to 10, 5MB each. Select one main image. Tags are optional (up to 6 per image).
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center w-full">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 bg-white"
            aria-label="Upload images"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-blue-500 animate-bounce-subtle" />
              <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG (max 5MB)</p>
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleFileInputChange}
            />
          </label>
        </div>
        {errors.images && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
            <Info className="h-4 w-4" />
            {errors.images.message || "Invalid images provided"}
          </p>
        )}
        {errorMessage && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
            <Info className="h-4 w-4" />
            {errorMessage}
          </p>
        )}
        {images.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 animate-slide-up"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={image.base64 || image.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover rounded-md"
                    loading="lazy"
                    onError={() => {
                      memoizedToast({
                        variant: "destructive",
                        title: "Image Error",
                        description: `Image ${index + 1} failed to load.`,
                      });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeImage(index);
                      setTagInput((prev) => prev.filter((_, i) => i !== index));
                      trigger("images");
                    }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-md hover:bg-red-100"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetMainImage(index)}
                    className={`absolute top-2 left-2 bg-white/90 rounded-full p-1.5 shadow-md ${
                      image.isMain ? "bg-yellow-100" : "hover:bg-yellow-100"
                    }`}
                    aria-label={image.isMain ? "Main image" : "Set as main image"}
                  >
                    <Star className={`h-4 w-4 ${image.isMain ? "text-yellow-500" : "text-gray-600"}`} />
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`tags-${index}`} className="text-sm font-medium text-gray-900">
                      Tags (Optional)
                    </Label>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Up to 6 tags
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id={`tags-${index}`}
                      placeholder="Add tags (e.g., bed, view)"
                      value={tagInput[index] || ""}
                      onChange={(e) => handleTagInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleAddTags(index, e)}
                      className="rounded-md border-gray-200 focus:ring-2 focus:ring-blue-500 h-9 text-sm pr-10"
                      aria-describedby={`tags-error-${index}`}
                    />
                    <Tag className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {(image.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(image.tags ?? []).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm hover:bg-blue-200 transition-all duration-200"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(index, tagIndex)}
                            className="rounded-full p-0.5 hover:bg-blue-300"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="h-3 w-3 text-blue-800" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4 text-center">No images selected yet.</p>
        )}
      </div>
    </div>
  );
}