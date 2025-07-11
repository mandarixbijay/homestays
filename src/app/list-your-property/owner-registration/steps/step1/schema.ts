// src/app/list-your-property/owner-registration/steps/step1/schema.ts
import { z } from "zod";

export const step1Schema = z.object({
  propertyName: z.string().min(3, "Property name must be at least 3 characters").max(100),
  propertyAddress: z.string().min(1, "Address is required").max(255),
  contactNumber: z
    .string()
    .regex(/^\+\d{9,15}$/, "Enter a valid phone number (e.g., +9779801169431)")
    .min(1, "Phone number is required"),
  documentType: z.enum(["passport", "citizenship"]).optional(),
  idScanFront: z.union([z.instanceof(File), z.string().url().optional()]).optional(),
  idScanBack: z.union([z.instanceof(File), z.string().url().optional()]).optional(),
});