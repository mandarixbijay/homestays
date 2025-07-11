// components/Step4RoomInformation/components/WizardProgress.tsx
interface Step {
  id: string;
  title: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex-1 text-center text-sm font-medium py-2 px-3 rounded-md transition-colors ${
            index <= currentStep ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {step.title}
        </div>
      ))}
    </div>
  );
}