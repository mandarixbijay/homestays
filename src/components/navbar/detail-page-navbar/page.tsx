"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import React from "react";

function DetailNav() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-10">
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#overview"
            onClick={(e) => handleNavLinkClick(e, "overview")}
            className={`relative pb-2 ${
              activeSection === "overview"
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-primary transition-colors"
            }`}
          >
            Overview
            {activeSection === "overview" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#about"
            onClick={(e) => handleNavLinkClick(e, "about")}
            className={`relative pb-2 ${
              activeSection === "about"
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-primary transition-colors"
            }`}
          >
            About
            {activeSection === "about" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#rooms"
            onClick={(e) => handleNavLinkClick(e, "rooms")}
            className={`relative pb-2 ${
              activeSection === "rooms"
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-primary transition-colors"
            }`}
          >
            Rooms
            {activeSection === "rooms" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#accessibility"
            onClick={(e) => handleNavLinkClick(e, "accessibility")}
            className={`relative pb-2 ${
              activeSection === "accessibility"
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-primary transition-colors"
            }`}
          >
            Accessibility
            {activeSection === "accessibility" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#policies"
            onClick={(e) => handleNavLinkClick(e, "policies")}
            className={`relative pb-2 ${
              activeSection === "policies"
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-primary transition-colors"
            }`}
          >
            Policies
            {activeSection === "policies" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default DetailNav;
