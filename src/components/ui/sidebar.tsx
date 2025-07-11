export const SidebarProvider = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return <>{children}</>;
};

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export const Sidebar = ({
  className,
  children,
  isOpen,
  ...props
}: React.ComponentPropsWithoutRef<"nav"> & { isOpen: boolean }) => (
  <nav
    className={cn(
      "flex flex-col h-full border-r bg-background transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-20",
      className
    )}
    {...props}
  >
    {children}
  </nav>
);

export const SidebarContent = ({
  className,
  children,
  isOpen,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { isOpen: boolean }) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto",
      isOpen ? "p-4" : "px-2 py-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const SidebarGroup = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

export const SidebarGroupContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
);

export const SidebarGroupLabel = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h3>
);

export const SidebarMenu = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"ul">) => (
  <ul className={cn("space-y-1", className)} {...props}>
    {children}
  </ul>
);

export const SidebarMenuButton = ({
  className,
  children,
  isActive,
  asChild,
  isOpen,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  isActive?: boolean;
  asChild?: boolean;
  isOpen: boolean;
}) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "flex w-full text-left p-2 rounded-md transition-colors",
        "items-center",
        isOpen ? "justify-start gap-3" : "justify-center",
        "text-gray-700 dark:text-gray-300",
        "hover:bg-primary-hover hover:text-primary-foreground",
        isActive && "bg-primary-hover text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const SidebarMenuItem = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"li">) => (
  <li className={cn("w-full", className)} {...props}>
    {children}
  </li>
);

export const SidebarProfile = ({
  children,
  className,
  isOpen,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { isOpen: boolean }) => (
  <div
    className={cn(
      "p-4 border-t",
      "flex items-center gap-3",
      isOpen ? "justify-between" : "justify-center",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
