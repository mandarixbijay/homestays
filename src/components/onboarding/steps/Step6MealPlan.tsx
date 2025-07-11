// components/Step6MealPlan/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Info, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface MealPlan {
  id: string;
  name: string;
  isSelected: boolean;
  price: { value: number; currency: "USD" | "NPR" };
  pax: number;
  description: string;
  images: { url: string; base64: string; isMain: boolean }[];
  isCustom: boolean;
}

interface Step6FormData {
  mealPlans: MealPlan[];
}

export function Step6MealPlan() {
  const { register, formState: { errors }, setValue, watch, trigger } = useFormContext<Step6FormData>();
  const { toast } = useToast();
  const [customInput, setCustomInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const defaultMealPlans: MealPlan[] = [
    { id: crypto.randomUUID(), name: "Breakfast Included", isSelected: false, price: { value: 0, currency: "USD" }, pax: 1, description: "", images: [], isCustom: false },
    { id: crypto.randomUUID(), name: "Half Board", isSelected: false, price: { value: 0, currency: "USD" }, pax: 1, description: "", images: [], isCustom: false },
    { id: crypto.randomUUID(), name: "Full Board", isSelected: false, price: { value: 0, currency: "USD" }, pax: 1, description: "", images: [], isCustom: false },
    { id: crypto.randomUUID(), name: "No Meals", isSelected: false, price: { value: 0, currency: "USD" }, pax: 1, description: "", images: [], isCustom: false },
  ];

  const mealPlans = watch("mealPlans") || defaultMealPlans;

  // Initialize mealPlans if not set
  useEffect(() => {
    if (!watch("mealPlans")?.length) {
      setValue("mealPlans", defaultMealPlans, { shouldValidate: true });
    }
  }, [setValue, watch]);

  const handleAddCustomMealPlan = () => {
    if (!customInput.trim()) {
      setErrorMessage("Invalid input. Please enter a valid meal plan name.");
      return;
    }
    setErrorMessage("");
    const normalizedInput = customInput.trim().toLowerCase();
    const existingPlans = mealPlans.map((plan) => plan.name.toLowerCase());

    if (existingPlans.includes(normalizedInput)) {
      setErrorMessage("This meal plan already exists.");
      toast({
        variant: "destructive",
        title: "Duplicate Meal Plan",
        description: "This meal plan already exists.",
      });
      return;
    }
    if (mealPlans.filter((plan) => plan.isCustom).length >= 10) {
      setErrorMessage("Maximum 10 custom meal plans allowed.");
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "Maximum 10 custom meal plans allowed.",
      });
      return;
    }

    const newMealPlan: MealPlan = {
      id: crypto.randomUUID(),
      name: customInput.trim(),
      isSelected: true,
      price: { value: 0, currency: "USD" },
      pax: 1,
      description: "",
      images: [],
      isCustom: true,
    };

    setValue("mealPlans", [...mealPlans, newMealPlan], { shouldValidate: true });
    setCustomInput("");
    trigger("mealPlans");
    toast({
      title: "Meal Plan Added",
      description: `${customInput.trim()} added successfully.`,
    });
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const updatedMealPlans = [...mealPlans];
    updatedMealPlans[index].isSelected = checked;
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger(`mealPlans.${index}.isSelected`);
  };

  const handleRemoveCustomMealPlan = (index: number) => {
    const planName = mealPlans[index].name;
    const updatedMealPlans = mealPlans.filter((_, i) => i !== index);
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger("mealPlans");
    toast({
      title: "Meal Plan Removed",
      description: `${planName} removed successfully.`,
    });
  };

  const handlePriceChange = (index: number, value: number | string) => {
  const updatedMealPlans = [...mealPlans];
  updatedMealPlans[index].price.value = Number(value) >= 0 ? Number(value) : 0;
  setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
  trigger(`mealPlans.${index}.price.value`);
};

  const handleCurrencyChange = (index: number, currency: "USD" | "NPR") => {
    const updatedMealPlans = [...mealPlans];
    updatedMealPlans[index].price.currency = currency;
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger(`mealPlans.${index}.price.currency`);
  };

const handlePaxChange = (index: number, pax: string) => {
  const updatedMealPlans = [...mealPlans];
  updatedMealPlans[index].pax = parseInt(pax);
  setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
  trigger(`mealPlans.${index}.pax`);
};

  const handleDescriptionChange = (index: number, description: string) => {
    const updatedMealPlans = [...mealPlans];
    updatedMealPlans[index].description = description;
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger(`mealPlans.${index}.description`);
  };

  const handleImageUpload = async (index: number, files: FileList) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const newImages: { url: string; base64: string; isMain: boolean }[] = [];

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Only JPEG, PNG, and GIF images are allowed.",
        });
        continue;
      }
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Image size must be less than 5MB.",
        });
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push({
        url: URL.createObjectURL(file),
        base64,
        isMain: mealPlans[index].images.length === 0 && newImages.length === 0,
      });
    }

    if (newImages.length > 0) {
      const updatedMealPlans = [...mealPlans];
      updatedMealPlans[index].images = [...updatedMealPlans[index].images, ...newImages];
      setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
      trigger(`mealPlans.${index}.images`);
      toast({
        title: "Images Uploaded",
        description: `${newImages.length} image(s) added to ${mealPlans[index].name}.`,
      });
    }
  };

  const handleRemoveImage = (index: number, imageIndex: number) => {
    const updatedMealPlans = [...mealPlans];
    const removedImage = updatedMealPlans[index].images[imageIndex];
    updatedMealPlans[index].images = updatedMealPlans[index].images.filter((_, i) => i !== imageIndex);
    // Set new main image if removed image was main
    if (removedImage.isMain && updatedMealPlans[index].images.length > 0) {
      updatedMealPlans[index].images[0].isMain = true;
    }
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger(`mealPlans.${index}.images`);
    toast({
      title: "Image Removed",
      description: "Image removed from ${mealPlans[index].name}.",
    });
  };

  const handleSetMainImage = (index: number, imageIndex: number) => {
    const updatedMealPlans = [...mealPlans];
    updatedMealPlans[index].images = updatedMealPlans[index].images.map((img, i) => ({
      ...img,
      isMain: i === imageIndex,
    }));
    setValue("mealPlans", updatedMealPlans, { shouldValidate: true });
    trigger(`mealPlans.${index}.images`);
    toast({
      title: "Main Image Set",
      description: "Main image updated for ${mealPlans[index].name}.",
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Meal Plans</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select available meal plans and provide details. Add custom meal plans below (max 10).
        </p>
        <div className="space-y-6">
          {mealPlans.map((plan, index) => (
            <div key={plan.id} className="border border-gray-200 rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`meal-plan-${plan.id}`}
                    checked={plan.isSelected}
                    onCheckedChange={(checked) => handleCheckboxChange(index, !!checked)}
                    className="rounded-md border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`meal-plan-${plan.id}`}
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {plan.name}
                  </Label>
                </div>
                {plan.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomMealPlan(index)}
                    aria-label={`Remove ${plan.name}`}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
              {plan.isSelected && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`price-${plan.id}`}>Price</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`price-${plan.id}`}
                          type="number"
                          min="0"
                          value={plan.price.value}
                          className="rounded-md h-10 text-sm"
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                        />
                        <Select
                          value={plan.price.currency}
                          onValueChange={(value: "USD" | "NPR") => handleCurrencyChange(index, value)}
                        >
                          <SelectTrigger className="w-24 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="NPR">NPR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.mealPlans?.[index]?.price?.value && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <Info className="h-4 w-4" />
                          {errors.mealPlans[index].price.value.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`pax-${plan.id}`}>Guests (Pax)</Label>
                      <Select
                        value={plan.pax.toString()}
                        onValueChange={(value) => handlePaxChange(index, value)}
                      >
                        <SelectTrigger id={`pax-${plan.id}`} className="mt-1 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`description-${plan.id}`}>Description</Label>
                    <Textarea
                      id={`description-${plan.id}`}
                      value={plan.description}
                      placeholder="Describe the meal plan (e.g., includes continental breakfast)..."
                      className="mt-1 rounded-md min-h-[80px] text-sm"
                      maxLength={200}
                      {...register(`mealPlans.${index}.description`, {
                        maxLength: { value: 200, message: "Description cannot exceed 200 characters" },
                        onChange: (e) => {
                          handleDescriptionChange(index, e.target.value);
                        },
                      })}
                    />
                    {errors.mealPlans?.[index]?.description && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        {errors.mealPlans[index].description.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Images</Label>
                    <div className="mt-1">
                      <label
                        htmlFor={`images-${plan.id}`}
                        className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        <span className="text-sm text-gray-600">Upload Images</span>
                        <input
                          id={`images-${plan.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          multiple
                          onChange={(e) => e.target.files && handleImageUpload(index, e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {plan.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {plan.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <div className="relative w-full h-24 rounded-md overflow-hidden">
                              <Image
                                src={image.url}
                                alt={`Meal plan ${plan.name} image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                              {image.isMain && (
                                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">Main</span>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetMainImage(index, imgIndex)}
                                  disabled={image.isMain}
                                  aria-label={`Set as main image for ${plan.name}`}
                                >
                                  <ImageIcon className="h-4 w-4 text-white" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveImage(index, imgIndex)}
                                  aria-label={`Remove image ${imgIndex + 1} from ${plan.name}`}
                                >
                                  <X className="h-4 w-4 text-white" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.mealPlans?.[index]?.images && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        {errors.mealPlans[index].images.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div>
            <Label htmlFor="custom-meal-plan" className="text-base font-semibold text-foreground">
              Add Custom Meal Plan
            </Label>
            <Input
              id="custom-meal-plan"
              value={customInput}
              onChange={(e) => {
                setErrorMessage("");
                setCustomInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomMealPlan();
                }
              }}
              placeholder="e.g., Vegan Breakfast (press Enter to add)"
              className="mt-3 rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10 text-sm"
            />
            {errorMessage && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1" role="alert">
                <Info className="h-4 w-4" />
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}