"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Shield,
  Home
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface UserProfileDropdownProps {
  isMobile?: boolean;
}

const UserProfileDropdown = ({ isMobile = false }: UserProfileDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();

  const userRole = session?.user?.role;
  const userName = session?.user?.name || "Profile";

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get the appropriate dashboard/account link based on role
  const getDashboardLink = () => {
    switch (userRole) {
      case 'HOST':
        return { href: '/host/dashboard', label: 'Host Dashboard', icon: <Home className="h-4 w-4" /> };
      case 'ADMIN':
        return { href: '/admin', label: 'Admin Panel', icon: <Shield className="h-4 w-4" /> };
      case 'COMMUNITY_MANAGER':
        return { href: '/community-manager-dashboard', label: 'Manager Dashboard', icon: <Home className="h-4 w-4" /> };
      case 'GUEST':
      default:
        return { href: '/account', label: 'My Account', icon: <UserCircle className="h-4 w-4" /> };
    }
  };

  const dashboardLink = getDashboardLink();

  if (isMobile) {
    return (
      <div className="w-full">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 py-3 px-4 rounded-lg"
          onClick={toggleExpand}
        >
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            <span>{userName}</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isExpanded && (
          <div className="mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 space-y-2">
            <Link
              href={dashboardLink.href}
              className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3 rounded-md"
              onClick={() => setIsExpanded(false)}
            >
              {dashboardLink.icon}
              <span>{dashboardLink.label}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          <UserCircle className="h-5 w-5" />
          <span>{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 w-48 bg-white dark:bg-gray-800 space-y-1"
      >

        <DropdownMenuItem asChild>
          <Link
            href={dashboardLink.href}
            className="flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-gray-100 mt-5"
          >
            {dashboardLink.icon}
            <span>{dashboardLink.label}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-medium text-red-600 focus:text-red-700 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;