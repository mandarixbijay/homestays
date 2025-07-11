"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Wifi, Car, Bus, Coffee, Utensils, Soup, Waves } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";

interface AmenitiesDialogProps {
  children: React.ReactNode;
}

export default function AmenitiesDialog({ children }: AmenitiesDialogProps) {
  const amenities = [
    {
      icon: Wifi,
      title: "Internet",
      items: [
        "Available in all rooms: Free WiFi",
        "Available in some public areas: Free WiFi",
      ],
    },
    {
      icon: Car,
      title: "Parking",
      items: ["Free self parking on site", "Free valet parking on site"],
    },
    {
      icon: Bus,
      title: "Shuttle",
      items: [
        "24-hour roundtrip airport shuttle on request for a surcharge",
        "Free area shuttle up to 3 km",
        "Guests must contact the property 24 hours prior to arrival for details",
      ],
    },
    {
      icon: Coffee,
      title: "Breakfast",
      items: [
        "Cooked-to-order breakfast for a fee",
        "Served daily from 7:00 AM - 10:30 AM",
        "USD 17 per person",
      ],
    },
    {
      icon: Utensils,
      title: "Food and Drink",
      items: ["A bar/lounge", "A restaurant", "Couples/private dining"],
    },
    {
      icon: Soup,
      title: "Restaurants on Site",
      items: [
        "Tides Restaurant - This beachfront restaurant serves breakfast, brunch, lunch, and dinner.",
        "Guests can enjoy drinks at the bar. A children's menu is available. Happy hour is offered.",
      ],
    },
    {
      icon: Waves,
      title: "Pool",
      items: [
        "2 outdoor pools and 1 children's pool on site",
        "Infinity pool on site",
        "Pool umbrellas available",
      ],
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] pb-10 bg-gray-50 rounded-2xl h-[700px] flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-0 relative shrink-0">
          <DialogTitle className="text-xl font-extrabold text-gray-900 sr-only">
            Property Details
          </DialogTitle>
    
        </DialogHeader>
        <Tabs defaultValue="amenities" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-none bg-gray-50 p-0 border-b border-gray-200 shrink-0">
            <TabsTrigger
              value="amenities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-50 text-base font-semibold py-4 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              Amenities
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-50 text-base font-semibold py-4 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              About
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <TabsContent value="amenities" className="mt-0">
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6">
                  All Property Amenities
                </h3>
                {amenities.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <category.icon className="h-5 w-5 text-amber-500" aria-hidden="true" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h4>
                    </div>
                    <ul className="list-disc list-inside ml-8 text-base text-gray-600 space-y-1">
                      {category.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </TabsContent>
              <TabsContent value="about" className="mt-0">
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6">
                  About the Property
                </h3>
                <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
                  Nestled along a pristine beachfront, this stylish retreat offers a serene escape with modern comforts. Guests can enjoy two outdoor pools, including an infinity pool, and direct access to a private beach. The property features Tides Restaurant, serving a variety of meals with a children’s menu and happy hour specials. With free WiFi, complimentary parking, and a 24-hour airport shuttle (surcharge), this homestay is perfect for travelers seeking relaxation and convenience in a vibrant coastal setting.
                </p>
              </TabsContent>
            </motion.div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}