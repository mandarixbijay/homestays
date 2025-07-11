import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const signinPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

export const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

export const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0:
      return "";
    case 1:
      return "bg-destructive";
    case 2:
      return "bg-orange-400";
    case 3:
      return "bg-yellow-400";
    case 4:
      return "bg-blue-400";
    case 5:
      return "bg-primary";
    default:
      return "bg-muted";
  }
};

export const getStrengthText = (strength: number) => {
  switch (strength) {
    case 0:
      return "";
    case 1:
      return "Very Weak";
    case 2:
      return "Weak";
    case 3:
      return "Medium";
    case 4:
      return "Strong";
    case 5:
      return "Very Strong";
    default:
      return "";
  }
};
