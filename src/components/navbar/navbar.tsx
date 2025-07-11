"use client";

import Image from "next/image";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  LogIn,
  Sun,
  Moon,
  Menu,
  X, // Added for close icon
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import UserProfileDropdown from "./navbar-component/UserProfileDropdown";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface NavbarProps {
  hideUserCircle?: boolean;
}

function Navbar({ hideUserCircle = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoggedIn = status === "authenticated";
  const userRole = session?.user?.role;

  // Debug logs
  console.log("Session:", session, "Status:", status, "User Role:", userRole);
  console.log("Theme:", theme);
  console.log("Is Menu Open:", isMenuOpen);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleListPropertyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/list-your-property");
    }
  };

  const showListProperty = !isLoggedIn || userRole === "host";

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 fixed top-0 left-0 right-0 z-[100] h-16">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <Link href="/" className="flex items-center">
          <div className="p-2">
            <Image
              src={"/images/logo/logo.png"}
              alt="Homestay Nepal Logo"
              className=""
              width={80} // Reduced size
              height={80} // Reduced size
              priority
            />
          </div>
        </Link>

        <div className="flex items-center">
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="gap-4">
              {showListProperty && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Button variant="ghost" onClick={handleListPropertyClick}>
                      List your property
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost">
                    <Link href="/blogs">Blogs</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost">
                    <Link href="/contact-support">Support</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost">
                    <Link href="/about-us">About</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {!hideUserCircle && (
            <div className="hidden md:flex items-center gap-4 ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                {/* <DropdownMenuContent align="end" className="w-80 z-[100]">
                  <div className="p-2">
                    <h4 className="font-medium mb-2">Notifications</h4>
                    <div className="space-y-2">
                      <DropdownMenuItem className="flex flex-col items-start p-2 rounded-md">
                        <p className="font-medium">New Booking Request</p>
                        <p className="text-sm text-gray-500">Notification 1</p>
                        <p className="text-xs text-gray-400">2 minutes ago</p>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </DropdownMenuContent> */}
              </DropdownMenu>

              {isLoggedIn ? (
                <UserProfileDropdown />
              ) : (
                <Button asChild variant="ghost" className="gap-2">
                  <Link href="/signin" className="flex items-center">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen} direction="top">
          <DrawerContent className="h-[100vh] w-full fixed top-0 left-0 bg-white dark:bg-gray-900">
            <DrawerHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold">Menu</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-6 w-6" /> {/* Changed to close icon */}
                </Button>
              </div>
            </DrawerHeader>
            <div className="p-6">
              <NavigationMenu>
                <NavigationMenuList className="flex flex-col items-start gap-6">
                  {showListProperty && (
                    <NavigationMenuItem className="w-full">
                      <NavigationMenuLink
                        className="w-full text-lg font-medium hover:text-primary"
                        onClick={handleListPropertyClick}
                      >
                        List your property
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )}
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink
                      className="w-full text-lg font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/blogs">Blogs</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink
                      className="w-full text-lg font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/contact-support">Support</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink
                      className="w-full text-lg font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/about-us">About</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <div className="w-full border-t border-gray-200 pt-6 mt-2">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-medium">Theme</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                      >
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5" />
                        ) : (
                          <Moon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    {/* <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-medium">Notifications</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                          >
                            <Bell className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 z-[100]">
                          <div className="p-2">
                            <h4 className="font-medium mb-2">Notifications</h4>
                            <div className="space-y-2">
                              <DropdownMenuItem className="flex flex-col items-start p-2 rounded-md">
                                <p className="font-medium">
                                  New Booking Request
                                </p>
                                <p className="text-sm text-gray-500">
                                  Notification 1
                                </p>
                                <p className="text-xs text-gray-400">
                                  2 minutes ago
                                </p>
                              </DropdownMenuItem>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div> */}
                    <div className="w-full">
                      {isLoggedIn ? (
                        <UserProfileDropdown />
                      ) : (
                        <Button
                          asChild
                          variant="default"
                          className="w-full gap-2"
                        >
                          <Link
                            href="/signin"
                            className="flex items-center justify-center"
                          >
                            <LogIn className="h-4 w-4" />
                            <span>Sign In</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}

export default Navbar;