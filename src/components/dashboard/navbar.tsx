import { useDashboardContext } from "@/contexts/DashboardContext";
import React from "react";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

function Navbar() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    selectedMenuItem,
    setSelectedMenuItem,
  } = useDashboardContext();
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-primary hover:text-primary-hover hover:bg-teal-50"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          Host Dashboard
        </h1>
      </div>
    </header>
  );
}

export default Navbar;
