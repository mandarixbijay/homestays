"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

// Custom SVG Icons
const ClockSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#1A4A46" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="#1A4A46" strokeWidth="2" />
  </svg>
);

const PlaneSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 4L4 10L10 14L14 20L20 4Z"
      fill="#1A4A46"
      stroke="#1A4A46"
      strokeWidth="2"
    />
  </svg>
);

const DoorOpenSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4H6V20H10M10 12H14V20L18 12V4H10"
      stroke="#1A4A46"
      strokeWidth="2"
    />
  </svg>
);

const DogSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8C10 8 8 10 8 12C8 14 10 16 12 16C14 16 16 14 16 12C16 10 14 8 12 8ZM6 18L4 20M18 18L20 20"
      stroke="#1A4A46"
      strokeWidth="2"
    />
  </svg>
);

const BabySVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" stroke="#1A4A46" strokeWidth="2" />
    <path d="M8 14C8 16 10 18 12 18C14 18 16 14 16 14" stroke="#1A4A46" strokeWidth="2" />
  </svg>
);

const UserSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" stroke="#1A4A46" strokeWidth="2" />
    <path d="M6 20C6 16 8 14 12 14C16 14 18 16 18 20" stroke="#1A4A46" strokeWidth="2" />
  </svg>
);

const CheckCircleSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#1A4A46" strokeWidth="2" />
    <path d="M8 12L10 14L16 8" stroke="#1A4A46" strokeWidth="2" />
  </svg>
);

const InfoSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#1A4A46" strokeWidth="2" />
    <path d="M12 8V8.1M12 12V16" stroke="#1A4A46" strokeWidth="2" />
  </svg>
);

export default function Policies() {
  const policies = [
    {
      title: "Check-in",
      icon: <ClockSVG className="h-5 w-5" />,
      content: (
        <ul className="text-[#B0B0B0] space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Check-in start time: 3:00 PM; Check-in end time: anytime
          </li>
          <li className="flex items-start gap-2">
            <InfoSVG className="h-4 w-4 mt-1" />
            Early check-in subject to availability
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[#F7E987] text-[#1B4A4A] text-xs font-semibold px-2 py-0.5 mt-0.5">
              Fee
            </Badge>
            Early check-in is available for a fee
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Contactless check-in available
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Express check-in available
          </li>
          <li className="flex items-start gap-2">
            <UserSVG className="h-4 w-4 mt-1" />
            Minimum check-in age: 18
          </li>
        </ul>
      ),
    },
    {
      title: "Check-out",
      icon: <ClockSVG className="h-5 w-5" />,
      content: (
        <ul className="text-[#B0B0B0] space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Check-out before noon
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Contactless check-out available
          </li>
          <li className="flex items-start gap-2">
            <InfoSVG className="h-4 w-4 mt-1" />
            Late check-out subject to availability
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[#F7E987] text-[#1B4A4A] text-xs font-semibold px-2 py-0.5 mt-0.5">
              Fee
            </Badge>
            A late check-out fee will be charged
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Express check-out available
          </li>
        </ul>
      ),
    },
    {
      title: "Special Check-in Instructions",
      icon: <PlaneSVG className="h-5 w-5" />,
      content: (
        <div className="text-[#B0B0B0] space-y-2">
          <p className="flex items-start gap-2">
            <InfoSVG className="h-4 w-4 mt-1" />
            This property offers transfers from the airport (surcharges may apply); guests must contact the property with arrival details before travel, using the contact information on the booking confirmation.
          </p>
          <p className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Front desk staff will greet guests on arrival at the property.
          </p>
        </div>
      ),
    },
    {
      title: "Access Methods",
      icon: <DoorOpenSVG className="h-5 w-5" />,
      content: (
        <p className="text-[#B0B0B0] flex items-start gap-2">
          <CheckCircleSVG className="h-4 w-4 mt-1" />
          Staffed front desk
        </p>
      ),
    },
    {
      title: "Pets",
      icon: <DogSVG className="h-5 w-5" />,
      content: (
        <p className="text-[#B0B0B0] flex items-start gap-2">
          <InfoSVG className="h-4 w-4 mt-1" />
          No pets or service animals allowed
        </p>
      ),
    },
    {
      title: "Children and Extra Beds",
      icon: <BabySVG className="h-5 w-5" />,
      content: (
        <ul className="text-[#B0B0B0] space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Children are welcome
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            1 child, up to the age of 11 years, can stay for free if using existing beds when occupying the parent or guardians room
          </li>
          <li className="flex items-start gap-2">
            <Badge className="bg-[#F7E987] text-[#1B4A4A] text-xs font-semibold px-2 py-0.5 mt-0.5">
              Fee
            </Badge>
            Rollaway/extra beds are available for THB 1760 per night
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSVG className="h-4 w-4 mt-1" />
            Free cribs are available on request at the property
          </li>
        </ul>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1B4A4A] mb-8">
          Property Policies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {policies.map((policy, index) => (
            <div
              key={policy.title}
              className="flex flex-col min-h-[200px] py-6 border-t border-[#B0B0B0]"
              role="region"
              aria-labelledby={`policy-${index}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {policy.icon}
                <h3 id={`policy-${index}`} className="text-xl font-bold text-[#1B4A4A]">
                  {policy.title}
                </h3>
              </div>
              <div className="text-sm">{policy.content}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}