"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  // Bell,
  UserPlus,
  LogIn,
  // Sun,
  // Moon,
  Menu,
  Shield,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import UserProfileDropdown from "./navbar-component/UserProfileDropdown";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Extend the session user type to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
  }
}

interface NavbarProps {
  hideUserCircle?: boolean;
}

function Navbar({ hideUserCircle = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state for hydration
  const { data: session, status } = useSession();
  const router = useRouter();

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = status === "authenticated";
  const userRole = session?.user?.role;
  const showListProperty = !isLoggedIn || userRole === "HOST";

  // Handle role-based redirect after login - only from specific pages
  React.useEffect(() => {
    if (isLoggedIn && userRole && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      // Only redirect from signin page, and only if not already on correct dashboard
      if (currentPath === '/signin') {
        let redirectPath = '';

        switch (userRole) {
          case 'HOST':
            redirectPath = '/host/dashboard';
            break;
          case 'ADMIN':
            redirectPath = '/admin';
            break;
          case 'GUEST':
            redirectPath = '/account';
            break;
          default:
            return;
        }

        console.log(`[Navbar] Redirecting ${userRole} from signin to ${redirectPath}`);
        router.replace(redirectPath); // Use replace instead of push to avoid back button issues
      }
    }
  }, [isLoggedIn, userRole, router]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toListProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    if (!isLoggedIn) {
      router.push("/list-your-property");
    } else if (userRole === "HOST") {
      router.push("/host/dashboard");
    }
  };

  const toPage = (href: string) => {
    closeMenu();
    router.push(href);
  };

  const navigationItems = [
    ...(showListProperty
      ? [
          {
            label: userRole === "HOST" ? "Dashboard" : "List your property",
            href: userRole === "HOST" ? "/host/dashboard" : "/list-your-property",
            action: toListProperty,
          },
        ]
      : []),
    ...(userRole === "ADMIN"
      ? [
          {
            label: "Admin Panel",
            href: "/admin",
            icon: <Shield className="w-5 h-5 text-muted-foreground mr-2" />,
          },
        ]
      : []),
    { label: "Community Homestays", href: "/community-homestays" },
    { label: "About", href: "/about-us" },
    { label: "Blogs", href: "/blogs" },
    { label: "Support", href: "/contact-support" },
  ];

  // Theme Toggle Components - Commented out for later use
  // const DesktopThemeToggle = () => {
  //   if (!mounted) {
  //     return (
  //       <Button
  //         variant="ghost"
  //         size="icon"
  //         className="hover:bg-primary/10 transition-colors"
  //         disabled
  //       >
  //         <div className="h-6 w-6" />
  //       </Button>
  //     );
  //   }

  //   return (
  //     <Button
  //       variant="ghost"
  //       size="icon"
  //       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  //       className="hover:bg-primary/10 transition-colors"
  //     >
  //       {theme === "dark" ? (
  //         <Sun className="h-6 w-6" />
  //       ) : (
  //         <Moon className="h-6 w-6" />
  //       )}
  //     </Button>
  //   );
  // };

  // const MobileThemeToggle = () => {
  //   if (!mounted) {
  //     return (
  //       <Button
  //         variant="ghost"
  //         size="icon"
  //         className="hover:bg-primary/10 transition-colors"
  //         disabled
  //       >
  //         <div className="h-6 w-6" />
  //       </Button>
  //     );
  //   }

  //   return (
  //     <Button
  //       variant="ghost"
  //       size="icon"
  //       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  //       className="hover:bg-primary/10 transition-colors"
  //     >
  //       {theme === "dark" ? (
  //         <Sun className="h-6 w-6" />
  //       ) : (
  //         <Moon className="h-6 w-6" />
  //       )}
  //     </Button>
  //   );
  // };

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md fixed top-0 left-0 right-0 z-[100] border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={closeMenu}>
          <div className="p-2">
            {mounted && (
              <>
                <Image
                  src="/images/logo/logo.png"
                  alt="Homestay Nepal Logo"
                  width={120}
                  height={120}
                  priority
                  className="w-auto h-14 sm:h-16 dark:hidden"
                />
                <Image
                  src="/images/logo/darkmode_logo.png"
                  alt="Homestay Nepal Logo"
                  width={120}
                  height={120}
                  priority
                  className="w-auto h-14 sm:h-16 hidden dark:block"
                />
              </>
            )}
            {!mounted && (
              <Image
                src="/images/logo/logo.png"
                alt="Homestay Nepal Logo"
                width={120}
                height={120}
                priority
                className="w-auto h-14 sm:h-16"
              />
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-[#214B3F] hover:bg-[#214B3F]/5 transition-all text-sm px-4 py-2 font-medium flex items-center rounded-lg"
                      onClick={item.action || (() => toPage(item.href))}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop User Actions */}
          {!hideUserCircle && (
            <div className="flex items-center gap-4">
              {/* Theme Toggle - Commented out for later use */}
              {/* <DesktopThemeToggle /> */}

              {/* Notification Icon - Commented out for later use */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-primary/10 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800 z-[150]">
                  <div className="p-3">
                    <h4 className="font-medium mb-2 text-sm text-card-foreground">
                      Notifications
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      No new notifications
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu> */}

              {isLoggedIn ? (
                <UserProfileDropdown />
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-700 hover:text-[#214B3F] hover:bg-[#214B3F]/5">
                    <Link href="/signin" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="gap-2 text-sm font-medium bg-[#214B3F] hover:bg-[#1a3d33] text-white shadow-sm">
                    <Link href="/signup" className="flex items-center">
                      <UserPlus className="h-4 w-4" />
                      <span>Register</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-3 lg:hidden">
          {/* Mobile Theme Toggle - Commented out for later use */}
          {/* <MobileThemeToggle /> */}

          <Drawer direction="bottom" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="hover:bg-primary/10 transition-colors"
              >
                <Menu className="h-7 w-7" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] w-full fixed bottom-0 left-0 bg-white/95 dark:bg-gray-900/95 z-[110] rounded-t-2xl shadow-lg flex flex-col">
              <VisuallyHidden>
                <DrawerTitle>Navigation Menu</DrawerTitle>
              </VisuallyHidden>

              {/* Logo - Centered at Top */}
              <div className="flex justify-center py-4 border-b border-gray-200 dark:border-gray-700">
                <Image
                  src="/images/logo/logo.png"
                  alt="Homestay Nepal Logo"
                  width={120}
                  height={120}
                  className="w-auto h-12"
                />
              </div>

              {/* Navigation Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {navigationItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action || (() => toPage(item.href))}
                      className="text-base font-medium text-card-foreground hover:text-primary hover:bg-muted transition-all duration-200 py-3 px-4 rounded-lg flex items-center"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Actions - Fixed Bottom */}
              {!hideUserCircle && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  {/* Notification Button - Commented out for later use */}
                  {/* <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-all duration-200">
                    <div className="relative">
                      <Bell className="h-5 w-5 text-primary" />
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      Notifications
                    </span>
                  </button> */}

                  {isLoggedIn ? (
                    <UserProfileDropdown isMobile />
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full h-11 text-sm font-medium gap-2 border-[#214B3F] text-[#214B3F] hover:bg-[#214B3F]/5"
                      >
                        <Link
                          href="/signin"
                          className="flex items-center justify-center"
                          onClick={closeMenu}
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Sign In</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        className="w-full h-11 text-sm font-medium gap-2 bg-[#214B3F] hover:bg-[#1a3d33] text-white"
                      >
                        <Link
                          href="/signup"
                          className="flex items-center justify-center"
                          onClick={closeMenu}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Register</span>
                        </Link>
                      </Button>
                    </div>
                  )}

                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full text-sm font-medium text-card-foreground hover:text-primary transition-all duration-200"
                    >
                      Close
                    </Button>
                  </DrawerClose>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
