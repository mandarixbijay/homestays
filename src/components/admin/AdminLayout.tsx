"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  PenTool,
  Tag,
  Folder,
  BarChart3,
  FileText,
  User,
  ChevronRight,
  MapPin,
  Zap,
  Star,
  QrCode,
  UsersRound,
  Building2,
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
  const [masterDataMenuOpen, setMasterDataMenuOpen] = useState(false);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Homestays", href: "/admin/homestays", icon: Home },
    {
      name: "Master Data",
      href: "/admin/master-data",
      icon: Settings,
      menuKey: "masterData",
      subMenu: [
        { name: "Master Data", href: "/admin/master-data", icon: Settings },
        { isSectionLabel: true, name: "Marketing" },
        { name: "Destinations", href: "/admin/destinations", icon: MapPin },
        { name: "Last Minute Deals", href: "/admin/last-minute-deals", icon: Zap },
        { name: "Top Homestays", href: "/admin/top-homestays", icon: Star },
      ],
    },
    { name: "Users", href: "/admin/users", icon: Users },
    {
      name: "Communities",
      href: "/admin/communities",
      icon: Building2,
      menuKey: "community",
      subMenu: [
        { name: "Community Managers", href: "/admin/community-managers", icon: UsersRound },
        { name: "Communities", href: "/admin/communities", icon: Building2 },
      ],
    },
    {
      name: "Campaigns",
      href: "/admin/campaigns",
      icon: QrCode,
      menuKey: "campaign",
      subMenu: [
        { name: "All Campaigns", href: "/admin/campaigns", icon: QrCode },
        { name: "Create Campaign", href: "/admin/campaigns/create", icon: PenTool },
        { name: "Reviews", href: "/admin/campaigns/reviews", icon: Star },
      ],
    },
    {
      name: "Blog",
      href: "/admin/blog",
      icon: FileText,
      menuKey: "blog",
      subMenu: [
        { name: "All Posts", href: "/admin/blog", icon: FileText },
        { name: "Create Post", href: "/admin/blog/create", icon: PenTool },
        { name: "Categories", href: "/admin/blog/categories", icon: Folder },
        { name: "Tags", href: "/admin/blog/tags", icon: Tag },
        { name: "Analytics", href: "/admin/blog/analytics", icon: BarChart3 },
      ],
    },
  ];


  const handleSignOut = () =>
    signOut({ redirect: true, callbackUrl: "/signin?message=AdminSignedOut" });

  if (isLoading || status === "loading") return <div>Loading...</div>;
  if (isAuthenticated && !isAdmin) return <div>Unauthorized</div>;
  if (!isAuthenticated || hasRefreshError) return <div>Loading...</div>;

  const getMenuOpenState = (menuKey?: string) => {
    if (menuKey === "blog") return blogMenuOpen;
    if (menuKey === "masterData") return masterDataMenuOpen;
    if (menuKey === "campaign") return campaignMenuOpen;
    if (menuKey === "community") return communityMenuOpen;
    return false;
  };

  const toggleMenu = (menuKey?: string) => {
    if (menuKey === "blog") setBlogMenuOpen(!blogMenuOpen);
    if (menuKey === "masterData") setMasterDataMenuOpen(!masterDataMenuOpen);
    if (menuKey === "campaign") setCampaignMenuOpen(!campaignMenuOpen);
    if (menuKey === "community") setCommunityMenuOpen(!communityMenuOpen);
  };

  const renderNav = () => (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const isActive = pathname === item.href || (item.subMenu && item.subMenu.some((sub: any) => !sub.isSectionLabel && pathname === sub.href));
        const isExactMatch = pathname === item.href;
        const menuOpen = getMenuOpenState(item.menuKey);

        return (
          <div key={item.name}>
            {item.subMenu ? (
              <>
                <button
                  onClick={() => toggleMenu(item.menuKey)}
                  className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#224240] to-[#2a5350] text-white shadow-lg shadow-[#224240]/20"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-200 group-hover:bg-[#224240]/10"
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {item.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4"
                    >
                      {item.subMenu.map((sub: any, idx: number) => {
                        if (sub.isSectionLabel) {
                          return (
                            <div key={`section-${idx}`} className="pt-3 pb-1 px-3">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {sub.name}
                              </span>
                            </div>
                          );
                        }
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isSubActive
                                ? "bg-[#224240]/10 text-[#224240] border-l-2 border-[#224240] -ml-[2px] pl-[10px]"
                                : "text-gray-600 hover:bg-gray-100 hover:text-[#224240]"
                            }`}
                          >
                            <sub.icon className={`h-4 w-4 ${isSubActive ? "" : "opacity-60 group-hover:opacity-100"}`} />
                            {sub.name}
                            {isSubActive && (
                              <ChevronRight className="h-3 w-3 ml-auto" />
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isExactMatch
                    ? "bg-gradient-to-r from-[#224240] to-[#2a5350] text-white shadow-lg shadow-[#224240]/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  isExactMatch
                    ? "bg-white/20"
                    : "bg-gray-200 group-hover:bg-[#224240]/10"
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.name}
                {isExactMatch && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-2xl border-r border-gray-200">
        {/* Logo Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#224240] via-[#2a5350] to-[#224240] p-6">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12 bg-white rounded-xl shadow-lg overflow-hidden">
                <Image
                  src="/images/logo/logo.png"
                  alt="Homestays Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Homestays</h1>
                <p className="text-xs text-white/70">Admin Portal</p>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || session?.user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user?.email || session?.user?.email || 'admin@homestays.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {renderNav()}

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <ConnectionStatus />
            <button
              onClick={handleSignOut}
              className="group p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            © 2025 Homestays Admin
          </div>
        </div>
      </div>

      {/* Sidebar (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Logo Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#224240] via-[#2a5350] to-[#224240] p-6">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-white rounded-xl shadow-lg overflow-hidden">
                        <Image
                          src="/images/logo/logo.png"
                          alt="Homestays Logo"
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">Homestays</h1>
                        <p className="text-xs text-white/70">Admin Portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* User Profile Card */}
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.name || session?.user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user?.email || session?.user?.email || 'admin@homestays.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {renderNav()}

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <ConnectionStatus />
                  <button
                    onClick={handleSignOut}
                    className="group p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  © 2025 Homestays Admin
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-gradient-to-r from-[#224240] to-[#2a5350] px-4 shadow-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-sm font-bold text-white">
            {title || "Admin Dashboard"}
          </h1>
          <div className="w-8"></div>
        </div>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
