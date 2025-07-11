// src/app/list-your-property/owner-registration/steps/step2/schema.ts
import { z } from "zod";

export const step2Schema = z.object({
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(1000, { message: "Description cannot exceed 1000 characters." })
    .nonempty({ message: "Description is required." }),
  images: z
    .array(
      z.object({
        file: z.instanceof(File).nullable(),
        tags: z.array(z.string()).max(6, { message: "Maximum 6 tags per image." }).optional(),
        url: z.string().url({ message: "Invalid image URL" }).or(z.literal("")), // Allow empty string for new images
        base64: z.string().optional(),
        isNew: z.boolean(),
        isMain: z.boolean(),
      })
    )
    .min(1, { message: "At least one image is required." })
    .max(10, { message: "Maximum 10 images allowed." })
    .refine(
      (images) => images.filter((img) => img.isMain).length === 1,
      { message: "Exactly one image must be marked as main." }
    )
    .refine(
      (images) => images.every((img) => (img.isNew ? img.file !== null : img.url !== "")),
      { message: "New images must have a file, existing images must have a URL." }
    ),
});

export type Step2FormData = z.infer<typeof step2Schema>;