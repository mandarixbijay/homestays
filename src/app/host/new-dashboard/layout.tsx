"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Star,
  Home,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function HostDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/host/new-dashboard",
      icon: LayoutDashboard,
      current: pathname === "/host/new-dashboard",
    },
    {
      name: "Bookings",
      href: "/host/new-dashboard/bookings",
      icon: Calendar,
      current: pathname?.startsWith("/host/new-dashboard/bookings"),
    },
    {
      name: "Reviews",
      href: "/host/new-dashboard/reviews",
      icon: Star,
      current: pathname === "/host/new-dashboard/reviews",
    },
    {
      name: "Properties",
      href: "/host/new-dashboard/homestays",
      icon: Home,
      current: pathname?.startsWith("/host/new-dashboard/homestays"),
    },
    {
      name: "Refunds",
      href: "/host/new-dashboard/refunds",
      icon: DollarSign,
      current: pathname === "/host/new-dashboard/refunds",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-8 w-8 text-[#214B3F]" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nepal Homestays</h2>
                <p className="text-sm text-gray-600">Host Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.current
                      ? "bg-[#214B3F] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/host/dashboard"
              className="block px-4 py-2 text-sm text-center text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Old Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main>{children}</main>
      </div>
    </div>
  );
}
