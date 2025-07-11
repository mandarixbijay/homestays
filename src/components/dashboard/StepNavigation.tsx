import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  steps: { title: string; description: string }[];
  currentStep: number;
  handleSectionJump: (stepIndex: number) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  handleSectionJump,
}) => {
  return (
    <nav className="bg-white rounded-2xl shadow-lg p-4 mb-6">
      <ul className="flex flex-wrap gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <li key={index}>
            <Button
              variant={currentStep === index ? "default" : "outline"}
              onClick={() => handleSectionJump(index)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 ${
                currentStep === index
                  ? "bg-teal-100 text-teal-800"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-600"
              } transition-all duration-200 rounded-lg`}
            >
              <span
                className={`h-6 w-6 flex items-center justify-center rounded-full ${
                  currentStep === index ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600"
                } text-xs font-semibold`}
              >
                {index + 1}
              </span>
              {step.title}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};