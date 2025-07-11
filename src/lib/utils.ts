import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidImageUrl = (url: string): boolean => {
  return typeof url === "string" && (
    url.startsWith("blob:") ||
    url.startsWith("data:image/") ||
    url.startsWith("http")
  );
};   