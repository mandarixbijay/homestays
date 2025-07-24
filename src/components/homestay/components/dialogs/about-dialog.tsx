// src/components/homestay/components/dialogs/about-dialog.tsx
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
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AmenitiesDialogProps {
  children: React.ReactNode;
  homestayName: string;
  facilities: string[];
}

export default function AmenitiesDialog({ children, homestayName, facilities }: AmenitiesDialogProps) {
  const amenities = facilities.length > 0 ? facilities : ["No facilities listed"];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-6 bg-white rounded-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-xl font-extrabold text-gray-900">
            {homestayName} Details
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="amenities" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-none bg-white p-0 border-b border-gray-200">
            <TabsTrigger
              value="amenities"
              className="text-base font-semibold py-4 text-gray-600 hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Amenities
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-base font-semibold py-4 text-gray-600 hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities at {homestayName}</h3>
                <ul className="list-disc list-inside text-base text-gray-600 space-y-2">
                  {amenities.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="about" className="mt-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About {homestayName}</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Enjoy a cozy stay at {homestayName} with modern amenities and warm hospitality in {homestayName.split(" ")[0]}, Nepal.
                </p>
              </TabsContent>
            </motion.div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}