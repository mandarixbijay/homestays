"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Info, 
  Clock, 
  LogOut, 
  RefreshCw, 
  Heart, 
  Users,
  XCircle
} from "lucide-react";

interface PoliciesProps {
  refundable: boolean;
}

export default function Policies({ refundable }: PoliciesProps) {
  const policies = [
    {
      title: "Check-in",
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      content: (
        <ul className="text-gray-600 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Check-in: 2:00 PM - anytime
          </li>
          <li className="flex items-center gap-3">
            <Info className="h-4 w-4 text-gray-600" />
            Early check-in subject to availability
          </li>
          <li className="flex items-center gap-3">
            <Badge className="bg-yellow-100 text-gray-800 text-xs font-semibold px-2 py-0.5">
              Fee
            </Badge>
            Early check-in fee may apply
          </li>
        </ul>
      ),
    },
    {
      title: "Check-out",
      icon: <LogOut className="h-5 w-5 text-purple-600" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      content: (
        <ul className="text-gray-600 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Check-out before 11:00 AM
          </li>
          <li className="flex items-center gap-3">
            <Info className="h-4 w-4 text-gray-600" />
            Late check-out subject to availability
          </li>
          <li className="flex items-center gap-3">
            <Badge className="bg-yellow-100 text-gray-800 text-xs font-semibold px-2 py-0.5">
              Fee
            </Badge>
            Late check-out fee may apply
          </li>
        </ul>
      ),
    },
    {
      title: "Cancellation",
      icon: refundable ? <RefreshCw className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />,
      bgColor: refundable ? "bg-green-50" : "bg-red-50",
      borderColor: refundable ? "border-green-100" : "border-red-100",
      content: (
        <ul className="text-gray-600 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            {refundable ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            {refundable ? "Free cancellation up to 24 hours before check-in" : "Non-refundable"}
          </li>
        </ul>
      ),
    },
    {
      title: "Pets",
      icon: <Heart className="h-5 w-5 text-red-600" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      content: (
        <p className="text-gray-600 text-sm flex items-center gap-3">
          <XCircle className="h-4 w-4 text-red-500" />
          No pets allowed
        </p>
      ),
    },
    {
      title: "Children",
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      content: (
        <ul className="text-gray-600 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Children welcome (1 child up to age 11 stays free)
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`
              p-6 rounded-2xl border ${policy.borderColor} ${policy.bgColor} 
              hover:shadow-lg transition-all duration-300
            `}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                {policy.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {policy.title}
              </h3>
            </div>
            
            <div>
              {policy.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}