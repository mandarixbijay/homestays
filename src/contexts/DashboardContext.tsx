"use client";

import { createContext, useContext, useState } from "react";
import { Building, BookOpen, Calendar, DollarSign, Settings } from "lucide-react";

// Context for sidebar state
interface DashboardContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedMenuItem: string;
  setSelectedMenuItem: (item: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
};

// Menu items for sidebar
export const dashboardMenuItems = [
  {
    title: "Property",
    icon: <Building className="h-5 w-5" />,
    onClick: (setSelectedMenuItem: (item: string) => void) => setSelectedMenuItem("Property"),
  },
  {
    title: "Bookings",
    icon: <BookOpen className="h-5 w-5" />,
    onClick: (setSelectedMenuItem: (item: string) => void) => setSelectedMenuItem("Bookings"),
  },
  {
    title: "Calendar",
    icon: <Calendar className="h-5 w-5" />,
    onClick: (setSelectedMenuItem: (item: string) => void) => setSelectedMenuItem("Calendar"),
  },
  {
    title: "Pricing",
    icon: <DollarSign className="h-5 w-5" />,
    onClick: (setSelectedMenuItem: (item: string) => void) => setSelectedMenuItem("Pricing"),
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    onClick: (setSelectedMenuItem: (item: string) => void) => setSelectedMenuItem("Settings"),
  },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState("Property");

  return (
    <DashboardContext.Provider
      value={{ isSidebarOpen, setIsSidebarOpen, selectedMenuItem, setSelectedMenuItem }}
    >
      {children}
    </DashboardContext.Provider>
  );
}