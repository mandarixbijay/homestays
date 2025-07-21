"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom SVG for Star Icon
const StarSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="#1B4A4A"
      stroke="#1B4A4A"
      strokeWidth="1.5"
    />
  </svg>
);

// Custom SVG for Loading Spinner
const SpinnerSVG = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="#1B4A4A"
      strokeWidth="4"
      strokeOpacity="0.25"
    />
    <path
      d="M12 2C6.477 2 2 6.477 2 12H6C6 8.686 8.686 6 12 6V2Z"
      fill="#1B4A4A"
    />
  </svg>
);

interface SignInCardProps {
  onDismiss?: () => void;
}

export default function SignInCard({ onDismiss }: SignInCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    router.push("/signin");
  };

  return (
    <div
      className="mt-4 w-full max-w-full sm:max-w-6xl md:max-w-7xl h-[75px] sm:h-[80px] bg-white border border-gray-300 rounded-lg mx-auto flex items-center justify-between px-4 sm:px-6 py-3 overflow-hidden relative"
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-600 rounded-full p-1.5"
          onClick={onDismiss}
          aria-label="Dismiss sign-in card"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Content */}
      <div className="flex items-center gap-3 sm:gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StarSVG className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-600 text-white rounded-md p-2 text-xs">
              <p>Log in for exclusive deals!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
          Log in to access exclusive deals and savings!
        </p>
      </div>

      {/* Sign In Button */}
      <Button
        variant="ghost"
        onClick={handleSignIn}
        disabled={isLoading}
        className={`text-accent px-4 sm:px-5 py-1.5 sm:py-2 font-medium text-xs sm:text-sm ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Sign in to unlock discounts"
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <SpinnerSVG className="h-4 w-4 text-accent" />
            Signing In...
          </span>
        ) : (
          "Sign in to unlock discounts"
        )}
      </Button>
    </div>
  );
}