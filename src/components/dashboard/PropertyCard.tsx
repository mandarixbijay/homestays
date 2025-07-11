import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Bed, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

interface PropertyCardProps {
  images: string[];
  name: string;
  location: string;
  rating: number;
  reviews: number;
  refundable: boolean;
  discount?: string;
  left?: number;
  vipAccess: boolean;
  rooms?: { name: string }[];
  facilities?: string[];
  policies?: string[];
  description?: string;
  onEdit: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  images,
  name,
  location,
  rating,
  reviews,
  refundable,
  discount,
  left,
  vipAccess,
  rooms = [],
  facilities = [],
  policies = [],
  description = "No description available",
  onEdit,
}) => {
  const [current, setCurrent] = useState(0);
  const FALLBACK_IMAGE = "/images/fallback-image.png";
  const imgArr = images.length > 0 ? images : [FALLBACK_IMAGE];

  const handlePrev = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? imgArr.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === imgArr.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, direction: "prev" | "next") => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      if (direction === "prev") handlePrev(e);
      else handleNext(e);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto border border-gray-200 rounded-xl bg-white mb-6">
      <div className="flex flex-col lg:flex-row bg-white">
        {/* Image Section */}
        <div className="relative w-full lg:w-[350px] h-[200px] lg:h-[400px] flex-shrink-0 bg-gray-200">
          <div className="relative w-full h-full">
            <Image
              src={imgArr[current]}
              alt={`${name} image ${current + 1}`}
              className="object-cover rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
              fill
              sizes="(max-width: 1024px) 100vw, 350px"
              priority={current === 0}
              loading={current === 0 ? undefined : "lazy"}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            {imgArr.length > 1 && (
              <>
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                  {imgArr.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === current ? "bg-teal-500" : "bg-white/80"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handlePrev}
                  onKeyDown={(e) => handleKeyDown(e, "prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white text-teal-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  onKeyDown={(e) => handleKeyDown(e, "next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-teal-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="absolute top-3 flex flex-col gap-2 left-3 right-3">
              {vipAccess && (
                <Badge className="bg-yellow-400 text-teal-800 font-semibold px-3 py-1 rounded-full text-sm w-fit">
                  <Star className="h-4 w-4 inline mr-1" />
                  VIP Access
                </Badge>
              )}
              {discount && (
                <Badge className="bg-green-500 text-white font-semibold px-3 py-1 rounded-full text-sm w-fit">
                  {discount}
                </Badge>
              )}
              {left && (
                <Badge className="bg-red-500 text-white font-semibold px-3 py-1 rounded-full text-sm w-fit">
                  Only {left} Rooms Left
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Property Overview */}
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{location}</p>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mt-1 leading-tight">
                {name}
              </CardTitle>
              <div className="flex items-center mt-4 gap-4">
                <Badge className="bg-teal-500 text-white text-lg font-semibold px-4 py-1 rounded-full flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {rating}
                </Badge>
                <span className="text-base font-medium text-gray-500">{reviews} Reviews</span>
              </div>
              {refundable && (
                <p className="text-base font-semibold text-green-500 mt-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fully Refundable
                </p>
              )}
              <div className="mt-6">
                <h4 className="text-xl font-bold text-gray-800">Overview</h4>
                <p className="text-base text-gray-600 mt-2 leading-relaxed line-clamp-4">{description}</p>
              </div>
            </div>

            {/* Rooms Section */}
            {rooms.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800">Available Rooms</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {rooms.map((room, i) => (
                    <li key={i} className="text-base text-gray-600 flex items-center gap-2">
                      <Bed className="h-4 w-4 text-teal-500" />
                      {room.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Details Tabs */}
            <div className="mt-6">
              <Tabs defaultValue="facilities" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 mb-4">
                  <TabsTrigger
                    value="facilities"
                    className="text-base font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-teal-500 rounded-lg py-2"
                  >
                    Facilities
                  </TabsTrigger>
                  <TabsTrigger
                    value="policies"
                    className="text-base font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-teal-500 rounded-lg py-2"
                  >
                    Policies
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="facilities" className="mt-2 p-4 bg-gray-100 rounded-xl">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facilities.map((facility, i) => (
                      <li key={i} className="text-base text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="policies" className="mt-2 p-4 bg-gray-100 rounded-xl">
                  <ul className="space-y-2">
                    {policies.map((policy, i) => (
                      <li key={i} className="text-base text-gray-600 flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-teal-500 mt-1" />
                        {policy}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          Action Section
          <div className="flex justify-end mt-8">
            <Button
              onClick={onEdit}
              className="rounded-xl h-12 px-6 bg-primary text-white font-semibold text-base"
            >
              Edit Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};