"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
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
      fill="#FFFFFF"
      stroke="#FFFFFF"
      strokeWidth="1.5"
    />
    <motion.path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="none"
      stroke="#B0B0B0"
      strokeWidth="0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
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
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeOpacity="0.25"
    />
    <path
      d="M12 2C6.477 2 2 6.477 2 12H6C6 8.686 8.686 6 12 6V2Z"
      fill="#FFFFFF"
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

  // Animation variants with explicit type
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] // Use cubic-bezier for easeOut
      } 
    },
  };

  const starVariants: Variants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.2, 1], 
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } 
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="mt-4 w-[1000px] h-[75px] bg-[#1B4A4A] rounded-xl shadow-sm mx-auto flex items-center justify-between px-6 py-3 overflow-hidden relative"
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white border border-[#1B4A4A] text-[#1B4A4A] hover:bg-gray-100 hover:text-[#1B4A4A] rounded-full p-1.5"
          onClick={onDismiss}
          aria-label="Dismiss sign-in card"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Content */}
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                variants={starVariants}
                initial="initial"
                animate="animate"
              >
                <StarSVG className="w-6 h-6" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1B4A4A] text-white rounded-md p-2 text-xs">
              <p>Log in for exclusive deals!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-sm font-medium text-white line-clamp-1">
          Log in to access exclusive deals and savings!
        </p>
      </div>

      {/* Sign In Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className={`w-auto bg-[#F7E987] hover:bg-[#E6D874] text-[#1B4A4A] px-5 py-2 rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Sign in to unlock discounts"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <SpinnerSVG className="h-4 w-4 text-[#1B4A4A]" />
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}