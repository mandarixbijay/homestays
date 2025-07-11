import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({ title, children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-800"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="collapse-content"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-teal-800" />
        ) : (
          <ChevronDown className="h-5 w-5 text-teal-800" />
        )}
      </button>
      <div
        id="collapse-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
};