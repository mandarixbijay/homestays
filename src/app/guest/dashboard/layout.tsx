"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Star,
  Heart,
  DollarSign,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export default function GuestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated or not a guest
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (session?.user?.role && session.user.role !== "GUEST") {
      // Redirect to appropriate dashboard
      if (session.user.role === "HOST") {
        router.push("/host/dashboard");
      } else if (session.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/guest/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/guest/dashboard",
    },
    {
      name: "My Bookings",
      href: "/guest/dashboard/bookings",
      icon: Calendar,
      current: pathname?.startsWith("/guest/dashboard/bookings") || false,
    },
    {
      name: "My Reviews",
      href: "/guest/dashboard/reviews",
      icon: Star,
      current: pathname === "/guest/dashboard/reviews",
    },
    {
      name: "Favorites",
      href: "/guest/dashboard/favorites",
      icon: Heart,
      current: pathname === "/guest/dashboard/favorites",
    },
    {
      name: "Refunds",
      href: "/guest/dashboard/refunds",
      icon: DollarSign,
      current: pathname === "/guest/dashboard/refunds",
    },
    {
      name: "Profile",
      href: "/guest/dashboard/profile",
      icon: User,
      current: pathname === "/guest/dashboard/profile",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a guest
  if (status === "unauthenticated" || (session?.user?.role && session.user.role !== "GUEST")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/logo/logo.png"
                alt="Nepal Homestays"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    item.current
                      ? "bg-[#214B3F]/10 text-[#214B3F] shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#214B3F]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[#214B3F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "Guest"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200/70 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
