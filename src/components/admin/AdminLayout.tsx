"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  Settings,
  Users,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Wifi,
  WifiOff,
  DockIcon,
  PenTool,
  Tag,
  Folder,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth, useSessionManager } from "@/hooks/useSessionManager";

/* ------------------ Connection Indicator ------------------ */
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  return (
    <span
      className={`flex items-center gap-1 text-sm ${isOnline ? "text-green-600" : "text-red-500"
        }`}
    >
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      {isOnline ? "Online" : "Offline"}
    </span>
  );
};

/* ------------------ Main Layout ------------------ */
const AdminLayout = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const { data: session, status } = useSession();
  const { isAuthenticated, isLoading, isAdmin, user } = useAdminAuth();
  const { hasRefreshError } = useSessionManager();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Homestays", href: "/admin/homestays", icon: Home },
    { name: "Master Data", href: "/admin/master-data", icon: Settings },
    { name: "Users", href: "/admin/users", icon: Users },
    {
      name: "Blog",
      href: "/admin/blog",
      icon: DockIcon,
      subMenu: [
        { name: "Manage Blog", href: "/admin/blog", icon: DockIcon }, // ✅ added
        { name: "Create Blog", href: "/admin/blog/create", icon: PenTool },
        { name: "Tags", href: "/admin/blog/tags", icon: Tag },
        { name: "Categories", href: "/admin/blog/categories", icon: Folder },
        { name: "Analytics", href: "/admin/blog/analytics", icon: BarChart3 },
      ],
    },
  ];


  const handleSignOut = () =>
    signOut({ redirect: true, callbackUrl: "/signin?message=AdminSignedOut" });

  if (isLoading || status === "loading") return <div>Loading...</div>;
  if (isAuthenticated && !isAdmin) return <div>Unauthorized</div>;
  if (!isAuthenticated || hasRefreshError) return <div>Loading...</div>;

  const renderNav = () => (
    <nav className="flex-1 p-4 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <div key={item.name}>
            {item.subMenu ? (
              <>
                <button
                  onClick={() => setBlogMenuOpen(!blogMenuOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" /> {item.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transform transition ${blogMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {blogMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {item.subMenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${pathname === sub.href
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                        >
                          <sub.icon className="h-4 w-4" />
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                <item.icon className="h-5 w-5" /> {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop) */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 shadow-lg">
        <div className="h-16 flex items-center px-4 border-b dark:border-gray-700">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
            Admin Panel
          </span>
        </div>
        {renderNav()}
        <div className="border-t p-4 flex items-center justify-between">
          <ConnectionStatus />
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sidebar (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
              <span className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <LayoutDashboard className="h-6 w-6 text-blue-600" /> Admin
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNav()}
            <div className="border-t p-4 flex items-center justify-between">
              <ConnectionStatus />
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title || "Admin Dashboard"}
          </h1>
          <ConnectionStatus />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
