"use client";

interface ResendProps {
  onClick: () => Promise<void>;
  disabled: boolean;
  countdown: number;
  className?: string;
}

export default function Resend({ onClick, disabled, className }: ResendProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-block ${className}`}
    >
      Resend Code
    </button>
  );
}