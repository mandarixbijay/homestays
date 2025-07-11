import { Button } from "@/components/ui/button";
import React, { JSX } from "react";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarProfile,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  Sparkles,
  User,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  items: { title: string; icon: JSX.Element; onClick: () => void }[];
  selectedMenuItem: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  items,
  selectedMenuItem,
}) => {
  return (
    <TooltipProvider>
      <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <UISidebar
          isOpen={isSidebarOpen}
          className={cn("h-[calc(100vh-64px)] fixed top-16 z-40")}
        >
          <SidebarContent isOpen={isSidebarOpen}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      {!isSidebarOpen ? (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              isActive={selectedMenuItem === item.title}
                              onClick={item.onClick}
                              asChild
                              isOpen={isSidebarOpen}
                            >
                              <div className="flex items-center">
                                {React.cloneElement(item.icon, {
                                  className: cn(
                                    item.icon.props.className,
                                    "text-current flex-shrink-0"
                                  ),
                                })}
                                <span
                                  className={cn(
                                    "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                                    isSidebarOpen
                                      ? "opacity-100 w-auto ml-3"
                                      : "opacity-0 w-0 ml-0"
                                  )}
                                >
                                  {item.title}
                                </span>
                              </div>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md shadow-lg"
                          >
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <SidebarMenuButton
                          isActive={selectedMenuItem === item.title}
                          onClick={item.onClick}
                          asChild
                          isOpen={isSidebarOpen}
                        >
                          <div className="flex items-center">
                            {React.cloneElement(item.icon, {
                              className: cn(
                                item.icon.props.className,
                                "text-current  flex-shrink-0"
                              ),
                            })}
                            <span
                              className={cn(
                                "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                                isSidebarOpen
                                  ? "opacity-100 w-auto ml-3"
                                  : "opacity-0 w-0 ml-0"
                              )}
                            >
                              {item.title}
                            </span>
                          </div>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarProfile
                isOpen={isSidebarOpen}
                className={cn(
                  "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                  isSidebarOpen
                    ? "justify-between"
                    : "justify-center items-center"
                )}
              >
                <img
                  src="/placeholder-avatar.png"
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full"
                />
                {isSidebarOpen && (
                  <>
                    <div className="flex-1 overflow-hidden transition-all duration-300 ease-in-out opacity-100 w-auto">
                      <p className="font-semibold text-sm whitespace-nowrap">
                        Mountain View
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        moutview@gmail.com
                      </p>
                    </div>
                    <ChevronDown className="h-5 w-5 transition-opacity flex-shrink-0 opacity-100" />
                  </>
                )}
              </SidebarProfile>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-56 p-2 bg-white border rounded-md shadow-lg z-50"
            >
              <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold">
                Mount View
              </DropdownMenuLabel>
              <DropdownMenuItem className="px-2 py-1 text-sm text-gray-500">{`moutview@gmail.com`}</DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex items-center gap-2 px-2 py-1  hover:bg-gray-100 cursor-pointer">
                <User className="h-4 w-4" /> Account
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 px-2 py-1  hover:bg-gray-100 cursor-pointer text-red-500">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </UISidebar>
      </SidebarProvider>
    </TooltipProvider>
  );
};
