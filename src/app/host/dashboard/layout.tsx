"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  dashboardMenuItems,
  DashboardProvider,
  useDashboardContext,
} from "@/contexts/DashboardContext";
import Navbar from "@/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    selectedMenuItem,
    setSelectedMenuItem,
  } = useDashboardContext();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Navbar/>
   
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          items={dashboardMenuItems.map((item) => ({
            ...item,
            onClick: () => item.onClick(setSelectedMenuItem),
          }))}
          selectedMenuItem={selectedMenuItem}
        />
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-16"
          } p-4 sm:p-6 lg:p-8`}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
  );
}
