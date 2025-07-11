export interface OnboardingStep {
  title: string;
  description: string;
  children: React.ReactNode;
}

export interface OnboardingProps {
  title: string;
  description: string;
  steps: OnboardingStep[];
  currentStep: number;
  onStepComplete: (step: number) => void;
  onStepBack?: (step: number) => void;
  logo?: React.ReactNode;
}

export interface StepProps extends OnboardingStep {
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onBack?: () => void;
}